rails-ie8.xdomainrequest 
========================

Allow Rails web applications to make AJAX requests (with PUT/DELETE/GET/POST) in IE8 using jQuery with `XDomainRequest`.  Also works with Backbone transport.

Originally forked from https://github.com/MoonScript/jQuery-ajaxTransport-XDomainRequest

========================

## Description

# Cross-Domain AJAX for IE8

Implements automatic *Cross Origin Resource Sharing* support using the `XDomainRequest` object for IE8 and IE9 when using the [$.ajax](http://api.jquery.com/jQuery.ajax/) function in jQuery 1.5+.
> **CORS** requires the `Access-Control-Allow-Origin` header to be present in the AJAX response from the server.

In order to use `XDomainRequest` in Internet Explorer, the request must be:
- Only GET or POST
 - When POSTing, the data will always be sent with a `Content-Type` of `text/plain`
- Only HTTP or HTTPS
 - Protocol must be the same scheme as the calling page
- Always asynchronous

## Instructions

With at least jQuery version 1.5, just include the rails-ie8.domainrequest.js inside your javascript directory and include it in your application.script into your page, then make your AJAX call like you normally would:

```JavaScript
// GET
$.getJSON('http://jsonmoon.jsapp.us/').done(function(data) {
  console.log(data.name.first);
});

// POST
$.ajax({
  url: 'http://frozen-woodland-5503.herokuapp.com/cors.json',
  data: 'this is data being posted to the server',
  contentType: 'text/plain',
  type: 'POST',
  dataType: 'json'
}).done(function(data) {
  console.log(data.name.last);
});
```

======================== 

## Rails application

Inside your Rails application, the following steps are necessary:

Download the rack-methodoverride-with-params gem
```ruby
gem 'rack-methodoverride-with-params'
```
Inside application.rb, include the following
```ruby
  # overridewithparams to allow IE8 support ?_method= in url when posting JSON data
  config.middleware.use Rack::MethodOverrideWithParams
```
If using HTTP Basic-Auth (optional), place the following inside your controller
```ruby
  if params['x-authorization'] # IE8 will use this to authenticate as it cannot pass custom headers
    @email, @password = ::Base64.decode64(params['x-authorization'].split(' ', 2).last ||
'').split(':') 
  end
```

## Testing:
All jQuery HTTP requests will either be GET or POSTed with _method parameters included to indicate proper VERB action transparently. 