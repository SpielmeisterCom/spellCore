define(
	'spell/shared/build/executable/buildHtml5',
	[
		'spell/shared/build/createDebugPath',
		'spell/shared/build/copyFiles',
		'spell/shared/util/createModuleId',
		'spell/shared/build/processSource',
		'spell/shared/build/isDevEnvironment',
		'spell/shared/build/isFile',
		'spell/shared/build/loadAssociatedScriptModules',
		'spell/shared/util/hashModuleId',

		'amd-helper',
		'fs',
		'flob',
		'mkdirp',
		'path',
		'rimraf'
	],
	function(
		createDebugPath,
		copyFiles,
		createModuleId,
		processSource,
		isDevEnvironment,
		isFile,
		loadAssociatedScriptModules,
		hashModuleId,

		amdHelper,
		fs,
		flob,
		mkdirp,
		path,
		rmdir
	) {
		'use strict'


		var dataFileTemplate = [
			'%1$s;',
			'spell.addToCache(%2$s);',
			'spell.setApplicationModule(%3$s);'
		].join( '\n' )


		var writeFile = function( filePath, content ) {
			// delete file if it already exists
			if( isFile( filePath ) ) {
				fs.unlinkSync( filePath )
			}

			fs.writeFileSync( filePath, content, 'utf-8' )
		}

		var createDataFileContent = function( dataFileTemplate, scriptSource, cacheContent, projectConfig ) {
			return _s.sprintf(
				dataFileTemplate,
				scriptSource,
				JSON.stringify( cacheContent ),
				JSON.stringify( projectConfig )
			)
		}


		return function( spellCorePath, projectPath, projectLibraryPath, outputPath, outputLibraryPath, projectConfig, library, cacheContent, scriptSource, minify, anonymizeModuleIds, debug, next ) {
			var outputHtml5Path = path.join( outputPath, 'html5' )

			// clean output directory
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
				createDataFileContent(
					dataFileTemplate,
					scriptSource,
					cacheContent,
					projectConfig
				)
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
