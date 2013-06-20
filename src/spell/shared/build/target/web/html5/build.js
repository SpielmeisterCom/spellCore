define(
	'spell/shared/build/target/web/html5/build',
	[
		'spell/shared/build/createDataFileContent',
		'spell/shared/build/createDebugPath',
		'spell/shared/build/copyFiles',
		'spell/shared/util/createModuleId',
		'spell/shared/build/processSource',
		'spell/shared/build/isDevEnvironment',
		'spell/shared/build/isFile',
		'spell/shared/build/loadAssociatedScriptModules',
		'spell/shared/build/writeFile',
		'spell/shared/util/hashModuleId',

		'amd-helper',
		'fs',
		'flob',
		'mkdirp',
		'path',
		'rimraf'
	],
	function(
		createDataFileContent,
		createDebugPath,
		copyFiles,
		createModuleId,
		processSource,
		isDevEnvironment,
		isFile,
		loadAssociatedScriptModules,
		writeFile,
		hashModuleId,

		amdHelper,
		fs,
		flob,
		mkdirp,
		path,
		rmdir
	) {
		'use strict'


		return function( spellCorePath, projectPath, projectLibraryPath, outputPath, outputLibraryPath, projectConfig, library, cacheContent, scriptSource, minify, anonymizeModuleIds, debug, next ) {
			var outputHtml5Path = path.join( outputPath, 'web', 'html5' )

			// init output directory
			rmdir.sync( outputHtml5Path )
			mkdirp.sync( outputHtml5Path )

			// add component scripts to scriptSource
			var componentScripts = loadAssociatedScriptModules( projectLibraryPath, library.component )

			scriptSource += ',' + processSource(
				_.pluck( componentScripts, 'source' ).join( '\n' ),
				!debug, // minify
				!debug  // anonymizeModuleIds
			)

			// copying all files required by the build to the output directory "build/release"

			// write data file to "build/release/html5/data.js"
			var dataFilePath = path.resolve( outputHtml5Path, 'data.js' )

			writeFile(
				dataFilePath,
				createDataFileContent( scriptSource, cacheContent, projectConfig )
			)

			// engine include goes to "build/release/html5/spell.js"
			var outputFilePaths = []

			outputFilePaths.push( [
				createDebugPath( debug, 'spell.debug.js', 'spell.release.js', path.join( spellCorePath, 'lib' ) ),
				path.join( outputHtml5Path, 'spell.js' )
			] )

			copyFiles( projectLibraryPath, outputLibraryPath, outputFilePaths )

			next()
		}
	}
)
