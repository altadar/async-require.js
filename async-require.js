/**
 * Async Require.js
 * @module ARJS
 */
(function(g,f) {
  var self = {}
  var ARJS = f.call(self, g, self)
  g.AsyncRequireJS = g.AsyncRequireJS || ARJS
  g.ARJS = g.ARJS || ARJS
  g.require = g.require || ARJS.require
})(this, function(global, self) {
  /**
   * @name Url
   * @class
   * @namespace
   * @global
   * @param {string} url - The url to be returned when Url.toString() is called
   * @returns {Url} An instance of Url
   */
  function Url(url) {
    this.toString = function toString() {
      return url
    } 
  }
  /**
   * A method to extract protocol from url
   * @name findProtocol
   * @memberof Url
   * @function
   * @global
   * @param {string} url - The url to extract protocol from
   * @returns {[string]} The extracted protocol, or null
   */
  Url.findProtocol = function findProtocol(url) {
    var tmp1 = url.indexOf('://')
    var tmp2 = url.match(/^[a-zA-Z]+\:/)
    if(tmp1 == -1 && tmp2 == null) {
      return null
    } else {
      return tmp1 != -1 ? url.slice(0, tmp1 + 3) : tmp2
    }
  }
  /**
   * A method to extract pathname from url
   * @name findPathnames
   * @memberof Url
   * @function
   * @global
   * @param {string} url - The url to extract pathname from
   * @param {boolean} removeHost - Wheter to remove host if available, default to true
   * @returns {Array<string>} The extracted pathname
   */
  Url.findPathnames = function findPathmames(url, removeHost) {
    if(arguments.length < 2) {
      removeHost = true
    }
    var protocol = Url.findProtocol(url)
    var pathnames = url.slice(protocol != null ? protocol.length : 0).split('/')
    if(protocol != null && protocol.length > 0 && removeHost) {
      pathnames.shift() // Remove host
    }
    return pathnames
  }
  /**
   * A method to concat urls
   * @name concat
   * @memberof Url
   * @function
   * @global
   * @param {string} base - The base url to extract pathname from
   * @param {Array<string>} ...extra - The extra urls to concatenated into base url
   * @returns {string} The concatenated url
   */
  Url.concat = function concat(base, extra) {
    var protocol = Url.findProtocol(base)
    if(protocol != null) {
      base = base.slice(protocol.length)
    }
    var pathnames = base.split('/')
    var host = (protocol != null && protocol.length > 0) ? pathnames.shift() : null
    
    pathnames = pathnames.join('/').replace(/\/+/g, '/').split('/')
    
    for(var i = 1; i < arguments.length; i++) {
      var concat = { url: arguments[i], pathnames: Url.findPathnames(arguments[i], false) }
      if(Url.findProtocol(concat.url) != null) {
        pathnames = concat.pathnames
        host = pathnames.shift()
        protocol = Url.findProtocol(concat.url)
      } else if(concat.url[0] == '/') {
        pathnames = concat.pathnames.join('/').slice(1).replace(/\/+/g, '/').split('/')
      } else {
        concat.pathnames = concat.pathnames.join('/').replace(/\/+/g, '/').split('/')
        for(var j = 0; j < concat.pathnames.length; j++) {
          var pathname = concat.pathnames[j]
          if(pathname == '..') {
            pathnames.pop()
          } else if(pathname == '.' && concat.pathnames.length > j + 1) {
            pathnames.pop()
            pathnames.push(concat.pathnames[++j])
          } else if(pathname.length > 0) {
            pathnames.push(pathname)
          }
        }
      }
    }
    if(host != null && host[host.length - 1] != '/' && pathnames.length > 0) {
      host = host + '/'
    }
    console.log({ protocol, host, pathnames, concat: Array.prototype.slice.call(arguments, 1) })
    
    return (protocol != null ? protocol : '') + (host != null ? host : '') + pathnames.join('/').replace(/\/+/g, '/')
  }
  
  /**
   * Shorthand for CDN
   * @enum
   * @private
   * @constant
   */
  var CDNShortHand = {
    unpkg: 'https://unpkg.com/',
    jsdelivr: 'https://cdn.jsdelivr.net/npm/'
  }
  /**
   * Async Require configuration
   * @namespace
   * @property {Array<string>} baseURL - The base urls
   * @property {Array<string>} cdnURL - The cdn url
   * @private
   */
  var config = {
    baseURL: [location.origin, location.pathname],
    cdnURL: []
  }
  /**
   * Async Require cache
   * @namespace
   */
  var cache = {
    'ar:url': Url
  }
  
  /**
   * A method to require url
   * @name requireURL
   * @memberof ARJS
   * @function
   * @global
   * @param {string} url - The absolute url to require
   * @returns {(Promise<function>|Promise<JSON>)} The required/imported module
   */
  this.requireURL = function requireURL(url) {
    return fetch(url)
    .then(function(res) {
      if(res.redirected) {
        return { job: 'redirect', res: res }
      } else if(url.split('/').pop().split('.').pop() == 'json' || (res.headers.has('content-type') && /(?:(?:application)|(?:text))\/json/.test(res.headers.get('content-type')))) {
        return { job: 'json', res: res }
      } else if(res.status < 400) {
        return { job: 'code', res: res }
      } else {
        return { job: 'error', res: res, error: new Error('Output isn\t a redirect, json, or string') }
      }
    })
    .then(function(res) {
      switch(res.job) {
        case 'redirect':
        case 'code': return res.res.text().then(function(code) {
          return self.load(res.res.url, code)
        })
        case 'json': return res.res.json()
        case 'error': throw res.error
      }
    })
  }
  
  /**
   * A method to load {code} and save it to cache as {key}
   * @name load
   * @memberof ARJS
   * @function
   * @global
   * @param {string} key - The key/url that are used as key in cache
   * @param {string} code - The javascript code to load
   * @returns {(Promise<function>|Promise<JSON>)} The required/imported module
   */
  this.load = function load(key, code) {
    return eval(
      '(function(global) {\n' +
      '  var module = { exports: {} }\n' +
      '  var exports = module.exports\n' +
      '  return (async function(require, ARJS) {\n' +
      code +
      '  })(ARJS.require, undefined)\n' +
      '  .then(function() { return module })\n' +
      '  .catch(function(error) {\n' +
      '    error.stack = error.stack.split(\'\\n\')\n' +
      '    var index = error.stack[1].indexOf(\'<anonymous>\')\n' +
      '    var rowCol = error.stack[1].slice(index != -1 ? index + 12 : 0).slice(0, -1).split(\':\')\n' +
      '    error.stack[1] = \'    at ' + key + '\' + (Number(rowCol[0]) - 4) + \':\' + rowCol[1]\n' +
      '    error.stack = error.stack.join(\'\\n\')\n' +
      '    throw error\n' +
      '  })\n' +
      '})(this)'
    )
    .then(function(module) {
      cache[key] = module.exports
      return module.exports
    })
  }
  
  function fixURL(url) {
    if(url[0] == '.' || url[0] == '/' || url.indexOf('..') == 0) {
      return Url.concat.apply(Url, config.baseURL.concat(url))
    } else if(url[0] == ':') {
      return url.slice(1)
    } else if(url.indexOf('cache:') == 0) {
      url = url.slice(6)
      if(url.length == 0) {
        return url
      } else {
        return fixURL(url)
      }
    } else if(url.indexOf('ar:') == 0) {
      return url
    } else if(url.indexOf('text:') == 0) {
      return fixURL(url.slice(5))
    } else {
      if (Array.isArray(config.cdnURL) && config.cdnURL.length > 0) {
        return Url.concat.apply(Url, config.cdnURL.concat(url))
      } else {
        return null
      }
    }
  }
  
  /**
   * A method to require dependency
   * @name require
   * @memberof ARJS
   * @function
   * @global
   * @param {string} url - The relative url, absolute url, or dependency to require
   * @returns {(Promise<function>|Promise<JSON>)} The required/imported module
   */
  this.require = function require(url) {
    var $url = url
    url = fixURL(url)
    if($url == 'cache:') {
      return Promise.resolve(cache)
    } else if($url.indexOf('text:') == 0) {
      return fetch(url).then(function(res) {
        return res.text()
      })
    } else if(url == null) {
      throw new Error('Can\' require library/package `' + $url + '`, reason: no cdn has been set')
    }
    if(url in cache) {
      return Promise.resolve(cache[url])
    } else if($url[0] != ':') {
      return self.requireURL(url)
    } else {
      throw new Error('Can\'t find module ' + url)
    }
  }
  this.require.arjs = true
  this.require.setAlias = function setAlias(alias, url) {
    cache[alias] = cache[fixURL(url)]
    return this
  }
  
  /**
   * A method to set the base url when requiring
   * @name setBaseURL
   * @memberof ARJS
   * @function
   * @global
   * @param {string} url - The base url
   * @returns {ARJS}
   */
  this.setBaseURL = function setBaseURL(url) {
    config.baseURL = Array.prototype.slice.call(arguments)
    return this
  }
  
  /**
   * A method to set the CDN used when requiring
   * @name setCDN
   * @memberof ARJS
   * @function
   * @global
   * @param {(jsdelivr|unpkg|string)} url - The base url
   * @returns {ARJS}
   */
  this.setCDN = function setCDN(cdn) {
    if(cdn.toLowerCase() in CDNShortHand) {
      config.cdnURL = [CDNShortHand[cdn.toLowerCase()]]
    } else {
      config.cdnURL = Array.prototype.slice.call(arguments)
    }
    return this
  }
  
  this.Url = Url
  return Object.assign(Object.create(null), this)
})