/* Deprecated service for binding events. */
(function() {
	if (app.config.legacy) {
		app.service('bind', function($element, services) {
			return function(map) {
				app.log('"bind" service is deprecated. Use "events" service instead.');
				$.each(map, function(selector, value) {
					if (typeof value == 'string' || typeof value == 'function') {
						value = {
							click: value
						};
					}
					$.each(value, function(event, method) {

						$element.on(event, selector, function(ev) {

							var $this = $(this);
							var callable;

							if (typeof method == 'string') {
								callable = $element[0].controller[method];
							}
							else {
								callable = method;
							}

							var args = [].slice.call(arguments);
							args.unshift(services.rendering.container($this).data('data'));
							args.unshift($this);

							if (typeof $this.data('arg') != 'undefined') {
								args.unshift($this.data('arg'));
							}

							return callable.apply($element[0].controller, args);
						});
					});
				});
			};
		});
	}
})(jQuery, app);
