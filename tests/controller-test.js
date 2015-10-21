(function() {
	buster.testCase('Controllers', {
			setUp: function() {
				this.app = window.app.reset();

				this.app.controller('test-controller', function() {
					return {
						init: function() {
							this.initialized = true;
						},

						test: function() {
							return this;
						}
					};
				});

				this.element = $('<div/>')
					.attr('data-controller', 'test-controller')
					.get(0);
			},

			tearDown: function() {
				$('body #test-html').html('');
			},

			'Controller registered': function() {
				buster.assert.isFunction(this.app._.controllerFactories['test-controller']);
			},

			'Controller created and initialized': function() {
				this.app.createController(this.element);
				buster.assert.isObject(this.element.controller);
				buster.assert(this.element.controller.initialized);
			},

			'Controller methods are "wrapped"': function () {
				this.app.createController(this.element);
				var testFunction = this.element.controller.test;
				buster.assert.same(testFunction(), this.element.controller);
			},

			'Retrieving controller by element ID': function() {
				this.element.id = 'test-element';
				$('body #test-html').append($(this.element));
				this.app.createController(this.element);
				buster.assert.same(this.element.controller, this.app.get('#test-element'));
			}
		}
	);
})();
