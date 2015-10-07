/* Wrapper for Underscore.js template engine. */
(function($, app) {

	app.templateWrapper(
		'Underscore.js',
		function(templateHtml)
		{
			/* Compiling template */
			var templateFunction = _.template(templateHtml);

			return function(data, filters) {

				/* Rendering template */
				var $result = $(templateFunction($.extend(data, filters)));

				/* Untangling filters from data */
				$.each(data, function(key, value) {
					if (key.indexOf('$') == 0) {
						delete data[key];
					}
				});

				return $result;
			}
		}
	);

})(jQuery, app);
