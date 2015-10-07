/* Service that binds controller's methods to DOM or jQuery events */
(function() {
	app.service('events', function($element, services) {
		return function() {
			/* Context object for the event handlers */
			var context = $element.get(0).controller || window;

			/* Target element/object */
			var $target;

			/* Map of elements and events */
			var map;

			if (arguments.length < 2)
			{
				/* If the only argument is the map of selectors/events, then the base target is the $element node */
				map = arguments[0];
				$target = $element;
			}
			else
			{
				/* If there are two arguments, then the first one is the target object/node and the second is the
				 * event map */
				$target = $(arguments[0]);
				map = arguments[1];

				/* If the target element is specified explicitly, the map can contain either the selector as a key and
				 * a map of events as a value or the event as a key and the handler as a value. In the case of the
				 * latter, we are 'normalizing' the map by adding an empty selector as a key. */
				map[''] = {};
				$.each(map, function(selector, value) {
					if (typeof value == 'function' || typeof value == 'string') {
						map[''][selector] = value;
						delete map[selector];
					}
				});
			}

			/* Now, the map is normalized, we iterate through selectors */
			$.each(map, function(selector, value) {

				/* If the event name is not specified, assume it's 'click' event */
				if (typeof value == 'string' || typeof value == 'function') {
					value = {
						click: value
					};
				}

				/* Iterating through events and attaching handlers */
				$.each(value, function(event, method) {

					var handler = function(ev) {

						var $this = $(this);
						var callable;

						/* The handler could be either a function or a name of the controller's method */
						if (typeof method == 'string') {
							callable = $element[0].controller[method];
						}
						else {
							callable = method;
						}

						var args = [].slice.call(arguments);

						/* Element that triggered event will be the first argument passed to the handler. */
						var $this = $(this);
						args.unshift($this);

						/* If the event is triggered by the element that was a part of the template, add a reference to
						* the data passed to the template. */
						ev.data = services.rendering.container($this).data('data');

						/* Calling the handler */
						return callable.apply($element[0].controller, args);
					};

					$target.on(event, selector, handler);
				});
			});
		};
	});
})(jQuery, app);
