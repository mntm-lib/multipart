import type { Buffer } from 'buffer';
import type { Headers } from './headers.js';

import { formHeaders } from './headers.js';
import { formLexer } from './lexer.js';
import { stringify } from './utils.js';

import {
  ENCODING,
  SPECIAL_ENCODING
} from './const.js';

type Result = Record<string, {
  content: Buffer;
  headers: Headers;
}>;

export const formParser = (buf: Buffer) => {
  const parsed = formLexer(buf).map((part) => {
    return {
      content: part.content,
      headers: formHeaders(part.headers)
    };
  });

  const forceEncoding = parsed.findIndex((part) => {
    return part.headers.name === SPECIAL_ENCODING;
  });

  if (forceEncoding !== -1) {
    const encoding = stringify(parsed[forceEncoding].content);

    parsed.forEach((part) => {
      if (!(ENCODING in part.headers)) {
        part.headers.encoding = encoding;
      }
    });
  }

  const result: Result = {};

  parsed.forEach((part) => {
    result[part.headers.name] = part;
  });

  return {
    result,
    raw: parsed
  } as const;
};

