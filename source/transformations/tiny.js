/* Small transformation that make HTML code prettier and shorter */
(function($, app) {

	/* Transformation for links that are not actual links. Replaces # with javascript:void(0) in href to prevent side
	 * effects. */
	app.transformation('a[href="#"]', function($element) {
		$element.attr('href', 'javascript:void(0);');
	});

	/* These make sense only if Bootstrap library is being used. */
	if (app.config.bootstrap)
	{
		/* Automatically enable tooltips */
		app.transformation('[data-toggle="tooltip"]', function($element) {
			$element.tooltip();
		});

		/* Support for spinning icons on buttons (bootstrap 2 only, requires additional CSS code) */
		if (app.config.bootstrap == 2) {
			var _spinning = '<i class="icon-refresh icon-spin icon-large icon-white"></i> ';
			app.transformation('.btn-loading', function ($element) {
				$element.button();
				if ($element.get(0).tagName == 'INPUT') {
					$element.data('loading-text', _spinning + $element.val());
				}
				else {
					$element.data('loading-text', _spinning + $element.html());
				}
			});
		}

		/* Support for spinning icons on buttons (bootstrap 3 + Font Awesome) */
		if (app.config.bootstrap == 2) {
			var _spinning3 = '<i class="fa fa-spinner fa-spin"></i> ';
			app.transformation('.btn-loading-fa', function ($element) {
				$element.button();
				if ($element.get(0).tagName == 'INPUT') {
					$element.data('loading-text', _spinning3 + $element.val());
				}
				else {
					$element.data('loading-text', _spinning3 + $element.html());
				}
			});
		}
	}

	/* Allows to specify default value for selects: <select data-selected="xyz"> */
	app.transformation('select[data-selected]', function($element) {
		$element.val($element.data('selected'));
	});

	/* Allows to specify default state for checkboxes: <input type="checkbox" data-checked="true"> */
	app.transformation('input[type="checkbox"][data-checked]', function($element) {
		var value = $element.data('checked');
		$element.prop('checked', value == '1' || value == 'true' || value == 'checked');
	});

})(jQuery, app);
