define(
	'spell/shared/build/target/web/build',
	[
		'spell/shared/build/copyFiles',
		'spell/shared/build/createDebugPath',
		'spell/shared/build/createProjectLibraryFilePaths',

		'path'
	],
	function(
		copyFiles,
		createDebugPath,
		createProjectLibraryFilePaths,

		path
	) {
		'use strict'


		return function( spellCorePath, projectPath, projectLibraryPath, outputPath, outputLibraryPath, projectConfig, library, cacheContent, scriptSource, minify, anonymizeModuleIds, debug, next ) {
			// copy common files

			// the library files
			var outputFilePaths = createProjectLibraryFilePaths( projectLibraryPath )

			// public template files go to "build/release/*"
			outputFilePaths.push( [
				path.join( spellCorePath, 'htmlTemplate', 'index.html' ),
				path.join( outputPath, 'index.html' )
			] )

			outputFilePaths.push( [
				path.join( spellCorePath, 'htmlTemplate', 'main.css' ),
				path.join( outputPath, 'main.css' )
			] )

			// stage zero loader goes to "build/release/spell.loader.js"
			outputFilePaths.push( [
				createDebugPath( debug, 'spell.loader.js', 'spell.loader.min.js', path.join( spellCorePath, 'lib' ) ),
				path.join( outputPath, 'spell.loader.js' )
			] )

			// copy new library content to destination
			copyFiles( projectLibraryPath, outputLibraryPath, outputFilePaths )

			next()
		}
	}
)
