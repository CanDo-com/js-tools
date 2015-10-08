<?php

$files = require(__DIR__ . DIRECTORY_SEPARATOR . 'files.php');

$command = 'java -jar ' . $argv[1] . '  --compilation_level SIMPLE_OPTIMIZATIONS --js_output_file dist'
	. DIRECTORY_SEPARATOR . 'js-tools.min.js';

foreach($files as $file)
{
	$command .= ' --js source' . DIRECTORY_SEPARATOR . $file;
}

passthru($command);

$version = trim(file_get_contents('version'));

$code = file_get_contents('js-tools.min.js');
$today = date('m/d/Y');
$text = <<<EOD
/*!
 * js-tools library
 * Version $version built $today
 *
 * By CanDo and Sergey Misyura <sergey@cando.com>
 *
 * https://github.com/sergeymisura/js-tools
 */

EOD;
file_put_contents('dist' .  DIRECTORY_SEPARATOR. 'js-tools.min.js', $text . $code);
