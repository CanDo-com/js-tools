(function($, app) {

	var templateTransformation = function($element) {

		// We don't need to process it if it is detached from the body.
		if ($element.parents('body').length == 0) {
			return;
		}

		// We need to process nested templates first
		$element.find('[data-template]').each(function(idx, el) {
			templateTransformation($(el));
		});

		var controllerElement = $element.closest('[data-controller]').get(0);
		if (controllerElement)
		{
			var templateName = $element.attr('data-template');
			var $placeholder = $("<script />").attr('type', 'text/html');

			if (typeof controllerElement.templates == 'undefined') {
				controllerElement.templates = {};
			}

			$element.replaceWith($placeholder);

			var html;
			if ($element.prop('tagName') == 'SCRIPT') {
				html = $element.html();
			}
			else {
				html = $element.outerHtml();
			}

			controllerElement.templates[templateName] = {
				fn: app.templateWrapper()(html),
				placeholder: $placeholder
			};
		}
	};

	/* Transformation to process and prepare templates */
	app.transformation('[data-template]', templateTransformation);

	/* This will allow to use templates in src attributes without triggering 404 error:
	 * <img data-src="${ user_avatar }" /> */
	app.transformation('img[data-src],audio[data-src],video[data-src]', function($element) {
		if ($element.parents('.rendered').length > 0) {
			$element.attr('src', $element.data('src'));
		}
	});

})(jQuery, app);
