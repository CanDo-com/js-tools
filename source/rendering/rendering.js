(function() {

	/* Built-in rendering filters */
	var _defaultFilters = {

		/* URL for gravatar image */
		$gravatar: function(email, size, id) {
			size = size || 80;
			id = id || 'mm';
			return 'https://secure.gravatar.com/avatar/' + md5(email) + '?s=' + size + '&d=' + id;
		},

		/* Phone formatting */
		$phone: function(phone) {
			if (phone.length != 10) {
				return phone;
			}
			return '(' + phone.substring(0, 3) + ') ' + phone.substring(3, 6) + ' - ' + phone.substring(6);
		},

		/* Date formatting */
		$date: function(date) {
			if (!date) return '';
			if (typeof date != 'object') {
				if (/^[0-9]{4}-[0-9][0-9]-[0-9][0-9]/.test(date)) {
					var t = date.split(/[- :]/);
					date = new Date(t[0], t[1]-1, t[2]);
				}
				else {
					date = new Date(date);
				}
			}
			return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
		},

		$money: function(val) {
			if (val == null) return '';
			return '$' + parseFloat(val).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
		}
	};

	app.service('rendering', function($element) {

		/* Renders the template for one element of the source array */
		var _renderOne = function(template, data, filters) {
			return template.fn(data, $.extend(filters, _defaultFilters))
				.data('data', data)
				.data('filters', filters)
				.data('_renderingTemplate', template)
				.addClass('rendered')
				.removeAttr('data-template');
		};

		/* A shortcut for services.rendering.render() */
		var rendering = function(name, data, filters) {
			return rendering.render(name, data, filters, false);
		};

		$.extend(rendering, {
			/* Renders the template using the provided data */
			render: function(name, data, filters, append) {
				filters = filters || {};
				var template = $element[0].templates[name];

				if (template) {
					var $result = $();

					if (data.constructor === Array) {
						$.each(data, function(idx, item) {
							$result = $result.add(_renderOne(template, item, filters));
						});
					}
					else {
						$result = $result.add(_renderOne(template, data, filters));
					}
					if ($result.length == 0) {
						$result = $("<script />").attr('type', 'text/html');
					}

					$result = app.compile($result);

					if (append) {
						$result.insertAfter(template.placeholder.last());
						template.placeholder = $.merge(template.placeholder, $result);
					}
					else {
						$(template.placeholder.get(0)).replaceWith($result);
						template.placeholder.remove();
						template.placeholder = $result;
					}

					return $result;
				}
			},

			append: function(name, data, filters) {
				this.render(name, data, filters, true);
			},

			partial: function ($element, data, filters) {
				var html;
				if ($element.prop('tagName') == 'SCRIPT') {
					html = $element.html();
				}
				else {
					html = $element.outerHtml();
				}
				var fn = app.templateWrapper()(html);
				return app.compile(fn(data, $.extend(filters, _defaultFilters)));
			},

			/* Re-renders part of the template for one of the elements */
			refresh: function($part, data) {
				$part = this.container($part);
				if (typeof data == 'undefined') {
					data = $part.data('data');
				}
				var template = $part.data('_renderingTemplate');
				var filters = $part.data('filters');
				var $new = _renderOne(template, data, filters);
				template.placeholder.splice(template.placeholder.index($part.get(0)), 1, $new.get(0));
				$part.replaceWith($new);
				return app.compile($new);
			},

			/* Returns the closest parent that was a top element for the template */
			container: function($el) {
				return $el.closest('.rendered');
			}
		});
		return rendering;
	});

})(jQuery, app);
