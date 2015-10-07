/* This service provides functions for working with forms. Two main pieces are form validation and data collection.
*
*  To access service functions, first create a form object:
*
*  var form = services.form() to access all form elements within the controller or var form = services.form(selector)
*  to restrict selection.
*
*  Method form.validate() allows you to validate data entered by the user, either using data-required attributes
*  or 'validation.test' event handlers.
*
*  <input type="text" data-required="value" />
*
*  or
*
*  services.events({ 'input.first-name': { 'validation.test': this.validateName }});
*
*  Method form.collect() allows to collect the data from the form elements.
*/
(function($, app) {

	/* Built-in validators */
	var _validationFunctions = {

		/* The element is not empty */
		value: function($source) {
			if ($.trim($source.val()) == '') {
				return 'This field cannot be empty.';
			}
		},

		/* The element (checkbox) is checked */
		checked: function($source) {
			if (!$source.prop('checked')) {
				return 'This should be checked';
			}
		},

		/* The element contains a valid email */
		email: function($source) {
			if (!/^[\+0-9a-zA-Z\-\.\_]+@([0-9a-zA-Z\-]+\.)+[0-9a-zA-Z]+$/.test($source.val())) {
				return 'Please enter a valid email address';
			}
		},

		url: function($source) {
			if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test($source.val())) {
				return 'Please enter a valid URL';
			}
		},

		/* The element contains a valid 5-digit zip code */
		zip: function($source) {
			if (!/^[0-9]{5}$/.test($source.val())) {
				return 'Please enter a valid zip code';
			}
		},

		/* The element contains integer value */
		integer: function($source) {
			if (!/^[0-9]+$/.test($source.val())) {
				return 'Please enter an integer value';
			}
		},

		/* The element contains decimal value */
		decimal: function($source) {
			if (!/^[0-9]*(\.)?[0-9]+$/.test($source.val())) {
				return 'Please enter a numeric value';
			}
		}
	};

	app.service('form', function($element, services) {

		/**
		 * Verifies if the checkbox/radio control is visible. Supports 'fancy' controls, where actual checkbox is always
		 * hidden and only label is displayed
		 *
		 * @param  $el  Checkbox/redio control element
		 * @private
		 */
		var _isCheckboxVisible = function($el) {
			if ($el.is(':visible')) {
				return true;
			}
			var $parent = $el.parent();
			if ($parent.hasClass('checkbox') || $parent.hasClass('radio')) {
				return $parent.is(':visible');
			}
			return false;
		};

		/* Default method for displaying validation errors. Being called if no handlers are attached to
		 * validation.invalid event */
		var _displayError = function($input, message, showMessage) {
			var $parent = $input.parents('.control-group, .validation-group, .form-group');
			$input.addClass('invalid');
			if (showMessage) {
				$parent.addClass('invalid');
				var $errors = $parent.find('.errors').html('');
				if (typeof message == 'string') {
					message = [message];
				}
				$.each(message, function(idx, messageText) {
					$errors.append(
						$('<label/>')
							.html(messageText)
							.addClass('label')
							.addClass('label-important label-danger')
					);
				});
				$errors.show();
			}
		};

		/* Default method for clearing validation errors. Being called if no handlers are attached to
		 * validation.clear event */
		var _clearError = function($input) {
			var $parent = $input.parents('.control-group, .validation-group, .form-group');
			$input.removeClass('invalid');
			$parent.removeClass('invalid');
			$parent.find('.errors').html('');
		};

		/* Triggers the event consequently:
		*   - For the element that is being validated
		*   - For the app object
		*   - If no handlers have processed the event, the defaultCallback argument is used */
		var _triggerEventsChain = function($input, type, args, defaultCallback) {
			if ($input.triggerHandler(type, args) !== true) {
				args.splice(0, 0, $input);
				if ($(app).triggerHandler(type, args) !== true) {
					defaultCallback.apply(null, args);
				}
			}
		};

		/*
		 * Validates a single input element.
		 */
		var _validateInput = function($input, showMessage) {

			/* No validation for hidden or disabled elements */
			if ($input.is(':visible') && !$input.prop('disabled')) {

				/* Firing 'validation.test' event to perform the validation. The event handler must call event.setError
				 * if the validation fails. */
				var testEvent = $.Event('validation.test', {
					setError: function (message) {
						this.stopImmediatePropagation();
						this.error = message;
					},

					error: null
				});
				$input.trigger(testEvent);

				/* If the error was set by one of the handlers, fire 'validation.invalid' event. Otherwise,
				 * 'validation.clear'. */
				if (testEvent.error) {
					_triggerEventsChain(
						$input,
						'validation.invalid',
						[testEvent.error, showMessage],
						_displayError
					);
					return false;
				}
				else {
					_triggerEventsChain(
						$input,
						'validation.clear',
						[],
						_clearError
					);
					return true;
				}
			}
			return true;
		};

		/* Attaching validation event handler to the elements with 'data-require' attribute. */
		$('body').on('validation.test', '[data-required]', function(event) {
			var $source = $(event.target);
			var required = $source.data('required').split('|');
			var type = required[0];
			var options = required.slice(1);
			var test = _validationFunctions[type];

			var optionsMap = {};
			$.each(options, function(idx, option) {
				if (option.indexOf(':') == -1) {
					optionsMap[option] = true;
				}
				else {
					var pair = option.split(':');
					optionsMap[pair[0]] = pair[1];
				}
			});

			if (test) {
				var val = $source.val();
				if (typeof optionsMap['empty'] == 'undefined' || val != '') {
					if (typeof optionsMap['min'] !== 'undefined') {
						if (val.length < parseInt(optionsObj['min'])) {
							event.setError('This field should have at least ' + optionsObj['min'] + ' symbols.');
							return;
						}
					}
					if (typeof optionsMap['max'] !== 'undefined') {
						if (val.length > parseInt(optionsObj['max'])) {
							event.setError('This field should have maximum ' + optionsObj['max'] + ' symbols.');
							return;
						}
					}
					var result = test($source, optionsMap);
					if (result) {
						var message = $source.data('message');
						event.setError(message || result);
						return;
					}
				}
			}
		});

		/* Attaching event handlers to invoke validation on the focus or content changes */
		services.events({
			'input, textarea': {
				focus: function($source) {
					_validateInput($source, false);
				},
				keyup: function($source) {
					_validateInput($source, false);
				},
				blur: function($source) {
					_validateInput($source, true);
				}
			},
			'select': {
				change: function($source) {
					_validateInput($source, true);
				},
				focus: function($source) {
					_validateInput($source, false);
				}
			}
		});

		/* This function creates a new form object attached either to the controller's DOM node or to it's child
		 * specified as parameter. */
		var form = function(form) {

			var $form = typeof form == "string"
				? $(form)
				: (form || $element);

			return {
				/* Performs validation of all inputs within the form. */
				validate: function() {
					var result = true;
					$form.find('input, textarea, select').each(function(idx, element){
						result = _validateInput($(element), true) && result;
					});
					if (!result) {
						$form.find('input.invalid,select.invalid').first().focus();
					}
					return result;
				},

				/* Clears all validation errors */
				clear: function() {
					$form.find('input, textarea, select').each(function(idx, input){
						_triggerEventsChain(
							$(input),
							'validation.clear',
							[],
							_clearError
						);
					});
				},

				/* Displays validation errors (to handle server-side validation) */
				display: function() {
					var errors;
					if (arguments.length == 2)
					{
						errors = {};
						errors[arguments[0]] = arguments[1];
					}
					else
					{
						errors = arguments[0];
					}

					$.each(errors, function(name, message) {
						var $input = $('[name="' + name + '"]');
						_triggerEventsChain(
							$input,
							'validation.invalid',
							[message, true],
							_displayError
						);
					});
				},

				/* Collects data from all inputs inside the form */
				collect: function(list) {
					var data = {};
					$form.find('input[type="text"], input[type="email"], input[type="password"], select, textarea, input[type="hidden"]').each(
						function(idx, el) {
							var $el = $(el);
							if (($el.is(':visible') && !$el.prop('disabled')) || $el.attr('type') == 'hidden') {
								data[$el.attr('name')] = el.value;
							}
						}
					);
					$form.find('input[type="checkbox"],input[type="radio"]').each(function(idx, el) {
						var $el = $(el);
						if (_isCheckboxVisible($el) && $el.prop('checked') && !$el.prop('disabled')) {
							var name = $el.attr('name');
							if (name.indexOf('[]') == name.length - 2 && name.length > 2) {
								name = name.substr(0, name.length - 2);
								if (typeof data[name] == 'undefined') {
									data[name] = [];
								}
								data[name].push(el.value);
							}
							else {
								data[name] = el.value;
							}
						}
					});
					if (typeof list != 'undefined') {
						var filtered = {};
						$.each(list, function(idx, key) {
							filtered[key] = data[key] || '';
						});
						return filtered;
					}
					return data;
				}
			};
		};

		/* Adds additional project-specific validation rules */
		form.addRules = function (rules) {
			$.extend(_validationFunctions, rules);
		};

		return form;
	});
})(jQuery, app);
