/* Wrapper for jQuery.tmpl engine.
*  Note that jQuery.tmpl has been abandoned by jQuery team for a while.*/
(function($, app) {

	var _counter = 0;

	app.templateWrapper(
		'jQuery.tmpl',
		function(templateHtml)
		{
			var name = 'jstools-jquery-tmpl-' + _counter++;

			/* Compiling template */
			$.template(name, templateHtml);

			return function(data, filters) {

				/* Rendering template */
				var $result = $.tmpl(name, $.extend(data, filters));

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
