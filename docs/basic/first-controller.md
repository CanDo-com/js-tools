The First Controller
====================

Imagine that we have a following simple piece of HTML and we want the button to trigger an message box saying "Hello 
world".

```html
<div>
	<button type="button" class="btn-hello">Click me!</button>
</div>
```

First, we add ```data-controller``` attribute to bind this element to a controller that will handle the button and the 
message:

```html
<div data-controller="hello-world">
	<button type="button" class="btn-hello">Click me!</button>
</div>
```

Second, we implement the controller, add it to the project and make sure this file is loaded on the page with our 
button.

```JavaScript
(function ($, app) {

	app.controller('hello-world', function ($element, services) {
	
		return {
			_message: 'Hello world!',
		
			init: function() {
				services.events({
					'.btn-hello': this.sayHello
				});
			},
			
			sayHello: function() {
				alert(this._message);
			}
		
		};
	
	});

})(jQuery, app);
```

First and last lines of the code are pretty standard and are used to isolate the code inside from the global namespace.
Now all variables declared or used within will be local unless ```window.``` is explicitly added in front of them.

The next line registers a controller with ID *hello-world* with js-tools application. ```app.controller()``` is the 
function that does it, and it accepts two parameters - the ID of the new controller and the controller factory - i.e. 
the function that can create an instance of a controller when needed.

The controller factory, in turn, also accepts two arguments, the first being a reference to a HTML element the 
controller is bound to (it is a [jQuery elements collection](http://api.jquery.com/jQuery/), hence the '$' prefix in 
'$element'), and the second is a collection of [services](controllers-services-transformations.md) provided to the 
controller by the application.

The sole purpose of the controller factory is to create and return an instance of the controller which, it does with 
```return {.....}``` statement. The instance of the controller is permanently bound to the element it is created for, 
because ```$element``` variable is captured within a 
[JavaScript closure](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures).

Out controller object contains two simple methods:
* ```init``` method is called by js-tools immediately after the controller is created; all initialization code (event 
binding, data loading, rendering, hash change handling etc) should go there. At the moment, this is the only method 
whose name is dictated by js-tools framework. Our controller's code simply binds the button click event to 
```sayHello``` method.
* ```sayHello``` method is pretty much obvious. Please note that js-tools ensures that the controller methods always 
have ```this``` pointed to the controller object itself, no matter how the method was called. 
