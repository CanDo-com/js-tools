
buster.testCase('Controllers', {
		setUp: function() {
			this.app = window.app.reset();

			this.app.controller('test-controller', function() {
				return {
					init: function() {
						this.initialized = true;
					}
				};
			});
		},

		'Controller registered': function() {
			buster.assert.isFunction(this.app._.controllerFactories['test-controller']);
		},

		'Controller created and initialized': function() {
			var element = $('<div/>')
				.attr('data-controller', 'test-controller')
				.get(0);
			this.app.createController(element);
			buster.assert.isObject(element.controller);
			buster.assert(element.controller.initialized);
		}
	}
);
