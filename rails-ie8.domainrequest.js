/*!
 * ie8.xdomainrequest - v1.00
 * Allow Rails support with _method override and Basic-Auth support
 * https://github.com/brianlucas/rails-ie8.xdomainrequest
 * Copyright (c) 2014 Brian Lucas
 * Originally forked from Jason Moon's https://github.com/MoonScript/jQuery-ajaxTransport-XDomainRequest
 * Licensed MIT (/blob/master/LICENSE.txt)
 */
(function(factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as anonymous module.
    define(['jquery'], factory);
  } else {
    // Browser globals.
    factory(jQuery);
  }
}(function($) {

// Only continue if we're on IE8/IE9 with jQuery 1.5+ (contains the ajaxTransport function)
if ($.support.cors || !$.ajaxTransport || !window.XDomainRequest) {

  return;
}

window.XDomainRequestBusy=false;

var httpRegEx = /^https?:\/\//i;
var getOrPostRegEx = /^get|post$/i;
var sameSchemeRegEx = new RegExp('^'+location.protocol, 'i');

// ajaxTransport exists in jQuery 1.5+
$.ajaxTransport('* text html xml json', function(options, userOptions, jqXHR) {

  // Only continue if the request is: asynchronous, uses GET or POST method, has HTTP or HTTPS protocol, and has the same scheme as the calling page

  if (!options.crossDomain || !options.async || !httpRegEx.test(options.url) || !sameSchemeRegEx.test(options.url)) {

    return;
  }

  var xdr = null;

  return {
    send: function(headers, complete) {

      var postData = '';
      var userType = (userOptions.dataType || '').toLowerCase();
      xdr = new XDomainRequest();
      if (/^\d+$/.test(userOptions.timeout)) {
        xdr.timeout = userOptions.timeout;
      }

      xdr.ontimeout = function() {
        window.XDomainRequestBusy=false;
        complete(500, 'timeout');
      };

      xdr.onload = function() {
        window.XDomainRequestBusy=false;
        var allResponseHeaders = 'Content-Length: ' + xdr.responseText.length + '\r\nContent-Type: ' + xdr.contentType;
        var status = {
          code: 200,
          message: 'success'
        };
        var responses = {
          responseText: xdr.responseText
        };
        try {
          if (userType === 'html' || /text\/html/i.test(xdr.contentType)) {
            responses.html = xdr.responseText;
          } else if (userType === 'json' || (userType !== 'text' && /\/json/i.test(xdr.contentType))) {
            try {
              responses.json = $.parseJSON(xdr.responseText);
            } catch(e) {
              status.code = 500;
              status.message = 'parseerror';
              //throw 'Invalid JSON: ' + xdr.responseText;
            }
          } else if (userType === 'xml' || (userType !== 'text' && /\/xml/i.test(xdr.contentType))) {
            var doc = new ActiveXObject('Microsoft.XMLDOM');
            doc.async = false;
            try {
              doc.loadXML(xdr.responseText);
            } catch(e) {
              doc = undefined;
            }
            if (!doc || !doc.documentElement || doc.getElementsByTagName('parsererror').length) {
              status.code = 500;
              status.message = 'parseerror';
              throw 'Invalid XML: ' + xdr.responseText;
            }
            responses.xml = doc;
          }
        } catch(parseMessage) {
          window.XDomainRequestBusy=false;
          throw parseMessage;
        } finally {
          window.XDomainRequestBusy=false;
          complete(status.code, status.message, responses, allResponseHeaders);
        }
      };

      // set an empty handler for 'onprogress' so requests don't get aborted
      xdr.onprogress = function(){
        window.XDomainRequestBusy=true;
      };
      xdr.onerror = function() {

        window.XDomainRequestBusy=false;
        complete(0, 'error', {
          responseText: xdr.responseText
        });
      };

      if (userOptions.data) {
        postData = ($.type(userOptions.data) === 'string') ? userOptions.data : $.param(userOptions.data);
      }
      
      var buildUrl = function(base, key, value) {
        var sep = (base.indexOf('?') > -1) ? '&' : '?';
        return base + sep + key + '=' + value;
      }

      // The magic where your PUT/DELETE requests are transformed into POST with _method override
      if (!getOrPostRegEx.test(options.type) ) {
        options.url=buildUrl(options.url, '_method', options.type);       

        options.type="POST"
      }
      


      if (headers.Authorization != undefined) {
        options.url=buildUrl(options.url, 'x-authorization', headers.Authorization);        
      }
      
    	if(window.XDomainRequestBusy){

        setTimeout(function(){
          xdr.open(options.type, options.url);
          xdr.send(postData);
      	},100);
      } else {
        window.XDomainRequestBusy=true;
        xdr.open(options.type, options.url);
        xdr.send(postData);
      }
    },
    abort: function() {
      if (xdr) {
        window.XDomainRequestBusy=false;
        xdr.abort();
      }
    }
  };
});

}));