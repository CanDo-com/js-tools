
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
		}
	}
);
