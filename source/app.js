/* Main container for js-tools and related application's code */
var app = {};

/* Application object's properties and public methods */
(function($) {

	/* Storing the original application configuration to restore it when app.reset() is called. This is mostly needed
	 * to run the tests */
	var originalConfiguration = app;

	/* Creates a new application object by cloning the initial configuration and extending it */
	var createApplication = function(initialAppObject) {
		var app = {};
		app = $.extend(true, app, initialAppObject);

		/* Application's private fields*/
		app._ = {

			/* A collection of application's controllers */
			controllerFactories: {},

			/* A collection of application's services */
			serviceFactories: {},

			/* A collection of application's transformations */
			transformations: [],

			/* A collection of wrappers for template engines */
			templateWrappers: {}
		};

		/* Default configuration values */
		app.config = $.extend(
			{
				/* Application' base URL (relative to the website root */
				baseUrl: '',

				/* Base URL for application's AJAX calls (relative to the application's base URL) */
				apiUrl: 'api',

				/* Support for the legacy js-tools code */
				legacy: true,

				/* Support for Twitter Bootstrap library (2 to support Bootstrap 2, 3 to support Bootstrap 3) */
				bootstrap: 3,

				/* Template engine to be used */
				templates: 'jQuery.tmpl',

				/* True to catch all exceptions and trigger app:error event */
				catchExceptions: true
			},
			app.config
		);

		/* Application object */
		$.extend(app, {

			/* Last exception that was thrown within the application code */
			lastException: null,

			/* Container for the application's global instances of the services */
			services: {},

			/* Application initialization */
			init: function() {
				var $body = $('body');

				/* Instantiating global services */
				app.services = app.createServices($body);

				/* Adding the transformation that creates controllers.
				 * The reason it is not in the /transformations folder is that it should be called AFTER all other
				 * transformations. */
				app.transformation("[data-controller]", function($element) {
					app.createController($element.get(0));
				});

				/* First round of transformations */
				app.compile($body);

				/* New 'ready' event */
				$(app).triggerHandler('ready');
			},

			/*
			 * Creates a wrapper around a function to make sure that
			 * a) the function will always be executed within the provided context (i.e. within the function 'this' will
			 * 	  always contain the object passed as 'context' parameter and
			 * b) the exception thrown inside the function will be caught and processed by the application
			 */
			wrap: function(fn, context) {
				var wrappedFunction = app.config.catchExceptions
					? function(){
					try {
						return fn.apply(context, arguments);
					}
					catch(e) {
						if (typeof e._stored == 'undefined') {
							e._stored = true;
							app.lastException = e;
							$(app).trigger('error', e);
						}
						throw e;
					}
				}
					: function () {
					return fn.apply(context, arguments);
				};
				wrappedFunction._wrapped = true;
				return wrappedFunction;
			},

			/* Wraps all methods of the given object, using the object as the context. */
			wrapObject: function(obj) {
				for(var key in obj) {
					if (obj.hasOwnProperty(key)
						&& typeof obj[key] == 'function'
						&& typeof obj[key]._wrapped == 'undefined') {

						obj[key] = this.wrap(obj[key], obj);
					}
				}
				return obj;
			},

			/* Registers a new controller with the application.
			 *
			 * Controller is a module that is linked to a certain element on the page and is responsible for the behaviour
			 * of this element. */
			controller: function(name, factory) {
				this._.controllerFactories[name] = factory;
			},

			/* Registers a new service with the application or returns the already registered service.
			 *
			 *  Service is a factory that returns a set of function provided to the controller to help with the routine
			 *  tasks, e.g. rendering templates, processing forms, making AJAX calls etc. */
			service: function(name, factory) {
				if (typeof factory == 'undefined') {
					return this._.serviceFactories[name];
				}
				else {
					this._.serviceFactories[name] = factory;
					return factory;
				}
			},

			/* When called with no arguments, returns the template wrapper specified in the app configuration. When called
			 * with arguments, registers a template wrapper */
			templateWrapper: function(name, wrapper) {
				if (arguments.length == 0) {
					return this._.templateWrappers[app.config.templates];
				}
				this._.templateWrappers[name] = wrapper;
			},

			/* Registers a new transformation with the application.
			 *
			 * Transformation is a function that, well, transforms HTML elements in a certain way. E.g. - all <a href="#">
			 * are being transformed to <a href="javascript:void(0)">
			 */
			transformation: function(selector, fn) {
				this._.transformations.push({
					selector: selector,
					fn: fn
				});
			},

			/* Returns the controller associated with the element, if any. */
			get: function(element) {
				var $el = $(element);
				if ($el.length) {
					return $el.get(0).controller;
				}
				return null;
			},

			/* Consequently applies all registered transformations to the given element.
			 *
			 * This function is usually called upon page initialization for BODY element and then after template rendering
			 * to process newly created HTML. */
			compile: function($element) {
				$.each(this._.transformations, function(idx, transform) {

					var $scope = $element.find(transform.selector);
					if ($element.is(transform.selector)) {
						$scope = $scope.add($element);
					}

					$scope.each(function(idx, el) {
						var $result = transform.fn($(el), app.services);

						if (typeof $result != 'undefined' && $result !== null) {
							$(el).replaceWith($result);
						}
					});
				});
				return $element;
			},

			/* A wrapper around console.log that makes sure logging does not cause problem in older browsers */
			log: function(message) {
				if (typeof console != 'undefined' && typeof console.log != 'undefined') {
					console.log(message);
				}
			},

			/* Instantiates services for a specific element. */
			createServices: function($element) {
				var services = {};
				$.each(app._.serviceFactories, function(name, factory) {
					services[name] = app.wrapObject(factory($element, services));
				});
				return services;
			},

			/* Instantiates and initializes new controller */
			createController: function(element) {
				var $element = $(element);
				var controllerName = $element.attr('data-controller');
				var controllerFactory = app._.controllerFactories[controllerName];
				if (typeof controllerFactory != 'undefined') {
					var services = this.createServices($element);
					element.controller = app.wrapObject(
						controllerFactory($element, services)
					);
					element.controller.$ = services.$;

					if (typeof element.controller.init == 'function') {
						element.controller.init();
					}

					return element.controller;
				}
				else {
					throw 'Unknown controller: "' + controllerName + '"';
				}
			},

			/**
			 * Resets the application to its initial state by creating a new object.
			 * Required to run the test suits independently.
			 */
			reset: function() {
				window.app = createApplication(originalConfiguration);
				window.app._ = app._;
				window.app._.controllerFactories = {};

				window.app.init();

				return window.app;
			}
		});

		/* Application's deprecated functions */
		if (app.config.legacy) {

			$.extend(app, {

				/* Registers a new handler for to be called when the application have initialized all controllers. The
				 * new code should subscribe to application's 'ready' event:
				 * $(app).on('ready', handler) */
				ready: function(callback, context) {
					this.log('app.ready() function is deprecated. Use application\'s "ready" event instead.');
					$(app).on('ready', $.proxy(callback, context));
				}
			});
		}

		/* Wrapping application's functions, so they will already be called within the context of 'app' object */
		app.wrapObject(app);

		return app;
	};

	app = createApplication(app);

	/* Everything is loaded, it's time to start! */
	$(document).ready(function() {
		app.init();
	});

	/* Adding Object.keys support for older browsers. */
	if (!Object.keys) {
		Object.keys = function(obj) {
			var keys = [];

			for (var i in obj) {
				if (obj.hasOwnProperty(i)) {
					keys.push(i);
				}
			}

			return keys;
		};
	}

	/* Small extension for jQuery */
	$.fn.outerHtml = function() {
		return $('<div/>').append(this).html();
	};

})(jQuery);
