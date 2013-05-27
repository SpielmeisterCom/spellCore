define(
	'spell/shared/build/target/android/build',
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

		return function( spellCorePath, projectPath, projectLibraryPath, outputPath, outputLibraryPath, projectConfig, library, cacheContent, scriptSource, minify, anonymizeModuleIds, debug, next ) {
			var outputAndroidPath = path.join( outputPath, 'android' ),
				spellEnginePath   = path.resolve( spellCorePath, '../../../..' ),
				devkitPath        = path.resolve( spellEnginePath, 'modules', 'devkit' )


			console.log( 'spellCorePath: ' + spellCorePath )
			console.log( 'spellEnginePath: ' + spellEnginePath )
			console.log( 'devkitPath: ' + devkitPath )


			// init output directory
			rmdir.sync( outputAndroidPath )
			mkdirp.sync( outputAndroidPath )

			// add component scripts to scriptSource
			var componentScripts = loadAssociatedScriptModules( projectLibraryPath, library.component )

			scriptSource += ',' + processSource(
				_.pluck( componentScripts, 'source' ).join( '\n' ),
				!debug, // minify
				!debug  // anonymizeModuleIds
			)

			// set up temporary devkit project
			var projectId      = projectConfig.config.projectId,
				tmpProjectPath = path.join( projectPath, 'build', 'tmpBasil', projectId ),
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
					var args = [ 'build', 'native-android' ]

					if( debug ) {
						args.push( '--debug' )
						args.push( '--no-compress' )
					}

					spawnChildProcess( 'basil', args, { cwd : tmpProjectPath }, f.wait() )
				},
				function() {
					// copy generated apk file to output directory

					copyFile(
						path.join( tmpProjectPath, 'build', 'debug', 'native-android', projectId + '.apk' ),
						path.join( outputAndroidPath, projectId + '.apk' )
					)
				}
			)
		}
	}
)
