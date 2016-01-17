# request-cache
A tiny abstract request caching class.

## Manual
* [Installation](#installation)
* [Example](#example)
* [Class: cache.RequestCache(options)](#class-requestcache)
    * [rc.handle(options)](#rchandleoptions)
    * [rc.resolve(requestId, response)](#rcresolve)

### Installation
This module uses `class`es, spreading, `let`, generators etc. so depending on your Node version you may need `--harmony` or `--es_staging`.
```shell
npm i --save request-cache
```

### Example

```js
var Cache = require('request-cache').RequestCache;

var cacheOptions = {
    defaultTimeout: 3e4, // After 30 seconds, all requests will resolve with an error object
    defaultCacheTimeout: 1e3, // Keep requests in cache for 1s after the first one is resolved
    renewable: true, // Renew the cache timeout with every new request
    defaultRequestHandler: () => { return new Promise(r => r()) } // Will be overwritten if one is passed to the handle method
}

var cache = new Cache(options);

var requestOptions = {
    requestId: '/image.jpg', // Identify request by requestId
    cacheTimeout: 2e3, // Cache for 2s after response is received
    renewable: true, // Renew cache timeout after every new request with this id
    requestHandler: () => { return new Promise(r => r()) }, // A promise that will resolve with a response object
    responseHandler: response => { return 'ok' }, // A function that will handle the response object
    requestHandlerArguments: [] // Arguments that will be passed to the requestHandler function
};

var request = cache.handle(requestOptions);

request.then(console.log); // Will log the response

```

### Class: cache.RequestCache(options)
This creates an index to store request handlers and resolve them when the response of the first request is available.

Options:
* `defaultTimeout`: (Optional) Time in `ms` after which the requests will be resolved with an error object. By default, no timeout is set.
```js
{ error: 'Request timed out' }
```
* `defaultCacheTimeout`: (Optional) Time in `ms` that it takes for a request to be deleted from the index after it has been resolved. By default, no timeout is set.
* `renewable`: (Optional) Can be `true` or `false`. Whether or not to renew the cache timeout on the arrival of new requests. Default: `false`.
* `defaultRequestHandler`: (Optional) An `async function` or a `function` that returns a `Promise` that will be used to handle requests and will resolve with a response object. Will be overwritten if a `requestHandler` is specified in `rc.handle`'s `options`.

### rc.handle(options)
Will pass a request the cache object which will be handled immediately if it is the first of its kind, or will share the response of its predecessors.

Options:
* `requestId`: (Required) This is the request's key in the index. If no `requestId` is specified, an attempt to create one based on the JSON of `requestHandlerArguments` will be made. If `requestHandlerArguments` is an empty `Array` or `undefined`, an error is thrown.
* `timeout`: (Optional) Time in `ms` after which all requests of that id will resolve with an error object as a response. By default, no timeout is set.
```js
{ error: 'Request timed out' }
```
* `cacheTimeout`: (Optional) Time in `ms` that it takes for a request to be deleted from the index after it has been resolved. By default, no timeout is set.
* `renewable`: (Optional) Can be `true` or `false`. Whether or not to renew the cache timeout on the arrival of new requests. Default: `false`.
* `requestHandler`: (Required unless `options.defaultRequestHanler` is set) An `async function` or a `function` that returns a `Promise` that will be used to handle requests and will resolve with a response orbject. Overwrites `defaultRequestHandler` for that request.
* `responseHandler`: (Required) A `function` that will be called with a `response` object once it is produced by the request handler.
* `requestHandlerArguments`: (Optional) Arguments that will be passed to the requestHandler function. Default: `[]`.

### rc.resolve(requestId, response)
This method is used internally when a `requestHandler` resolves with a `response` object or a `timeout` occurs. If neither `functions` get to resolve the request, you can manually call `.resolve(requestId, yourResponseObject)` externally.

### License
(The MIT License)

Copyright (c) 2015 Kosmas Papadatos <kosmas.papadatos@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.