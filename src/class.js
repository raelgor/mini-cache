'use strict';

const CachedRequest = require('./cachedRequest');

// Creates a request index based on a unique id.
// If similar requests arrive while the first one
// is still being resolved, they will wait and share
// the same response.
class RequestCache {
    
    constructor(options) {
        
        options = options || {};
        
        this.ERR_INVALID_REQH = 'Invalid requestHandler. Must be an async function or return a Promise.';
        this.ERR_INVALID_RESH = 'Invalid responseHandler. Must be an async or regular function.';
        this.ERR_NO_REQ_ID = 'Unable to assign a request ID.';
        this.ERR_RESOLVE_INVALID_REQ_ID = 'resolve was called on non-existent request ID.';
        this.WARN_REQ_TIMED_OUT = 'Request timed out';
        
        if(typeof options.defaultRequestHandler === 'function')
            this._defaultRequestHandler = options.defaultRequestHandler;
            
        if(typeof options.defaultTimeout === 'number')
            this._defaultTimeout = options.defaultTimeout;  
            
        if(typeof options.defaultCacheTimeout === 'number')
            this._defaultCacheTimeout = options.defaultCacheTimeout;  
            
        this._renewable = options.renewable;
         
        this._index = {};
        
    }
    
    handle(options){
        
        var requestId = options.requestId;
        var requestHandler = options.requestHandler;
        var responseHandler = options.responseHandler;
        var requestHandlerArguments = options.requestHandlerArguments;
        
        var renewable = options.renewable !== undefined ? options.renewable : this._renewable;
        var cacheTimeout = options.cacheTimeout || this._defaultCacheTimeout;
        var timeout = options.timeout || this._defaultTimeout;
        
        if(!(typeof responseHandler === 'function'))
            throw new Error(this.ERR_INVALID_RESH);
            
        if(!(typeof requestHandler === 'function') && !this._defaultRequestHandler)
            throw new Error(this.ERR_INVALID_REQH);
        
        requestHandler = requestHandler || this._defaultRequestHandler;
        
        if(!(requestHandlerArguments instanceof Array))
            requestHandlerArguments = 
                requestHandlerArguments === undefined ? [] : [requestHandlerArguments];
            
        if(!requestHandlerArguments.length && !requestId && isNaN(requestId))
            throw new Error(this.ERR_NO_REQ_ID);
            
        if(!requestId && isNaN(requestId))
            requestId = JSON.stringify(requestHandlerArguments);
        
        if(!(requestId in this._index)) {
            
            let handler = requestHandler(...requestHandlerArguments);
            
            if(!(handler instanceof Promise))
                throw new Error(this.ERR_INVALID_REQH);
            
            handler.then(response => 
                this._index[requestId] && 
                !this._index[requestId].TIMED_OUT && 
                this.resolve(requestId, response));
            
            this._index[requestId] = 
                new CachedRequest(this, { timeout, renewable, cacheTimeout, requestId });
            
        }
         
        return new Promise(
            resolve =>
                this._index[requestId]._push(
                    response => 
                        { 
                            
                            let handler = responseHandler(response)
                            
                            if(handler instanceof Promise)
                                handler.then(resolve);
                            else 
                                resolve(response);
                             
                        }
                )
        );
        
    }
    
    resolve(requestId, response){
        
        var request = this._index[requestId];
        
        if(!request)
            throw new Error(this.ERR_RESOLVE_INVALID_REQ_ID);
        
        request.RESOLVED = true;
        request.RESPONSE = response;
        request._resolveBuffer();
        
    }
    
}

module.exports = RequestCache;