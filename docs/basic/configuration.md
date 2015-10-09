Configuring js-tools
====================

Basics
------

JS-tools application resides within the global variable namespace called ```app```. This object contains several of 
js-tools public functions, application private variables and js-tools configuration within ```app.config``` object. 

To configure js-tools simply include the following piece of JavaScript code below the line that loads js-tools:

```
<script type="text/javascript">
	app.config.legacy = false;
	app.config.templates = 'Handlebars';
	app.config.baseUrl = '/myapp/';
</script>
```

This will tell js-tools that you don't want to include the support for code written for pre-1.0 js-tools, that you are
going to use Handlebars template engine and that the root URI of your application is ```/myapp/```.

List of configuration options
-----------------------------

- **baseUrl** - *string* - Application's base URL (relative to the website root). Default value is *''*.
- **apiUrl** - *string* - Base URL for application's AJAX calls (relative to the application's base URL). Default value 
is *'api'*.
- **legacy** - *boolean* - Whether your app uses pre-1.0 features or not. Default value is *true* but the new 
applications are highly encouraged to change it to *false*. In the future updates the support for old code will go away,
and this option will be removed too.
- **bootstrap** - *integer* - If you are using Bootstrap library, specify the major version here. The default value is 
*3*.
- **templates** - *string* - The template engine that is used in the project. The default value is *'jQuery.tmpl'* to 
support legacy code, but it is highly recommended to pick another one.
- **catchExceptions** - *boolean* - The framework has the ability to intercept JS exceptions, save them and notify your
code through an event. Set it to *false* if you are not planning on using this functionality. Default value is *true*.

