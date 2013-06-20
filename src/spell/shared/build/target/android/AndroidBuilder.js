define(
	'spell/shared/build/target/android/AndroidBuilder',
	[
		'spell/shared/build/createDataFileContent',
		'spell/shared/build/createDebugPath',
		'spell/shared/build/createProjectLibraryFilePaths',
		'spell/shared/build/copyFile',
		'spell/shared/build/copyFiles',
		'spell/shared/util/createModuleId',
		'spell/shared/build/processSource',
		'spell/shared/build/isDevEnvironment',
		'spell/shared/build/isFile',
		'spell/shared/build/loadAssociatedScriptModules',
		'spell/shared/build/writeFile',
		'spell/shared/util/hashModuleId',

		'amd-helper',
		'child_process',
		'ff',
		'fs',
		'flob',
		'mkdirp',
		'path',
		'rimraf'
	],
	function(
		createDataFileContent,
		createDebugPath,
		createProjectLibraryFilePaths,
		copyFile,
		copyFiles,
		createModuleId,
		processSource,
		isDevEnvironment,
		isFile,
		loadAssociatedScriptModules,
		writeFile,
		hashModuleId,

		amdHelper,
		child_process,
		ff,
		fs,
		flob,
		mkdirp,
		path,
		rmdir
	) {
		'use strict'


		var writeMetaDataFile = function( destinationPath ) {
			writeFile(
				path.join( destinationPath, 'metadata.json' ),
				JSON.stringify( { sprite : false, package : true } )
			)
		}

		var spawnChildProcess = function( command, args, options, next ) {
			var child = child_process.spawn( 'basil', args, options )

			child.stderr.on(
				'data',
				function( data ) {
					process.stdout.write( data )
				}
			)

			child.stderr.on(
				'close',
				function( code ) {
					next()
				}
			)

			return child
		}

		var build = function( spellCorePath, projectPath, projectLibraryPath, outputPath, target, projectConfig, library, cacheContent, scriptSource, minify, anonymizeModuleIds, debug ) {
			var outputAndroidPath = path.join( outputPath, 'android' ),
				spellEnginePath   = path.resolve( spellCorePath, '../../../..' ),
				devkitPath        = path.resolve( spellEnginePath, 'modules', 'devkit' )

//			console.log( 'spellCorePath: ' + spellCorePath )
//			console.log( 'spellEnginePath: ' + spellEnginePath )
//			console.log( 'devkitPath: ' + devkitPath )

			// add component scripts to scriptSource
			var componentScripts = loadAssociatedScriptModules( projectLibraryPath, library.component )

			scriptSource += ',' + processSource(
				_.pluck( componentScripts, 'source' ).join( '\n' ),
				!debug, // minify
				!debug  // anonymizeModuleIds
			)

			// set up temporary devkit project
			var projectId      = projectConfig.config.projectId,
				tmpProjectPath = path.join( projectPath, 'build', 'tmp', 'android', projectId ),
				resourcesPath  = path.join( tmpProjectPath, 'resources' )

			rmdir.sync( tmpProjectPath )
			mkdirp.sync( tmpProjectPath )

			var f = ff(
				function() {
					child_process.exec( 'basil clean-register', undefined, f.wait() )
				},
				function() {
					child_process.exec( 'basil init ' + tmpProjectPath, undefined, f.wait() )
				},
				function() {
					var spelljsResourcesPath = path.join( resourcesPath, 'spelljs' )

					mkdirp.sync( spelljsResourcesPath )

					// create application module and engine library file
					writeFile(
						path.join( spelljsResourcesPath, 'data.js.mp3' ),
						createDataFileContent( scriptSource, cacheContent, projectConfig )
					)

					copyFile(
						createDebugPath( debug, 'spell.debug.js', 'spell.release.js', path.join( spellCorePath, 'lib' ) ),
						path.join( spelljsResourcesPath, 'spell.js.mp3' )
					)

					writeMetaDataFile( spelljsResourcesPath )


					// copy project library directory
					var libraryResourcesPath = path.join( resourcesPath, 'library' )

					copyFiles(
						projectLibraryPath,
						libraryResourcesPath,
						createProjectLibraryFilePaths( projectLibraryPath )
					)

					writeMetaDataFile( libraryResourcesPath )


					// updating sdk directory
					var sdkPath = path.join( tmpProjectPath, 'sdk' )

					rmdir.sync( path.join( resourcesPath, 'fonts' ) )
					rmdir.sync( path.join( resourcesPath, 'images' ) )
					rmdir.sync( sdkPath )
					mkdirp.sync( sdkPath )

					fs.symlinkSync(
						path.join( devkitPath, 'sdk', 'jsio' ),
						path.join( sdkPath, 'jsio' ),
						'junction'
					)

					var launchClientPath = path.join( sdkPath, 'gc', 'native' )

					mkdirp.sync( launchClientPath )

					copyFile(
						path.join( spellEnginePath, 'modules', 'spellCore', 'src', 'spell', 'shared', 'build', 'target', 'android', 'launchClient.js' ),
						path.join( launchClientPath, 'launchClient.js' )
					)
				},
				function() {
					var args = debug ?
						[ 'debug', 'native-android' ] :
						[ 'build', 'native-android' ]

					spawnChildProcess( 'basil', args, { cwd : tmpProjectPath }, f.wait() )
				},
				function() {
					// copy generated apk file to output directory
					mkdirp.sync( outputAndroidPath )

					copyFile(
						path.join( tmpProjectPath, 'build', 'debug', 'native-android', projectId + '.apk' ),
						path.join( outputAndroidPath, projectId + '.apk' )
					)
				}
			)
		}

		var TARGET_NAME = 'android'

		var FlashBuilder = function(
			spellCorePath,
			projectPath,
			projectLibraryPath,
			outputPath,
			target,
			projectConfig,
			library,
			cacheContent,
			scriptSource,
			minify,
			anonymizeModuleIds,
			debug
		) {
			this.spellCorePath      = spellCorePath
			this.projectPath        = projectPath
			this.projectLibraryPath = projectLibraryPath
			this.outputPath         = outputPath
			this.target             = target
			this.projectConfig      = projectConfig
			this.library            = library
			this.cacheContent       = cacheContent
			this.scriptSource       = scriptSource
			this.minify             = minify
			this.anonymizeModuleIds = anonymizeModuleIds
			this.debug              = debug
		}

		FlashBuilder.prototype = {
			init : function() {},
			getName : function() {
				return TARGET_NAME
			},
			handlesTarget : function( x ) {
				return x === 'all' ||
					x === TARGET_NAME
			},
			build : function( next ) {
				console.log( 'AndroidBuilder.build()' )

				build(
					this.spellCorePath,
					this.projectPath,
					this.projectLibraryPath,
					this.outputPath,
					this.target,
					this.projectConfig,
					this.library,
					this.cacheContent,
					this.scriptSource,
					this.minify,
					this.anonymizeModuleIds,
					this.debug
				)
			}
		}

		return FlashBuilder
	}
)
