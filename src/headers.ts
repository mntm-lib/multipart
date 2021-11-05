import type { Buffer } from 'buffer';

import { stringify } from './utils.js';

import {
  DEFAULT_NAME,
  DISPOSITION,
  KV_SEPARATOR,
  REGEX_DISPOSITION,
  REGEX_TYPE,
  TRANSFER,
  TYPE,
  TYPE_FORM_DATA,
  TYPE_MIXED
} from './const.js';

export type FormDataHeaders = {
  name: string;
  mime?: string;
  filename?: string;
  encoding?: string;
  transfer?: string;
};

/**
 * FormData headers parser.
 * Works well even with very bad data.
 *
 * @param buf - buffers containing raw headers
 * @returns parsed headers
 */
export const formHeaders = (buf: Buffer[]) => {
  const headers: FormDataHeaders = {
    name: DEFAULT_NAME
  };

  buf.forEach((raw) => {
    const sep = raw.indexOf(KV_SEPARATOR);

    if (sep === -1) {
      return;
    }

    const key = stringify(raw.slice(0, sep));

    if (DISPOSITION === key) {
      // Stringify is unsafe for disposition due to case-sensitive fields
      const value = raw.slice(sep + 1).toString('utf8');

      const exec = REGEX_DISPOSITION.exec(value);

      if (exec === null || exec.length === 0) {
        return;
      }

      const name = exec[1];

      if (name != null) {
        headers.name = name;
      }

      const filename = exec[2];

      if (filename != null) {
        headers.filename = filename;
      }

      return;
    }

    if (TYPE === key) {
      // Boundary is case-sensitive but we omit it
      const value = stringify(raw.slice(sep + 1));

      const exec = REGEX_TYPE.exec(value);

      if (exec === null || exec.length === 0) {
        return;
      }

      const mime = exec[1];

      if (mime != null) {
        headers.mime = mime;
      }

      const encoding = exec[2];

      if (encoding != null) {
        headers.encoding = encoding;
      } else {
        const boundary = exec[3];

        if (boundary != null && (mime === TYPE_MIXED || mime === TYPE_FORM_DATA)) {
          headers.mime = TYPE_FORM_DATA;
        }
      }

      return;
    }

    if (TRANSFER === key) {
      const value = stringify(raw.slice(sep + 1));

      headers.transfer = value;
    }
  });

  return headers;
};
