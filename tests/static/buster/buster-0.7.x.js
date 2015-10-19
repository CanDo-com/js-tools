this.bane = buster.bane;
this._ = buster._;
buster.defaultReporter = "html";((typeof define === "function" && define.amd && function (m) {
    define("stack-filter", m);
}) || (typeof module === "object" && function (m) {
    module.exports = m();
}) || function (m) { this.stackFilter = m(); }
)(function () {
    "use strict";
    var regexpes = {};

    return {
        filters: [],

        configure: function (opt) {
            opt = opt || {};
            var instance = Object.create(this);
            instance.filters = opt.filters || [];
            instance.cwd = opt.cwd;
            return instance;
        },

        /**
         * Return true if the stack trace line matches any filter
         */
        match: function (line) {
            var i, l, filters = this.filters;

            for (i = 0, l = filters.length; i < l; ++i) {
                if (!regexpes[filters[i]]) {
                    // Backslashes must be double-escaped:
                    // new RegExp("\\") is equivalent to /\/ - which is an invalid pattern
                    // new RegExp("\\\\") is equivalent to /\\/ - an escaped backslash
                    // This must be done for Windows paths to work properly
                    regexpes[filters[i]] = new RegExp(filters[i].replace(/\\/g, "\\\\"));
                }

                if (regexpes[filters[i]].test(line)) {
                    return true;
                }
            }

            return false;
        },

        /**
         * Filter a stack trace and optionally trim off the current
         * working directory. Accepts a stack trace as a string, and
         * an optional cwd (also a string). The cwd can also be
         * configured directly on the instance.
         *
         * Returns an array of lines - a pruned stack trace. The
         * result only includes lines that point to a file and a
         * location - the initial error message is stripped off. If a
         * cwd is available, all paths will be stripped of it. Any
         * line matching any filter will not be included in the
         * result.
         */
        filter: function (stack, cwd) {
            var lines = (stack || "").split("\n");
            var i, l, line, stackLines = [], replacer = "./";
            cwd = cwd || this.cwd;

            if (typeof cwd === "string") {
                cwd = cwd.replace(/\/?$/, "/");
            }

            if (cwd instanceof RegExp && !/\/\/$/.test(cwd)) {
                replacer = ".";
            }

            for (i = 0, l = lines.length; i < l; ++i) {
                if (/(\d+)?:\d+\)?$/.test(lines[i])) {
                    if (!this.match(lines[i])) {
                        line = lines[i].replace(/^\s+|\s+$/g, "");

                        if (cwd) {
                            line = line.replace(cwd, replacer);
                        }

                        stackLines.push(line);
                    }
                }
            }

            return stackLines;
        }
    };
});
((typeof define === "function" && define.amd && function (m) {
    define("buster-test/reporters/html", m);
}) || (typeof module === "object" &&
       typeof require === "function" && function (m) {
           try {
               var jsdom = require("jsdom").jsdom;
           } catch (e) {
               // Is handled when someone actually tries using the HTML reporter
               // on node without jsdom
           }

           module.exports = m(jsdom, true);
    }) || function (m) {
        this.buster = this.buster || {};
        this.buster.reporters = this.buster.reporters || {};
        this.buster.reporters.html = m();
    }
)(function (jsdom, isNodeJS) {
    "use strict";

    function filterStack(reporter, stack) {
        if (!stack) { return []; }
        if (reporter.stackFilter) {
            return reporter.stackFilter.filter(stack);
        }
        return stack.split("\n");
    }

    function getDoc(options) {
        return options && options.document ||
            (typeof document != "undefined" ? document : createDocument());
    }

    function addCSS(head, cssPath) {
        if (isNodeJS) {
            var fs = require("fs");
            var path = require("path");

            head.appendChild(el(head.ownerDocument, "style", {
                type: "text/css",
                innerHTML: fs.readFileSync(
                    path.join(__dirname, "../../resources/buster-test.css")
                )
            }));
        } else {
            head.appendChild(el(document, "link", {
                rel: "stylesheet",
                type: "text/css",
                media: "all",
                href: cssPath
            }));
        }
    }

    function insertTitle(doc, body, title) {
        if (doc.getElementsByTagName("h1").length == 0) {
            body.insertBefore(el(doc, "h1", {
                innerHTML: "<span class=\"title\">" + title + "</span>"
            }), body.firstChild);
        }
    }

    function insertLogo(h1) {
        h1.innerHTML = "<span class=\"buster-logo\"></span>" + h1.innerHTML;
    }

    function createDocument() {
        if (!jsdom) {
            process.stdout.write("Unable to load jsdom, html reporter will not work " +
                      "for node runs. Spectacular fail coming up\n");
        }
        var dom = jsdom("<!DOCTYPE html><html><head></head><body></body></html>");
        return dom.createWindow().document;
    }

    function pluralize(num, phrase) {
        num = typeof num == "undefined" ? 0 : num;
        return num + " " + (num == 1 ? phrase : phrase + "s");
    }

    function el(doc, tagName, properties) {
        var el = doc.createElement(tagName), value;

        for (var prop in properties) {
            value = properties[prop];

            if (prop == "http-equiv") {
                el.setAttribute(prop, value);
            }

            if (prop == "text") {
                prop = "innerHTML";
            }

            el[prop] = value;
        }

        return el;
    }

    function addListItem(tagName, test, className) {
        var prefix = tagName ? "<" + tagName + ">" : "";
        var suffix = tagName ? "</" + tagName + ">" : "";

        var item = el(this.doc, "li", {
            className: className,
            text: prefix + test.name + suffix
        });

        this.list().appendChild(item);
        return item;
    }

    function addException(reporter, li, error) {
        if (!error) {
            return;
        }

        var name = error.name == "AssertionError" ? "" : error.name + ": ";

        li.appendChild(el(li.ownerDocument || document, "p", {
            innerHTML: name + error.message,
            className: "error-message"
        }));

        var stack = filterStack(reporter, error.stack);

        if (stack.length > 0) {
            if (stack[0].indexOf(error.message) >= 0) {
                stack.shift();
            }

            li.appendChild(el(li.ownerDocument || document, "ul", {
                className: "stack",
                innerHTML: "<li>" + stack.join("</li><li>") + "</li>"
            }));
        }
    }

    function busterTestPath(document) {
        var scripts = document.getElementsByTagName("script");

        for (var i = 0, l = scripts.length; i < l; ++i) {
            if (/buster-test\.js$/.test(scripts[i].src)) {
                return scripts[i].src.replace("buster-test.js", "");
            }
        }

        return "";
    }

    function getOutputStream(opt) {
        if (opt.outputStream) { return opt.outputStream; }

        if (isNodeJS) {
            return {
                write: function (bytes) { process.stdout.write(bytes); }
            };
        }
    }

    function HtmlReporter(opt) {
        opt = opt || {};
        this._listStack = [];
        this.doc = getDoc(opt);
        var cssPath = opt.cssPath;
        if (!cssPath && opt.detectCssPath !== false) {
            cssPath = busterTestPath(this.doc) + "buster-test.css";
        }
        this.setRoot(opt.root || this.doc.body, cssPath);
        this.out = getOutputStream(opt);
        this.stackFilter = opt.stackFilter;
        this.startTimer();
    }

    HtmlReporter.prototype = {
        create: function (opt) {
            return new HtmlReporter(opt);
        },

        setRoot: function (root, cssPath) {
            this.root = root;
            this.root.className += " buster-test";
            var body = this.doc.body;

            if (this.root == body) {
                var head = this.doc.getElementsByTagName("head")[0];
                head.parentNode.className += " buster-test";

                head.appendChild(el(this.doc, "meta", {
                    "name": "viewport",
                    "content": "width=device-width, initial-scale=1.0"
                }));

                head.appendChild(el(this.doc, "meta", {
                    "http-equiv": "Content-Type",
                    "content": "text/html; charset=utf-8"
                }));

                if (cssPath) addCSS(head, cssPath);
                insertTitle(this.doc, body, this.doc.title || "Buster.JS Test case");
                insertLogo(this.doc.getElementsByTagName("h1")[0]);
            }
        },

        listen: function (runner) {
            runner.bind(this);
            return this;
        },

        "context:start": function (context) {
            var container = this.root;
            if (this._list) {
                container = el(this.doc, "li");
                this._list.appendChild(container);
            }
            container.appendChild(el(this.doc, "h2", { text: context.name }));
            this._list = el(this.doc, "ul");
            container.appendChild(this._list);
            this._listStack.unshift(this._list);
        },

        "context:end": function (context) {
            this._listStack.shift();
            this._list = this._listStack[0];
        },

        "test:success": function (test) {
            var li = addListItem.call(this, "h3", test, "success");
            this.addMessages(li);
        },

        "test:failure": function (test) {
            var li = addListItem.call(this, "h3", test, "failure");
            this.addMessages(li);
            addException(this, li, test.error);
        },

        "test:error": function (test) {
            var li = addListItem.call(this, "h3", test, "error");
            this.addMessages(li);
            addException(this, li, test.error);
        },

        "test:deferred": function (test) {
            var li = addListItem.call(this, "h3", test, "deferred");
        },

        "test:timeout": function (test) {
            var li = addListItem.call(this, "h3", test, "timeout");
            var source = test.error && test.error.source;
            if (source) {
                li.firstChild.innerHTML += " (" + source + " timed out)";
            }
            this.addMessages(li);
        },

        log: function (msg) {
            this.messages = this.messages || [];
            this.messages.push(msg);
        },

        addMessages: function (li) {
            var messages = this.messages || [];
            var html = "";

            if (messages.length == 0) {
                return;
            }

            for (var i = 0, l = messages.length; i < l; ++i) {
                html += "<li class=\"" + messages[i].level + "\">";
                html += messages[i].message + "</li>";
            }

            li.appendChild(el(this.doc, "ul", {
                className: "messages",
                innerHTML: html
            }));

            this.messages = [];
        },

        success: function (stats) {
            return stats.failures == 0 && stats.errors == 0 &&
                stats.tests > 0 && stats.assertions > 0;
        },

        startTimer: function () {
            this.startedAt = new Date();
        },

        "suite:end": function (stats) {
            var diff = (new Date() - this.startedAt) / 1000;

            var className = "stats " + (this.success(stats) ? "success" : "failure");
            var statsEl = el(this.doc, "div", { className: className });

            var h1 = this.doc.getElementsByTagName("h1")[0];
            this.root.insertBefore(statsEl, h1.nextSibling);

            statsEl.appendChild(el(this.doc, "h2", {
                text: this.success(stats) ? "Tests OK" : "Test failures!"
            }));

            var html = "";
            html += "<li>" + pluralize(stats.contexts, "test case") + "</li>";
            html += "<li>" + pluralize(stats.tests, "test") + "</li>";
            html += "<li>" + pluralize(stats.assertions, "assertion") + "</li>";
            html += "<li>" + pluralize(stats.failures, "failure") + "</li>";
            html += "<li>" + pluralize(stats.errors, "error") + "</li>";
            html += "<li>" + pluralize(stats.timeouts, "timeout") + "</li>";

            if (stats.deferred > 0) {
                html += "<li>" + stats.deferred + " deferred</li>";
            }

            statsEl.appendChild(el(this.doc, "ul", { innerHTML: html }));
            statsEl.appendChild(el(this.doc, "p", {
                className: "time",
                innerHTML: "Finished in " + diff + "s"
            }));

            this.writeIO();
        },

        list: function () {
            if (!this._list) {
                this._list = el(this.doc, "ul", { className: "test-results" });
                this._listStack.unshift(this._list);
                this.root.appendChild(this._list);
            }

            return this._list;
        },

        writeIO: function () {
            if (!this.out) { return; }
            this.out.write(this.doc.doctype.toString());
            this.out.write(this.doc.innerHTML);
        }
    };

    return HtmlReporter.prototype;
});
((typeof define === "function" && define.amd && function (m) {
    define("buster-test/reporters/html2", m);
}) || (typeof module === "object" &&
       typeof require === "function" && function (m) {
           try {
               var jsdom = require("jsdom").jsdom;
           } catch (e) {
               // Is handled when someone actually tries using the HTML reporter
               // on node without jsdom
           }

           module.exports = m(jsdom, true);
    }) || function (m) {
        this.buster = this.buster || {};
        this.buster.reporters = this.buster.reporters || {};
        this.buster.reporters.html2 = m();
    }
)(function (jsdom, isNodeJS) {
    "use strict";

    function el(doc, tagName, properties) {
        var el = doc.createElement(tagName), value;

        for (var prop in properties) {
            value = properties[prop];

            if (prop === "http-equiv") {
                el.setAttribute(prop, value);
            }

            if (prop === "text") {
                prop = "innerHTML";
            }

            el[prop] = value;
        }

        return el;
    }

    function filterStack(reporter, stack) {
        if (!stack) { return []; }
        if (reporter.stackFilter) {
            return reporter.stackFilter.filter(stack);
        }
        return stack.split("\n");
    }

    function createDocument() {
        if (!jsdom) {
            process.stdout.write("Unable to load jsdom, html reporter will not work " +
                                 "for node runs. Spectacular fail coming up\n");
        }
        var dom = jsdom("<!DOCTYPE html><html><head></head><body></body></html>");
        return dom.createWindow().document;
    }

    function getDoc(options) {
        return options && options.document ||
            (typeof document != "undefined" ? document : createDocument());
    }

    function addCSS(head, cssPath) {
        if (isNodeJS) {
            var fs = require("fs");
            var path = require("path");

            head.appendChild(el(head.ownerDocument, "style", {
                type: "text/css",
                innerHTML: fs.readFileSync(
                    path.join(__dirname, "../../resources/buster-test.css")
                )
            }));
        } else {
            head.appendChild(el(document, "link", {
                rel: "stylesheet",
                type: "text/css",
                media: "all",
                href: cssPath
            }));
        }
    }

    function pluralize(num, phrase) {
        num = typeof num == "undefined" ? 0 : num;
        return num + " " + (num == 1 ? phrase : phrase + "s");
    }

    function initializeDoc(doc, title) {
        doc.innerHTML += "<div class=\"navbar navbar-inverse\">" +
            "  <div class=\"navbar-inner\">" +
            "    <div class=\"container-narrow\">" +
            "      <span class=\"buster-logo\">" +
            "    </div>" +
            "  </div>" +
            "</div>" +
            "<div class=\"container-narrow\">" +
            "  <h1>" + title + "</h1>" +
            "  <div class=\"btn-group\">" +
            "  </div>" +
            "  <p class=\"muted pull-right\"></p>" +
            "  <br><br>" +
            "  <p class=\"muted\"></p>" +
            "  <div class=\"progress progress-striped active\">" +
            "    <div class=\"bar bar-info\" style=\"width: 0;\"></div>" +
            "    <div class=\"bar bar-success\" style=\"width: 0;\"></div>" +
            "    <div class=\"bar bar-warning\" style=\"width: 0;\"></div>" +
            "    <div class=\"bar bar-danger\" style=\"width: 0;\"></div>" +
            "  </div>" +
            "  <div class=\"test-results\"></div>" +
            "</div>";

        return {
            stats: doc.querySelectorAll(".btn-group")[0],
            progressBar: {
                container: doc.querySelectorAll(".progress")[0],
                pending: doc.querySelectorAll(".bar-info")[0],
                success: doc.querySelectorAll(".bar-success")[0],
                error: doc.querySelectorAll(".bar-warning")[0],
                failure: doc.querySelectorAll(".bar-danger")[0]
            },
            runContainer: doc.querySelectorAll(".test-results")[0],
            timing: doc.querySelectorAll(".muted")[0],
            randomSeed: doc.querySelectorAll(".muted")[1]
        };
    }

    function addListItem(reporter, test, prefix) {
        var row = el(reporter.doc, "tr");

        row.appendChild(el(reporter.doc, "td", {
            text: prefix + " " + test.name
        }));

        reporter.list.appendChild(row);
        return row;
    }

    function addException(reporter, row, error) {
        if (!error) {
            return;
        }

        var name = error.name == "AssertionError" ? "" : error.name + ": ";
        var cell = row.getElementsByTagName("td")[0];

        var pre = cell.appendChild(el(reporter.doc, "pre", {
            innerHTML: "<strong class=\"text-error\">" + name + error.message + "</strong>"
        }));

        var stack = filterStack(reporter, error.stack);

        if (stack.length > 0) {
            if (stack[0].indexOf(error.message) >= 0) {
                stack.shift();
            }

            pre.innerHTML += "\n    " + stack.join("\n    ");
        }
    }

    function redistributeProgressBars(bars) {
        var weights = [
            parseFloat(bars.pending.style.width),
            parseFloat(bars.success.style.width),
            parseFloat(bars.error.style.width),
            parseFloat(bars.failure.style.width)
        ];

        var sum = weights[0] + weights[1] + weights[2] + weights[3];

        if (Math.floor(sum) === 100) {
            return;
        }

        bars.pending.style.width = (weights[0]*100/sum) + "%";
        bars.success.style.width = (weights[1]*100/sum) + "%";
        bars.error.style.width = (weights[2]*100/sum) + "%";
        bars.failure.style.width = (weights[3]*100/sum) + "%";
    }

    function resourcePath(document, file, suffix) {
        var scripts = document.getElementsByTagName("script");

        for (var i = 0, l = scripts.length; i < l; ++i) {
            if (/buster-.*\.js$/.test(scripts[i].src)) {
                return scripts[i].src.replace(/buster-(.*)\.js/, file + "$1." + suffix);
            }
        }

        return "";
    }

    function getOutputStream(opt) {
        if (opt.outputStream) { return opt.outputStream; }
        if (isNodeJS) {
            return process.stdout;
        }
    }

    function HtmlReporter(opt) {
        opt = opt || {};
        this._listStack = [];
        this.doc = getDoc(opt);
        var cssPath = opt.cssPath;
        if (!cssPath && opt.detectCssPath !== false) {
            cssPath = resourcePath(this.doc, "buster-", "css");
        }
        this.setRoot(opt.root || this.doc.body, cssPath);
        this.out = getOutputStream(opt);
        this.stackFilter = opt.stackFilter;
        this.startTimer();
    }

    HtmlReporter.prototype = {
        create: function (opt) {
            return new HtmlReporter(opt);
        },

        setRoot: function (root, cssPath) {
            root.className += " buster-test";

            if (root == this.doc.body) {
                var head = this.doc.getElementsByTagName("head")[0];
                head.parentNode.className += " buster-test";

                head.appendChild(el(this.doc, "meta", {
                    "name": "viewport",
                    "content": "width=device-width, initial-scale=1.0"
                }));

                if (cssPath) {
                    addCSS(head, cssPath);
                }
            }

            var title = this.doc.title || "Buster.JS Test case";
            this.elements = initializeDoc(root, title);
        },

        updateProgress: function (kind) {
            var bar = this.elements.progressBar[kind];
            var width = parseFloat(bar.style.width);
            bar.style.width = (width + this.progressIncrement) + "%";
        },

        listen: function (runner) {
            runner.bind(this);
            return this;
        },

        "suite:configuration": function (config) {
            this.progressIncrement = 100 / config.tests;
            if (config.randomSeed) {
                this.elements.randomSeed.innerText = "Random seed: " + config.randomSeed;
            }
        },

        "context:start": function (context) {
            var container = this.elements.runContainer;
            container.appendChild(el(this.doc, "h2", { text: context.name }));
            this.list = el(this.doc, "table", { "class": "table table-striped" });
            container.appendChild(this.list);
        },

        "test:success": function (test) {
            this.updateProgress("success");
            var row = addListItem(this, test, "<strong class=\"text-success\">✓</strong>");
            this.addMessages(row);
        },

        "test:failure": function (test) {
            this.updateProgress("failure");
            var row = addListItem(this, test, "<strong class=\"text-error\">✖</strong>");
            this.addMessages(row);
            addException(this, row, test.error);
        },

        "test:error": function (test) {
            this.updateProgress("error");
            var row = addListItem(this, test, "<strong class=\"text-warning\">✖</strong>");
            this.addMessages(row);
            addException(this, row, test.error);
        },

        "test:deferred": function (test) {
            this.updateProgress("pending");
            var row = addListItem(this, test, "<strong class=\"text-info\">✎</strong>");
        },

        "test:timeout": function (test) {
            this.updateProgress("failure");
            var row = addListItem(this, test, "<strong class=\"text-error\">∞</strong>");
            var source = test.error && test.error.source;
            if (source) {
                row.firstChild.innerHTML += " (" + source + " timed out)";
            }
            this.addMessages(row);
        },

        log: function (msg) {
            this.messages = this.messages || [];
            this.messages.push(msg);
        },

        addMessages: function (row) {
            var messages = this.messages || [];
            var html = "";

            if (messages.length == 0) {
                return;
            }

            for (var i = 0, l = messages.length; i < l; ++i) {
                html += "<li class=\"" + messages[i].level + "\">";
                html += messages[i].message + "</li>";
            }

            row.firstChild.appendChild(el(this.doc, "ul", {
                className: "messages",
                innerHTML: html
            }));

            this.messages = [];
        },

        success: function (stats) {
            return stats.failures == 0 && stats.errors == 0 &&
                stats.tests > 0 && stats.assertions > 0;
        },

        startTimer: function () {
            this.startedAt = new Date();
        },

        "suite:end": function (stats) {
            var diff = (new Date() - this.startedAt) / 1000;
            this.elements.progressBar.container.className = "progress";
            redistributeProgressBars(this.elements.progressBar);
            this.elements.timing.innerHTML = "Finished in " + diff + "s";

            this.elements.stats.appendChild(el(this.doc, "button", {
                className: "btn",
                text: pluralize(stats.contexts, "test case")
            }));

            this.elements.stats.appendChild(el(this.doc, "button", {
                className: "btn",
                text: pluralize(stats.tests, "test")
            }));

            this.elements.stats.appendChild(el(this.doc, "button", {
                className: "btn",
                text: pluralize(stats.assertions, "assertion")
            }));

            this.elements.stats.appendChild(el(this.doc, "button", {
                className: "btn",
                text: pluralize(stats.failures, "failure")
            }));

            this.elements.stats.appendChild(el(this.doc, "button", {
                className: "btn",
                text: pluralize(stats.errors, "error")
            }));

            this.elements.stats.appendChild(el(this.doc, "button", {
                className: "btn",
                text: pluralize(stats.timeouts, "timeout")
            }));

            if (stats.deferred > 0) {
                this.elements.stats.appendChild(el(this.doc, "button", {
                    className: "btn",
                    text: pluralize(stats.deferred, "deferred")
                }));
            }

            this.writeIO();
        },

        writeIO: function () {
            if (!this.out) { return; }
            this.out.write(this.doc.doctype.toString());
            this.out.write(this.doc.innerHTML);
        }
    };

    return HtmlReporter.prototype;
});
(function (B) {
	"use strict";

    var runner = B.testRunner.create({
        runtime: navigator.userAgent
    });

    var matches = window.location.href.match(/(\?|&)reporter=([^&]*)/);
    var reporter = B.reporters[B.defaultReporter];

    if (matches && matches[2]) {
        reporter = B.reporters[matches[2]];
    }

    reporter = reporter || B.reporters.html;
    reporter.create({ root: document.body }).listen(runner);
    B.wire(runner);
}(buster));
try {
    delete this.bane;
    delete this._;
} catch(e) {
    this['bane'] = undefined;
    this['_'] = undefined;
}