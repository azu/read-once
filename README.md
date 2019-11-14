# read-once

read-once objects for sensitive data.

## Purpose

* Its main purpose is to facilitate detection of unintentional use.
* It represents a sensitive value or concept.
* It’s often a domain primitive.
* Its value can be read once, and once only.
* It prevents serialization of sensitive data.
* It prevents subclassing and extension.

Quote from [Secure by Design](https://learning.oreilly.com/library/view/secure-by-design/9781617294358/).


## Modules

- `ReadOnce`: It allow to read at once
- `NoSerializedValue`: It disallow to serialize value that is marked as secret.

## Install

Install with [npm](https://www.npmjs.com/):

    npm install read-once

## Usage

```js
import { SensitiveValue } from "read-once"
const value = new SensitiveValue("secret");
// Read once 
assert.strictEqual(value.value, "secret");
// When read twice, throw an ReferenceError
assert.throws(() => {
    value.value;
}, ReferenceError);
```

## References

- [Chapter 5: Domain primitives - Secure by Design](https://learning.oreilly.com/library/view/secure-by-design/9781617294358/c05.xhtml)

## Changelog

See [Releases page](https://github.com/azu/read-once/releases).

## Running tests

Install devDependencies and Run `npm test`:

    npm test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/azu/read-once/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- [github/azu](https://github.com/azu)
- [twitter/azu_re](https://twitter.com/azu_re)

## License

MIT © azu
