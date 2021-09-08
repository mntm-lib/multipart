import { Buffer } from 'buffer';

// Allowed headers rfc7578
export const DISPOSITION = 'content-disposition';
export const TYPE = 'content-type';
export const TRANSFER = 'content-transfer-encoding';

export const TYPE_MIXED = 'multipart/mixed';
export const TYPE_FORM_DATA = 'multipart/form-data';

export const KV_SEPARATOR = ':'.charCodeAt(0);

// Editors draft default name
export const DEFAULT_NAME = 'isindex';

// Solution with regex more clear
export const REGEX_DISPOSITION = /name="(.+?)"(?:;\s*filename="(.+?)")?/i;

// Solution with regex more clear
export const REGEX_TYPE = /([\w-/]+)(?:;\s*encoding=([\w-]+))?(?:;\s*boundary=([\w-]+))?/i;

// 1 7bit + two hyphens
export const BOUNDARY_MIN_LENGTH = 3;

// 70 7bit + two hyphens
export const BOUNDARY_MAX_LENGTH = 72;

// 1 7bit + colon
export const HEADER_MIN_LENGTH = 2;

// 16kib
export const HEADER_MAX_LENGTH = 16384;

// Any size except 0
export const CONTENT_MIN_LENGTH = 0;

export const CR = '\r'.charCodeAt(0);
export const LF = '\n'.charCodeAt(0);
export const MARK = '-'.charCodeAt(0);

export const EMPTY = Buffer.allocUnsafe(0);

export const ENCODING = 'encoding';
export const SPECIAL_ENCODING = '_charset_';
