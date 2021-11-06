import type { Buffer } from 'buffer';

import {
  BOUNDARY,
  BOUNDARY_END,
  LINE,
  SEPARATOR
} from './const.js';

import { extname } from 'path';
import { default as mime } from 'mime';

export type FormDataSimple = Record<string, string | number | {
  filename: string;
  content: Buffer;
}>;

/**
 * FormData stringifier.
 *
 * @param form - data to stringify
 * @returns stringified to multipart/form-data
 */
export const formStringify = (form: FormDataSimple) => {
  let result = BOUNDARY;

  for (const name in form) {
    result += LINE;

    const value = form[name];

    if (typeof value === 'object') {
      const ext = extname(value.filename).slice(1);
      const type = mime.getType(ext) || 'application/octet-stream';

      result += `content-disposition: form-data; name="${name}"; filename="${value.filename}"${LINE}content-type: ${type}${SEPARATOR}${value.content.toString('binary')}`;
    } else {
      result += `content-disposition: form-data; name="${name}"${SEPARATOR}${value}`;
    }

    result += LINE;
    result += BOUNDARY;
  }

  if (result === BOUNDARY) {
    return null;
  }

  result += BOUNDARY_END;

  return result;
};
