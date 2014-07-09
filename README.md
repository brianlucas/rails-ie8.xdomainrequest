rails-ie8.xdomainrequest 
========================

Allow Rails web applications to make AJAX requests (with PUT/DELETE/GET/POST) in IE8 using jQuery

Originally forked from https://github.com/MoonScript/jQuery-ajaxTransport-XDomainRequest

========================

Usage

======================== 
Front-end:

Place ie8.domainrequest.js inside your javascript directory and include it in your application.


Rails application:

Inside your Rails application, the following steps are necessary:

1. Download the rack-methodoverride-with-params gem

gem 'rack-methodoverride-with-params'

2. Inside application.rb, include the following

  # overridewithparams to allow IE8 support ?_method= in url when posting JSON data
  config.middleware.use Rack::MethodOverrideWithParams

3. If using HTTP Basic-Auth (optional), place the following inside your controller

  if params['x-authorization'] # IE8 will use this to authenticate as it cannot pass custom headers
    @email, @password = ::Base64.decode64(params['x-authorization'].split(' ', 2).last ||
'').split(':') 
  end

Testing:
All jQuery HTTP requests will either be GET or POSTed with _method parameters included to indicate proper VERB action transparently. 