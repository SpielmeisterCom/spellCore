define(
	'spell/shared/build/target/web/HTML5Builder',
	[
		'spell/shared/build/createBuilderType',
		'spell/shared/build/createDataFileContent',
		'spell/shared/build/createDebugPath',
		'spell/shared/build/copyFiles',
		'spell/shared/util/createModuleId',
		'spell/shared/build/processSource',
		'spell/shared/build/isFile',
		'spell/shared/build/loadAssociatedScriptModules',
		'spell/shared/build/writeFile',
		'spell/shared/util/hashModuleId',

		'amd-helper',
		'fs',
		'flob',
		'mkdirp',
		'path'
	],
	function(
		createBuilderType,
		createDataFileContent,
		createDebugPath,
		copyFiles,
		createModuleId,
		processSource,
		isFile,
		loadAssociatedScriptModules,
		writeFile,
		hashModuleId,

		amdHelper,
		fs,
		flob,
		mkdirp,
		path
	) {
		'use strict'


		var build = function( spellCorePath, projectPath, projectLibraryPath, outputPath, projectConfig, library, cacheContent, scriptSource, minify, anonymizeModuleIds, debug, next ) {
			var outputWebPath        = path.join( outputPath, 'web' ),
				outputWebLibraryPath = path.join( outputWebPath, 'library' ),
				outputWebHtml5Path   = path.join( outputWebPath, 'html5' )

			// add component scripts to scriptSource
			var componentScripts = loadAssociatedScriptModules( projectLibraryPath, library.component )

			scriptSource += ',' + processSource(
				_.pluck( componentScripts, 'source' ).join( '\n' ),
				!debug, // minify
				!debug  // anonymizeModuleIds
			)

			// copying all files required by the build to the output directory "build/release/web"
			mkdirp.sync( outputWebHtml5Path )

			// write data file to "build/release/web/html5/data.js"
			var dataFilePath = path.join( outputWebHtml5Path, 'data.js' )

			writeFile(
				dataFilePath,
				createDataFileContent( scriptSource, cacheContent, projectConfig )
			)

			// engine include goes to "build/release/web/html5/spell.js"
			var outputFilePaths = []

			outputFilePaths.push( [
				createDebugPath( debug, 'spell.debug.js', 'spell.release.js', path.join( spellCorePath, 'lib' ) ),
				path.join( outputWebHtml5Path, 'spell.js' )
			] )

			copyFiles( projectLibraryPath, outputWebLibraryPath, outputFilePaths )

			next()
		}

		var TARGET_NAME  = 'html5',
			HTML5Builder = createBuilderType()

		HTML5Builder.prototype = {
			init : function() {},
			getName : function() {
				return TARGET_NAME
			},
			handlesTarget : function( x ) {
				return 	x === 'all' ||
					x === 'web' ||
					x === TARGET_NAME
			},
			build : function( next ) {
				console.log( 'building for sub-target "' + TARGET_NAME + '"...' )

				build(
					this.environmentConfig.spellCorePath,
					this.projectPath,
					this.projectLibraryPath,
					this.outputPath,
					this.projectConfig,
					this.library,
					this.cacheContent,
					this.scriptSource,
					this.minify,
					this.anonymizeModuleIds,
					this.debug,
					next
				)
			}
		}

		return HTML5Builder
	}
)
