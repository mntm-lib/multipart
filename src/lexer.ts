/* eslint-disable sonarjs/elseif-without-else,unicorn/explicit-length-check */

import type { Buffer } from 'buffer';

import { is7bitContent } from './utils.js';

import {
  BOUNDARY_MAX_LENGTH,
  BOUNDARY_MIN_LENGTH,
  CONTENT_MIN_LENGTH,
  CR,
  EMPTY,
  HEADER_MAX_LENGTH,
  HEADER_MIN_LENGTH,
  LF,
  MARK
} from './const.js';

export type FormPart = {
  headers: Buffer[];
  content: Buffer;
};

const enum STATE {
  TRASH,
  SKIP_TRASH,

  MAYBE_BOUNDARY,
  BOUNDARY,

  MAYBE_HEADER,
  HEADER,

  MAYBE_CONTENT,
  CONTENT,

  MAYBE_NEXT,
  NEXT
}

/**
 * FormData lexer with some syntax checks.
 * Works well even with very bad data.
 *
 * @param buf - buffer containing multipart/form-data
 * @returns lexed parts
 */
export const formLexer = (buf: Buffer): FormPart[] => {
  const total = buf.length;

  let current = 0;
  const parts: FormPart[] = [];

  let b = 0;
  let i = 0;

  let char = 0;
  let state: STATE = STATE.TRASH;

  let boundary = EMPTY;

  let boundaryStart = 0;
  let boundaryEnd = 0;
  let boundaryLength = 0;

  let header = EMPTY;

  let headerStart = 0;
  let headerEnd = 0;
  let headerLength = 0;

  let content = EMPTY;

  let contentStart = 0;
  let contentEnd = 0;
  let contentLength = 0;

  let separatorLength = 0;

  const isMark = () => {
    return char === MARK;
  };

  // Determines first valid-like separator and stores its length
  // It is guaranteed to happen once
  const isSeparator = () => {
    if (char === LF) {
      separatorLength = 1;

      return true;
    }

    if (char === CR) {
      b = i + 1;
      if (b < total && buf[b] === LF) {
        i = b;

        separatorLength = 2;

        return true;
      }
    }

    return false;
  };

  const isPartSeparator = () => {
    if (separatorLength === 1) {
      return char === LF;
    }

    if (char === CR) {
      b = i + 1;
      if (b < total && buf[b] === LF) {
        i = b;

        return true;
      }
    }

    return false;
  };

  const isContent = () => {
    return is7bitContent(char);
  };

  const isBoundary = () => {
    b = 2;
    i += 1;

    for (; i < total && b < boundaryLength; ++i, ++b) {
      if (buf[i] !== boundary[b]) {
        break;
      }
    }

    char = buf[i];

    return b === boundaryLength;
  };

  const isEnd = () => {
    if (isMark()) {
      i += 1;

      if (isMark()) {
        return true;
      }
    }

    return false;
  };

  for (; i < total; ++i) {
    char = buf[i];

    switch (state) {
      case STATE.SKIP_TRASH: {
        if (isSeparator()) {
          state = STATE.TRASH;
        }

        continue;
      }
      case STATE.TRASH: {
        if (isMark()) {
          state = STATE.MAYBE_BOUNDARY;
          boundaryStart = i;
        }

        continue;
      }
      case STATE.MAYBE_BOUNDARY: {
        if (isMark()) {
          state = STATE.BOUNDARY;
        } else if (isSeparator()) {
          state = STATE.TRASH;
        } else {
          state = STATE.SKIP_TRASH;
        }

        continue;
      }
      case STATE.BOUNDARY: {
        if (isSeparator()) {
          boundaryEnd = (i - separatorLength) + 1;
          boundaryLength = boundaryEnd - boundaryStart;

          if (
            boundaryLength < BOUNDARY_MIN_LENGTH ||
            boundaryLength > BOUNDARY_MAX_LENGTH
          ) {
            state = STATE.TRASH;
          } else {
            boundary = buf.slice(boundaryStart, boundaryEnd);

            const next = parts.push({
              headers: [],
              content: EMPTY
            });

            current = next - 1;

            state = STATE.MAYBE_HEADER;
          }
        } else if (!isContent()) {
          state = STATE.SKIP_TRASH;
        }

        continue;
      }
      case STATE.MAYBE_HEADER: {
        if (isContent()) {
          headerStart = i;

          state = STATE.HEADER;
        } else {
          state = STATE.SKIP_TRASH;
        }

        continue;
      }
      case STATE.HEADER: {
        if (isPartSeparator()) {
          headerEnd = (i - separatorLength) + 1;
          headerLength = headerEnd - headerStart;

          if (
            headerLength < HEADER_MIN_LENGTH ||
            headerLength > HEADER_MAX_LENGTH
          ) {
            state = STATE.TRASH;
          } else {
            header = buf.slice(headerStart, headerEnd);

            parts[current].headers.push(header);

            state = STATE.MAYBE_CONTENT;
          }
        }

        continue;
      }
      case STATE.MAYBE_CONTENT: {
        if (isPartSeparator()) {
          state = STATE.CONTENT;

          contentStart = i + 1;
        } else if (isContent()) {
          headerStart = i;

          state = STATE.HEADER;
        } else {
          state = STATE.TRASH;
        }

        continue;
      }
      case STATE.CONTENT: {
        if (isPartSeparator()) {
          contentEnd = (i - separatorLength) + 1;
          contentLength = contentEnd - contentStart;

          state = STATE.MAYBE_NEXT;
        }

        continue;
      }
      case STATE.MAYBE_NEXT: {
        if (isMark()) {
          state = STATE.NEXT;
        } else {
          state = STATE.CONTENT;
        }

        continue;
      }
      case STATE.NEXT: {
        if (isMark() && isBoundary()) {
          if (isPartSeparator()) {
            if (contentLength > CONTENT_MIN_LENGTH) {
              content = buf.slice(contentStart, contentEnd);

              parts[current].content = content;
            }

            const next = parts.push({
              headers: [],
              content: EMPTY
            });

            current = next - 1;

            state = STATE.MAYBE_HEADER;

            continue;
          }

          if (isEnd()) {
            if (contentLength > CONTENT_MIN_LENGTH) {
              content = buf.slice(contentStart, contentEnd);

              parts[current].content = content;
            }

            break;
          }
        }

        state = STATE.CONTENT;

        continue;
      }

      // No default
    }
  }

  return parts;
};
