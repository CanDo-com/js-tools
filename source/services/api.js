/* This module provide some wrapping around JSON-based AJAX calls */
(function() {

	var serviceFactory = function($element, services) {

		/* A factory for the internal error handler */
		var _errorCallbackFactory = function(result) {
			return function(xhr, textStatus, errorThrown) {
				var data = xhr.responseJSON;

				$(app).trigger('api.error', [xhr.status, data, xhr]);

				if (result.triggerError(xhr.status, data, xhr)) {
					return;
				}

				/* If the error wasn't processed by the .error() callback, we trigger a global status */
				$(app).trigger('api.error.unhandled', [xhr.status, data, xhr]);
			}
		};

		var _absoluteApiUrl = function(path) {
			var pathSuffix = path === undefined ? "" : ('/' + path); 
			return app.config.baseUrl + app.config.apiUrl + pathSuffix;
		};

		var _request = function(uri, data, verb, options) {
			options = options || {};
			data = data || {};

			var result = services.deferred();
			$.ajax(
				_absoluteApiUrl(uri),
				$.extend(
					{
						type: verb,
						data: data,
						success: result.successCallback(),
						error: _errorCallbackFactory(result)
					},
					options
				)
			);
			return result;

		};

		/* A wrapper HTTP calls made with a json body (normally put or post) */
		var _jsonBodyRequest = function(uri, data, verb){
			return _request(
				uri,
				JSON.stringify(data),
				verb,
				{
					contentType: 'application/json',
					dataType: 'json'
				}
			);
		};

		return {

			/* A wrapper for HTTP GET call */
			get: function(uri, data) {
				return _request(uri, data, 'GET');
			},

			/* A wrapper for HTTP DELETE call */
			'delete': function(uri){
				return _request(uri, null, 'DELETE');
			},

			/* A wrapper for HTTP POST call */
			post: function(uri, data) {
				return _jsonBodyRequest(uri, data, 'post');
			},

			/* A wrapper for HTTP PUT call */
			put: function(uri, data) {
				return _jsonBodyRequest(uri, data, 'put');
			},

			/* Performs POST request to create a new resource (id is null) or PUT to update an existing one (id is not
			null) */
			save: function(url, id, data) {
				if (id) {
					return this.put(url + '/' + id, data);
				}
				else {
					return this.post(url, data);
				}
			},

			/* Get the full url of an API request based on a path */
			url: function(path) {
				return _absoluteApiUrl(path);
			}

		};
	};

	app.service('api', serviceFactory);
})(jQuery, app);
