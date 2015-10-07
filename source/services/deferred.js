/* This service creates 'delayed promise' object for asynchronous operations like API calls. All handlers passed to
 * this service will be called in the context of the controller.  */
(function() {

	var serviceFactory = function($element) {

		return function() {
			var context = $element.get(0).controller || window;

			return app.wrapObject({

				/* Handler for successful outcome of the operation */
				_success: $.noop,

				/* Handler that will be called if the operation is failed */
				_error: $.noop,

				/* This handler will be called in any case after the operation is complete, before 'error' or 'success'
				handler */
				_after: $.noop,

				/* Sets the 'success' handler  */
				success: function(callback) {
					this._success = callback;
					return this;
				},

				/* Sets the 'error' handler  */
				error: function(callback) {
					this._error = callback;
					return this;
				},

				/* Sets the 'before' handler (will be called immediately). */
				before: function(callback) {
					callback.apply(context);
					return this;
				},

				/* Sets the 'after' handler  */
				after: function(callback) {
					this._after = callback;
					return this;
				},

				/* Creates the 'success' callback function that could be passed to other APIs, like jQuery.ajax */
				successCallback: function() {
					var self = this;
					return function() {
						self._after.apply(context, arguments);
						return self._success.apply(context, arguments);
					};
				},

				/* Creates the 'error' callback function that could be passed to other APIs, like jQuery.ajax */
				errorCallback: function() {
					var self = this;
					return function() {
						self._after.apply(context, arguments);
						return self._error.apply(context, arguments);
					};
				},

				/* Triggers the 'success' callback */
				triggerSuccess: function() {
					this.successCallback().apply(null, arguments);
				},

				/* Triggers the 'error' callback */
				triggerError: function() {
					this.errorCallback().apply(null, arguments);
				}
			});
		};
	};

	if (app.config.legacy) {
		/* Support for the legacy interface */
		serviceFactory.create = function($element) {
			app.log('The function service.deferred.create() is deprecated. Use service.deferred() instead.')
			return serviceFactory($element);
		};
	}

	app.service('deferred', serviceFactory);

})(jQuery, app);
