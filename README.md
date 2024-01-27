# Async Require.js (ARJS)

Async Require.js (ARJS) is a lightweight module loader for asynchronous JavaScript. It provides a simple and flexible way to manage dependencies in your projects.

## Usage

### Basic Example
```javascript
// Set base URL (absolute url)
ARJS.setBaseURL('https://baseurl.com');

// Set CDN (jsdelivr, unpkg, or absolute url)
ARJS.setCDN('jsdelivr');

// Require a module from cdn
ARJS.require('myModule').then((module) => {
  // Module loaded successfully
}).catch((error) => {
  // Handle error
});

// Require a module from relative paths
ARJS.require('./module.js').then((module) => {
  // Module loaded successfully
}).catch((error) => {
  // Handle error
});

// Require a module using absolute url (cors needed)
ARJS.require('https://module-provider.com/module').then((module) => {
  // Module loaded successfully
}).catch((error) => {
  // Handle error
});
```

### Use it to replace ESM usage
- Pros:
  - Can use non-ESM module
- Cons:
  - Can't use ESM modules

init.arjs.js
```javascript
// Load index.js
ARJS.setCDN('jsdelivr').setBaseURL(location.origin).require('/index.js').catch(console.error);
```
index.js
```javascript
// Example using ARJS as an ESM replacement
const $ = await require('jquery');

$('body').click(function() {
  console.log('Body clicked');
});
```

## API Reference
### Configuration
- `setBaseURL(url: string): ARJS`: Sets the base URL for requiring modules.
- `setCDN(cdn: string): ARJS`: Sets the CDN (Content Delivery Network) for loading external libraries.

### Methods
- `requireURL(url: string): Promise<function | JSON>`:` Asynchronously requires a module from a given absolute URL. Automatically parses JSON if the response is in JSON format.
- `load(key: string, code: string): function`: Loads JavaScript code and saves it to the cache as key.
- `require(url: string): Promise<function | JSON>`: Asynchronously requires a module based on a relative or absolute URL.

### CDN Short Hands
- unpkg: https://unpkg.com/
- jsdelivr: string: https://cdn.jsdelivr.net/npm/

### License
Async Require.js is released under the MIT License.

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```