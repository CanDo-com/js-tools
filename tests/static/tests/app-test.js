
buster.testCase('Application namespace', {
		setUp: function() {
			this.app = window.app;
		},

		'Application object exists': function() {
			buster.assert(typeof this.app == "object");
		},

		'Services registered': function() {
			buster.assert(Object.keys(this.app._.serviceFactories).length > 0);
		},

		'Global services created': function() {
			buster.assert(Object.keys(this.app.services).length > 0);
		},

		'Application wrapping function': {
			'Wrapping a single function': function() {
				var context = {};
				var differentContext = {};

				var fn = function() {
					return this;
				};

				var wrappedFunction = app.wrap(fn, context);

				buster.assert.same(wrappedFunction(), context);
				buster.refute.same(fn(), context);

				buster.assert.same(wrappedFunction.call(differentContext), context);
				buster.refute.same(fn.call(differentContext), context);

				buster.assert.same(wrappedFunction.call(context), context);
				buster.assert.same(fn.call(context), context);
			},

			'Wrapping an object': function() {
				var differentContext = {};

				var object = {};
				object.fn1 = function() {
					return this;
				};

				object.fn2 = function() {
					return this === object;
				};

				buster.assert.same(object.fn1(), object);
				buster.assert(object.fn2());

				buster.refute.same(object.fn1.call(differentContext), object);
				buster.refute(object.fn2.call(differentContext));

				this.app.wrapObject(object);

				buster.assert.same(object.fn1(), object);
				buster.assert(object.fn2());

				buster.assert.same(object.fn1.call(differentContext), object);
				buster.assert(object.fn2.call(differentContext));
			}
		}
	}
);
