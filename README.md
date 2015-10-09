JS-Tools
========

### Lightweight JavaScript Framework

Requirements
------------

The framework requires jQuery to be loaded before js-tools. 

If you are going to use client-side rendering, the template library must also be loaded. The framework does not include 
template rendering and relies on an external library. Currently we have support for the following template engines 
(although wrappers for other template engines could be added fairly easily):

- [Handlebars](http://handlebarsjs.com/)
- [Mustache](https://mustache.github.io/)
- [Underscore.js](http://underscorejs.org/#template)
- jQuery Templates (although this project is abandoned by jQuery team and its usage is highly discouraged)

Installation
------------

If your project is using Composer to manage dependencies, add a reference to our GitHub repository to composer.json and 
require cando/js-tools package.

```
composer config repositories.cando-jstools vcs git@github.com:CanDo-com/js-tools.git
composer require cando/js-tools:dev-master
```

Otherwise clone the repository from ```git@github.com:CanDo-com/js-tools.git``` or download the latest stable version from 
[our GitHub repository](https://github.com/CanDo-com/js-tools).

Adding to the project
--------------------

Projects based on Yii2 can use ```\cando\jstools\JSToolsAsset``` class which is an Yii2 asset bundle that includes 
either the minified version for the live environment or source code for the development environment. 

For the projects that don't use Yii, include ```dist/js-tools.min.js``` right after jQuery.

Documentation
-------------

Basic documentation can be found in the [docs](docs) folder. For more details - dive into the source code, it is mostly 
annotated and pretty small.

Contribution
------------

Feedback is much appreciated in a form of GitHub issues and pull requests.
