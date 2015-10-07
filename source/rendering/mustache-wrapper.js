/* Wrapper for Mustache engine. */
(function($, app) {

	app.templateWrapper(
		'Mustache',
		function(templateHtml)
		{
			/* Compiling template */
			Mustache.parse(templateHtml);

			return function(data, filters) {

				var mustacheFilters = {};
				$.each(filters, function(key, fn) {
					mustacheFilters[key] = function() {
						return function(text, render) {
							return fn(render(text), data);
						}
					}
				});

				/* Rendering template */
				var $result = $(Mustache.render(templateHtml, $.extend(data, mustacheFilters)));

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
