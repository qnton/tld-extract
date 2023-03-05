# qnton-tld-extract

`qnton-tld-extract` is a simple npm package that allows you to extract the top-level domain (TLD), domain, and subdomain from a given URL.

## Installation

You can install the `qnton-tld-extract` package using npm:

```bash
npm install qnton-tld-extract
```

## Usage

To use the `qnton-tld-extract` package, you can import it in your **JavaScript** or **TypeScript** code:

```js
const parseUrl = require('qnton-tld-extract');

const url = 'https://www.example.com/';

const result = parseUrl(url);

console.log(result);
// Output: { tld: 'com', domain: 'example.com', sub: 'www' }
```

Or if you're using **TypeScript**:

```ts
import parseUrl from 'qnton-tld-extract';

const url = 'https://www.example.com/';

const result = parseUrl(url);

console.log(result);
// Output: { tld: 'com', domain: 'example.com', sub: 'www' }
```

By default, parseUrl extracts the TLD, domain, and subdomain from the given URL. You can also extract the TLD, domain, and subdomain from just the hostname of a URL using the parse_host function:

```js
const { parse_host } = require('qnton-tld-extract');

const host = 'www.example.com';

const result = parse_host(host);

console.log(result);
// Output: { tld: 'com', domain: 'example.com', sub: 'www' }
```

The parse_host function accepts an optional ParseOptions object that allows you to configure how the host is parsed. The available options are:

### Private TLDs

Private TLDs are supported, see [chromium source code for specs](https://chromium.googlesource.com/chromium/src/+/master/net/tools/tld_cleanup/tld_cleanup.cc)

```js
console.log(parser('http://www.example.com'));
// Output:  { tld : 'com', domain : 'example.com', sub : 'www' };

console.log(parser('http://www.example.com', { allowPrivateTLD: true }));
// Output: { tld : 'example.com', domain : 'www.example.com', sub : '' };
```

### Unknown TLDs (level0)

By default, unknown TLD throw an exception, you can allow them and use tld-extract as a parser using the `allowUnknownTLD` option

```js
  parse("http://nowhere.local")
    >> throws /Invalid TLD/

  parse("http://nowhere.local", {allowUnknownTLD : true})
    >> { tld : 'local', domain : 'nowhere.local', sub : '' }

```

### DotLess domain

Using a tld as a direct domain name, or [dotless domain](https://en.wikipedia.org/wiki/Top-level_domain#Dotless_domains) is highly not recommended (ICANN and IAB have spoken out against the practice, classifying it as a security risk among other concerns. ICANN's Security and Stability Advisory Committee (SSAC) additionally claims that SMTP "requires at least two labels in the FQDN of a mail address" and, as such, mail servers would reject emails to addresses with dotless domains), and will throw an error in `tld-extract`. You can override this behavior using the `allowDotlessTLD` option.

```js
  parse("http://notaires.fr")
    >> throws /Invalid TLD/

  parse("http://notaires.fr", {allowDotlessTLD : true}))
    >> { tld : 'notaires.fr', domain : 'notaires.fr', sub : '' }

```

## Credits

- [131](https://github.com/131)
- [mfpopa](https://github.com/mfpopa)
