JS-Tools - Lightweight JavaScript Framework
===========================================

Installation
------------

If your project is using Composer to manage dependencies, add a reference to our GitHub repository to composer.json and 
require cando/js-tools package.

```
composer config repositories.cando-jstools vcs git@github.com:CanDo-com/js-tools.git
composer require cando/js-tools:dev-master
```

Otherwise clone the repository from git@github.com:CanDo-com/js-tools.git or download the latest stable version from 
[our GitHub repository](https://github.com/CanDo-com/js-tools).

Adding to the project
--------------------

Projects based on Yii2 can use ```\cando\jstools\JSToolsAsset``` class which is an Yii2 asset bundle that includes 
either the minified version for the live environment or source code for the development environment. 

For the projects that don't use Yii, include dist/js-tools.min.js right after jQuery.
