#!/usr/bin/env node

/**
 * set attribute of library metadata json files
 *
 * usage:
 *
 *   ./setAttribute.js 5 ../library
 */

var flob = require( 'flob' ),
	fs   = require( 'fs' ),
	path = require( 'path' ),
	_    = require( 'underscore' )

var cwd            = process.cwd(),
	argv           = process.argv.splice( 2 )

if( argv.length !== 2 ) {
	console.log( 'No path to library and or version supplied.' )
	process.exit( 0 )
}

var libraryPath    = path.resolve( cwd, argv[ 0 ] ),
	filePaths      = flob.sync( '**/*.json', { root : libraryPath } ),
	attributeName  = 'version',
	attributeValue = parseInt( argv[ 1 ], 10 )


var createJson = function( filePath ) {
	try {
		return JSON.parse(
			fs.readFileSync( filePath, 'utf-8' )
		)

	} catch( e ) {
		if( e.indexOf( 'SyntaxError' ) === 0 ) {
			errors.push( 'Error: Unexpected token \'' + _.last( e.toString().split( ' ' ) ) + '\' while parsing file \'' + filePath + '\'.' )
		}
	}
}

var writeFile = function( filePath, content ) {
	// delete file if it already exists
	if( fs.existsSync( filePath ) ) {
		fs.unlinkSync( filePath )
	}

	console.log( content )

	fs.writeFileSync( filePath, content, 'utf-8' )
}


console.log( ' -> updating library \'' + libraryPath + '\'' )

_.each(
	filePaths,
	function( filePath ) {
		var fullyQualifiedFilePath = path.join( libraryPath, filePath )

		var content = createJson( fullyQualifiedFilePath )

		content[ attributeName ] = attributeValue

//		console.log( content )
//		process.exit(0)

		writeFile(
			fullyQualifiedFilePath,
			JSON.stringify( content, null, '\t' )
		)
	}
)


