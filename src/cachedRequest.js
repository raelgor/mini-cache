'use strict';

class CachedRequest {
    
    constructor(cacheObject, options) {
        
        this.TIMED_OUT = false;
        this.RESOLVED = false;
        
        this.handlers = [];
        
        this._index = cacheObject._index;
        this._cache = cacheObject;
        
        this.id = options.requestId;
        
        this.renewable = options.renewable;
        this.cacheTimeout = options.cacheTimeout;
        this.timeout = options.timeout;
        
        if(!isNaN(this.timeout)) 
            setTimeout(this._timeoutCallback.bind(this), this.timeout);
        
    }
    
    _timeoutCallback() {
        
        if(this.RESOLVED) return;
        
        this.TIMED_OUT = true;
        this._cache.resolve(this.id, { error: this._cache.WARN_REQ_TIMED_OUT });
                    
    }
    
    _resolveBuffer(){
        
        for(let fn of this.handlers)
            fn(this.RESPONSE);
            
        this.handlers = [];
        this._renew();
        
    }
    
    _push(fn) {
        
        this.handlers.push(fn);
        
        if(this.RESOLVED)
            this._resolveBuffer();
        
    }
    
    _renew() {
               
        // If we don't have a cacheTimeout setting, delete
        // the request synchronously.
        if(isNaN(this.cacheTimeout))
            this._delete();
            
        // If we have a cacheTimeout setting and the request
        // JUST became resolved, schedule a deletion after timeout.
        else if(isNaN(this._cacheTimeoutId)) 
            this._cacheTimeoutId = setTimeout(this._delete.bind(this), this.cacheTimeout);
        
        // If a cacheTimeout is pending and we have a renewable flag,
        // renew that timeout. 
        else {
            clearTimeout(this._cacheTimeoutId);
            this._cacheTimeoutId = setTimeout(this._delete.bind(this), this.cacheTimeout);
        }       
                     
    }
    
    _delete() {
        
        !isNaN(this._cacheTimeoutId) && clearTimeout(this._cacheTimeoutId);
        !isNaN(this._timeoutId) && clearTimeout(this._timeoutId);
        
        delete this._index[this.id];
        
    }
    
}

module.exports = CachedRequest;