<?php
/**
 * @link http://www.cando.com/
 * @copyright Copyright (c) 2015 Advertical LLC dba CanDo
 */

namespace cando\jstools;

use \yii\web\AssetBundle;

class JSToolsAsset extends AssetBundle
{
	public function init()
	{
		if (YII_ENV_DEV)
		{
			$this->sourcePath = __DIR__ . '/source';
			$this->js = require(__DIR__ . '/files.php');
		}
		else
		{
			$this->sourcePath = __DIR__ . '/dist';
			$this->js = ['js-tools.min.js'];
		}

		parent::init();
	}
}
