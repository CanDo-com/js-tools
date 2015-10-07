/* Adds a 'localized' version of jQuery function to the controller. */
(function() {
	app.service('$', function($element) {

		/* This function searches for the elements that match selector within the controller's element */
		var local$ = function(selector) {
			var $result = $element.find(selector);
			if ($element.is(selector)) {
				$result = $result.add($element);
			}
			return $result;
		};

		/* A version of $.each that calls the callback function using the controller as the context */
		local$.each = function(array, callback) {
			return $.each(array, $.proxy(callback, app.get($element)));
		};

		return local$;
	});
})(jQuery, app);
