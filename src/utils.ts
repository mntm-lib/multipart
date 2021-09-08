/* eslint-disable no-bitwise */

import type { Buffer } from 'buffer';

export const is7bit = (char: number): boolean => {
  return (char & 127) === char;
};

export const is7bitControl = (char: number): boolean => {
  return (char & 31) === char;
};

export const is7bitContent = (char: number): boolean => {
  return is7bit(char) && !is7bitControl(char);
};

export const lowerCase7bit = (char: number): number => {
  if (char >= 65 && char <= 90) {
    return char + 32;
  }

  return char;
};

export const lowerCase = (buf: Buffer): Buffer => {
  const raw = buf.slice();

  raw.forEach(lowerCase7bit);

  return raw;
};

export const stringify = (buf: Buffer): string => {
  return lowerCase(buf).toString('utf8').trim();
};
