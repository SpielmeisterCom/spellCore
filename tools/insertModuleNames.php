#!/usr/bin/php

<?php

function find( $dir, $pattern ) {
	// escape any character in a string that might be used to trick
	// a shell command into executing arbitrary commands
	$dir = escapeshellcmd($dir);
	// get a list of all matching files in the current directory
	$files = glob("$dir/$pattern");
	// find a list of all directories in the current directory
	// directories beginning with a dot are also included
	foreach (glob("$dir/{.[^.]*,*}", GLOB_BRACE|GLOB_ONLYDIR) as $sub_dir){
		$arr   = find($sub_dir, $pattern);  // resursive call
		$files = array_merge($files, $arr); // merge array with files from subdirectory
	}
	// return all found files
	return $files;
}


function hasDefine( $s_filename = "" ) {
	if( $s_filename === "" ) return false;


	$s_pattern = "/.*define\(.*/ms";
	$s_content = file_get_contents( $s_filename );
	$a_matches = array();

	preg_match( $s_pattern, $s_content, $a_matches );


	return ( count( $a_matches ) === 1 );
}


function insertModuleName( $s_filename = "" ) {
	if( $s_filename === "" ) return;


	$s_module_name = preg_replace(
		"/.js/",
		"",
		$s_filename
	);

	$s_module_name = '"' . $s_module_name . '"';


	$s_pattern = "/(.*define\([\s\n]*)(\[.*|function\(.*)/ms";
	$s_content = file_get_contents( $s_filename );
	$a_matches = array();

	preg_match( $s_pattern, $s_content, $a_matches );


//	print_r( $a_matches );


	if( count( $a_matches ) !== 3 ) return;


	$s_pre         = $a_matches[ 1 ];
	$s_post        = $a_matches[ 2 ];
	$s_new_content = $s_pre . "$s_module_name,\n\t" . $s_post;

//	echo( $s_new_content . "\n ");

	file_put_contents(
		$s_filename,
		$s_new_content
	);
}


$a_files = array();

$a_directories = array(
	"funkysnakes",
	"glmatrix-wrapper",
	"spell"
);


foreach( $a_directories as $s_directory ) {
	$a_files = array_merge(
		$a_files,
		find( $s_directory, "*.js" )
	);
}


//foreach( $a_files as $s_filename ) {
//	insertModuleName( $s_filename );
//}


//foreach( $a_files as $s_filename ) {
//	if( hasDefine( $s_filename ) ) {
//		echo( $s_filename . "\n" );
//	}
//}

?>
