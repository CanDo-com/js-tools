The First Controller
====================

```JavaScript
(function ($, app) {

	app.controller('hello-world', function ($element, services) {
	
		return {
		
			init: function() {
				services.events({
					'.btn-hello': this.sayHello
				});
			},
			
			sayHello: function() {
				alert('Hello world!');
			}
		
		};
	
	});

})(jQuery, app);
```

```html
<div data-controller="hello-world">
	<button type="button" class="btn-hello">Click me!</button>
</div>
```
