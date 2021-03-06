# @mntm/multipart [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/maxi-team/multipart/blob/master/LICENSE)

Probably the fastest most compatible lexer/parser/stringifier for multipart/form-data.

## Usage

If you don't need to parse headers and encoding, use lexer:

```js
import { formLexer } from '@mntm/multipart';

const lexed = formLexer(buffer);
```

Otherwise use parser:

```js
import { formParser } from '@mntm/multipart';

const parsed = formParser(buffer);
```

For stiringify data to multipart/form-data:

```js
import { fromStringify, BOUNDARY } from '@mntm/multipart';

const body = fromStringify({});
```

## Installation

We recommend to use [yarn](https://classic.yarnpkg.com/en/docs/install/) for dependency management:

```shell
yarn add @mntm/multipart
```

## License

@mntm/multipart is [MIT licensed](./LICENSE).
