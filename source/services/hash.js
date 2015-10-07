(function($, app) {
	/* Service that simplifies work with 'hash' portions of urls */
	app.service('hash', function($element, services) {

		/**
		 * A list of the patterns and handlers
		 *
		 * @type {Array}
		 * @private
		 */
		var _map =[];

		/**
		 * A flag that shows that the event listener for this instance is already installed.
		 *
		 * @type  {boolean}
		 * @private
		 */
		var _handlerInstalled;

		/**
		 * Current hash, parsed.
		 *
		 * @type  {Object}
		 * @private
		 */
		var _parsedHash;

		/**
		 * Parses the current hash and stores it in _parsedHash variable
		 *
		 * @private
		 */
		var _parse = function() {
			var hash = document.location.hash;

			/* Removing # from the beginning of the hash */
			if (hash.indexOf('#') == 0) {
				hash = hash.substr(1);
			}

			/* Parsing the portion after '?' (if exists) */
			var queryString = '';
			if (hash.indexOf('?') != -1) {
				queryString = hash.substr(hash.indexOf('?') + 1);
				hash = hash.substr(0, hash.indexOf('?'));
			}

			var parts = queryString.split('&');
			var query = {};
			for (var i = 0; i < parts.length; i++) {
				var pair = parts[i].split('=');
				query[decodeURIComponent(pair[0])] = decodeURIComponent(pair.length > 1 ? pair[1] : '');
			}

			/* Parsing the path part */
			parts = hash.split('/');

			_parsedHash = {
				hash: hash,
				path: parts,
				query: query,
				queryString: queryString
			};
		};

		/**
		 * Tests the pattern against the current hash and calls the handler if the hash matches the pattern.
		 *
		 * @param pattern
		 * @param handler
		 * @private
		 */
		var _test = function(pattern, handler) {
			var matches = false;
			if (typeof pattern == 'string') {
				matches = pattern == _parsedHash.path[0];
			}
			else if (pattern.test) {
				matches = pattern.test(_parsedHash.hash);
			}
			if (matches) {
				handler.apply($element[0].controller, [_parsedHash].concat(_parsedHash.path));
			}
		};

		/**
		 * window.onhashchange listener
		 */
		var _hashChangeHandler = function() {
			_parse();
			$.each(_map, function(idx, pair) { _test(pair[0], pair[1]); });
		};


		return $.extend(
			/**
			 * Being called as a function, the service adds URL changing event handlers. The function accepts an array
			 * of pattern - handler pairs. The handler will be evoked if the new URL hash matches the pattern.
			 * If pattern is a string, it will be matched against the first part of the hash (e.g. handler for 'users'
			 * will be evoked if the new URL is #users/2
			 *
			 * Sample call:
			 *
			 * services.hash(
			 * 	['users', this.displayUsers],
			 * 	['contracts', this.displayContracts],
			 * 	[services.hash.EMPTY, this.displayDefault]
			 * )
			 */
			function() {
				if (!_handlerInstalled) {
					_parse();
					$(window).on('hashchange', _hashChangeHandler);
					_handlerInstalled = true;
				}

				$.each(arguments, function(idx, pair) {
					var pattern = pair[0];
					var handler = pair[1];

					if (typeof handler == 'string') {
						handler = $element[0].controller[handler];
					}

					_map.push([pattern, handler]);

					_test(pattern, handler);
				});
			},
			{
				/**
				 * Regular expression that can be used to attach a handler for the empty URL hash.
				 */
				EMPTY: /^$/,

				/**
				 * Regular expression that can be used to attach a handler for every URL hash change.
				 */
				ALL: /.*/,

				/* Builds the hash portion of the URL by combining the first array into the path separated by '/' and using
				 * the second optional argument as a collection of query string parameters.
				 *
				 * services.hash.build(['user', 2], { display: 'all' }) will return '#users/2?display=all' */
				build: function(path, params) {
					if (path.constructor == Array) {
						path = path.join('/');
					}

					var hash = '#' + path;
					if (params) {
						var paramsArray = [];
						$.each(params, function(key, value) {
							if (value == '') {
								paramsArray.push(encodeURIComponent(key));
							}
							else {
								paramsArray.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
							}
						});
						if (paramsArray.length > 0) {
							hash += '?' + paramsArray.join('&');
						}
					}
					return hash;
				},

				/* Builds and applies the hash portion of the URL (see hash.build()) */
				go: function(path, params) {
					document.location = this.build(path, params);
				},

				/**
				 * Sets the new value for one of the parameters and returns a new URL.
				 *
				 * @param {string} param  Parameter to set
				 * @param {string} value  New value
				 *
				 * @returns {string}  Updated URL
				 */
				set: function(param, value) {
					var query = $.extend({}, _parsedHash.query);
					query[param] = value || '';
					return this.build(_parsedHash.path, query);
				},

				/**
				 * Adds a new URL changing handlers. The handler will be evoked if the new url matches the provided pattern.
				 * If pattern is a string, it will be matched against the first part of the hash (e.g. handler for 'users'
				 * will be evoked if the new URL is #users/2
				 *
				 * @param  pattern
				 * @param  handler
				 * @returns {service}
				 */
				add: function(pattern, handler) {
					app.log('Usage of services.hash.add() is deprecated. Use services.hash() instead.');
					this([pattern, handler]);
					return this;
				}
			}
		);
	});
})(jQuery, app);
