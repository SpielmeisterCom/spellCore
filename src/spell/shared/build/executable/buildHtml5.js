define(
	'spell/shared/build/executable/buildHtml5',
	[
		'spell/shared/build/copyFiles',
		'spell/shared/util/createModuleId',
		'spell/shared/build/processSource',
		'spell/shared/build/isDevEnvironment',
		'spell/shared/build/isDirectory',
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
		copyFiles,
		createModuleId,
		processSource,
		isDevEnvironment,
		isDirectory,
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
			'spell.setRuntimeModule(%3$s);'
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


		return function( spellCorePath, projectPath, projectLibraryPath, deployPath, projectConfig, library, cacheContent, scriptSource, minify, anonymizeModuleIds, debug, next ) {
			var errors            = [],
				deployLibraryPath = path.join( deployPath, 'library' ),
				deployHtml5Path   = path.join( deployPath, 'html5' )


			// remove complete old deploy directory
			rmdir.sync( deployHtml5Path )

			// add component scripts to scriptSource
			var componentScripts = loadAssociatedScriptModules( projectLibraryPath, library.component )

			scriptSource += processSource(
				_.pluck( componentScripts, 'source' ).join( '\n' ),
				!debug, // minify
				!debug  // anonymizeModuleIds
			)

			// copying all files required by the build to the deployment directory "build/release"

			// write data file to "build/release/html5/data.js"
			if( !fs.existsSync( deployHtml5Path ) ) {
				mkdirp.sync( deployHtml5Path )
			}

			var dataFilePath = path.resolve( deployHtml5Path, 'data.js' )

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
			var deployFilePaths = [],
				buildDir        = isDevEnvironment( spellCorePath ) ? 'build' : ''

			deployFilePaths.push( [
				path.join( spellCorePath, debug ? path.join( buildDir, 'spell.dev.js' ) : path.join( buildDir, 'spell.deploy.js' ) ),
				path.join( deployHtml5Path, 'spell.js' )
			] )

			copyFiles( projectLibraryPath, deployLibraryPath, deployFilePaths )

			next()
		}
	}
)
