var config = module.exports;

config["js-tools"] = {
	rootPath: "..",
	environment: "browser", // or "node"
	sources: [
		"tests/jquery-2.1.4.min.js",
		"dist/js-tools.min.js"
	],
	tests: [
		"tests/*-test.js"
	]
}

