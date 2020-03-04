# envclass

[![Travis (.com)](https://img.shields.io/travis/com/xfoxfu/envconf?logo=travis&style=flat-square)](https://travis-ci.com/xfoxfu/envconf) ![GitHub](https://img.shields.io/github/license/xfoxfu/envconf?logo=github&style=flat-square)

Directly maps environmental variables to an annotated object with validations.

```typescript
import { envconf, str, num, optional } from "envclass";

const obj = envconf({
  foo: str({ desc: "lorem ipsum" }), // foo maps from FOO
  bar: optional(num()), // bar is optional and maps from BAR
  lorem: { lipsum: str() }, // lorem.lipsum maps from LOREM_LIPSUM
});
```

## License

The MIT License

    Copyright 2020 xfoxfu

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
