'use strict';

describe('RequestIndex test', () => {
    
    let Cache;
    let cache;
        
    it('should load module without errors', 
        () => Cache = require('./../main').RequestCache);
    
    it('should create an index without errors', 
        () => cache = new Cache());
        
    it('should respond to all with the same number', function(done) {
       
       this.timeout(1e4);
       
        let numOfRequests = 5; 
        let promises = [];
        let timeout = 1e4;
        let cacheTimeout = 1e3;
        let requestHandlerArguments = [4]
        let renewable = true;
        
        let requestHandler = (...args) => 
            {
                return new Promise(resolve => { 
                    setTimeout(() => 
                        resolve(Math.random()*args[0]), Math.random()*1e4);
                });
            }
            
        let responseHandler = response => { return new Promise(resolve => resolve(response)) };

        while(numOfRequests--)
            promises.push(cache.handle({
                requestHandler,
                responseHandler,
                timeout,
                cacheTimeout,
                renewable,
                requestHandlerArguments
            }));
            
        Promise.all(promises).then(responses => {
            
            let first = responses[0];
            
            for(let value of responses)
                if(value !== first)
                    return;
            
            done();
            
        });
        
    });
    
});