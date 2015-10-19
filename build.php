<?php

$files = require(__DIR__ . DIRECTORY_SEPARATOR . 'files.php');

$destination = 'dist' . DIRECTORY_SEPARATOR . 'js-tools.min.js';

$command = 'java -jar ' . $argv[1] . '  --compilation_level SIMPLE_OPTIMIZATIONS --js_output_file ' . $destination;

foreach($files as $file)
{
	$command .= ' --js source' . DIRECTORY_SEPARATOR . $file;
}

passthru($command);

$version = trim(file_get_contents('version'));

$code = file_get_contents($destination);
$today = date('m/d/Y');
$text = <<<EOD
/*!
 * js-tools library
 * Version $version built $today
 * https://github.com/CanDo-com/js-tools.git
 *
 * Copyright (c) 2015 Advertical LLC dba CanDo
 * http://cando.com
 *
 * Author Sergiy Misyura <sergiy@cando.com>
 */

EOD;
file_put_contents($destination, $text . $code);

passthru('cd tests; buster-static ./static');
