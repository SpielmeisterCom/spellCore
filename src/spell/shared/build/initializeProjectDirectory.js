define(
	'spell/shared/build/initializeProjectDirectory',
	[
		'spell/shared/build/createDebugPath',
		'spell/shared/build/copyFile',
		'spell/shared/build/isDirectory',
		'spell/shared/build/isFile',

		'fs',
		'flob',
		'mkdirp',
		'path',
		'rimraf',
		'util',
		'spell/functions'
	],
	function(
		createDebugPath,
		copyFile,
		isDirectory,
		isFile,

		fs,
		flob,
		mkdirp,
		path,
		rmdir,
		util,
		_
	) {
		'use strict'

		/*
		 * private
		 */

		var LIBRARY_PATH = 'library'

		/*
		 * Copies the contents of source path to target path recursively
		 *
		 * @param sourcePath
		 * @param targetPath
		 */
		var copyDirectory = function( sourcePath, targetPath ) {
			var relativeFilePaths = flob.sync(
				'/**/*',
				{
					root : sourcePath,
					nomount : true
				}
			)

			_.each(
				relativeFilePaths,
				function( relativeFilePath ) {
					var sourceFilePath = path.join( sourcePath, relativeFilePath ),
						targetFilePath = path.join( targetPath, relativeFilePath ),
						targetDirectoryPath = path.dirname( targetFilePath )

					if( isDirectory( sourceFilePath ) ) return

					if( !fs.existsSync( targetDirectoryPath ) ) {
						mkdirp.sync( targetDirectoryPath )
					}

					copyFile( sourceFilePath, targetFilePath )
				}
			)
		}

		var createDescendantDirectoryPaths = function( inputPath ) {
			return _.filter(
				flob.sync(
					'*',
					{
						root : inputPath,
						nomount : true
					}
				),
				function( x ) {
					var absolutePath = path.resolve( inputPath, x )

					return isDirectory( absolutePath )
				}
			)
		}

		var clearTargetLibraryPath = function( spellCoreLibraryPath, projectLibraryPath ) {
			_.each(
				createDescendantDirectoryPaths( spellCoreLibraryPath ),
				function( directoryPath ) {
					var absolutePath = path.resolve( projectLibraryPath, directoryPath )

					if( !isDirectory( absolutePath ) ) return

					rmdir.sync( absolutePath )
				}
			)
		}

		var createDefaultProjectConfig = function( apiVersion ) {
			return {
				"version": 1,
				"apiVersion": apiVersion,
				"config": {
					"supportedLanguages": []
				},
				"startScene": "",
				"type": "project",
				"scenes": []
			}
		}

		var writeProjectConfigFile = function( projectFilePath, projectConfig ) {
			fs.writeFileSync(
				projectFilePath,
				JSON.stringify( projectConfig, null, '\t' ),
				'utf-8'
			)
		}

		var readProjectConfigFile = function( projectFilePath ) {
			return JSON.parse(
				fs.readFileSync( projectFilePath, 'utf-8' )
			)
		}

		var lessVersionString = function( versionA, versionB, next ) {
			var partsA = versionA.split( '.' ),
				partsB = versionB.split( '.' )

			for( var i = 0, n = Math.max( partsA.length, partsB.length ), a, b; i < n; i++ ) {
				a = parseInt( partsA[ i ] || 0, 10 )

				if( _.isNaN( a ) ) {
					next( 'Error: Version number "' + versionA + '" has invalid syntax.' )
				}

				b = parseInt( partsB[ i ] || a - 1 , 10 )

				if( _.isNaN( b ) ) {
					next( 'Error: Version number "' + versionB + '" has invalid syntax.' )
				}

				if( a < b ) {
					return true
				}
			}

			return false
		}

		var isInitRequired = function( projectApiVersion, toolApiVersion, next ) {
			return lessVersionString( projectApiVersion, toolApiVersion, next )
		}

		var printSuccess = function() {
			console.log( 'Initializing completed successfully.' )
		}

		var createProjectDirectory = function( projectPath, next ) {
			try {
				mkdirp.sync( projectPath )

			} catch( e ) {
				next( e.toString() )
			}
		}

		return function( spellCorePath, projectName, projectPath, projectFilePath, force, apiVersion, isDevEnv, next ) {
			var publicDirName   = 'public',
				outputPath      = path.join( projectPath, publicDirName ),
				html5OutputPath = path.join( outputPath, 'html5' )

			if( !isDirectory( projectPath ) ) {
				createProjectDirectory( projectPath, next )
			}

			if( !isFile( projectFilePath ) ) {
				// initial creation of project config file
				writeProjectConfigFile(
					projectFilePath,
					createDefaultProjectConfig( apiVersion )
				)

			} else {
				// checking project config, updating when necessary
				var projectConfig = readProjectConfigFile( projectFilePath )

				if( !projectConfig ) {
					next( 'Error: Unable to read project config file "' + projectFilePath + '".' )
				}

				var projectApiVersion = projectConfig.apiVersion || '0',
					initRequired      = isInitRequired( projectApiVersion, apiVersion, next )

				if( !initRequired &&
					!force ) {

					console.log( 'Initialization not required: project API version "' + projectApiVersion + '" is up-to-date.' )

					printSuccess()

					next()
				}

				if( force ) {
					console.log( 'Initialization forced: setting project API version from "' + projectApiVersion + '" to "' + apiVersion + '".' )

				} else if( initRequired ) {
					console.log( 'Initialization required: updating project API version from "' + projectApiVersion + '" to "' + apiVersion + '".' )
				}

				projectConfig.apiVersion = apiVersion
				writeProjectConfigFile( projectFilePath, projectConfig )
			}

			// create directory structure
			var directories = [
				publicDirName,
				'build',
				path.join( LIBRARY_PATH, projectName )
			]

			_.each(
				directories,
				function( directory ) {
					var fullPath = path.join( projectPath, directory )

					if( isDirectory( fullPath ) ) return

					mkdirp.sync( fullPath )
				}
			)

			var spellCoreLibraryPath = path.join( spellCorePath, LIBRARY_PATH ),
				projectLibraryPath   = path.join( projectPath, LIBRARY_PATH )

			// remove old spell sdk library
			clearTargetLibraryPath( spellCoreLibraryPath, projectLibraryPath )

			// copy spell sdk library
			copyDirectory( spellCoreLibraryPath, projectLibraryPath )


			// populate public directory
			var fileNames = [
				'main.css',
				'spellEdShim.html'
			]

			_.each(
				fileNames,
				function( fileName ) {
					copyFile(
						path.join( spellCorePath, 'htmlTemplate', fileName ),
						path.join( projectPath, publicDirName, fileName )
					)
				}
			)

			if( !fs.existsSync( html5OutputPath ) ) {
				fs.mkdirSync( html5OutputPath )
			}

			// copying engine library
			copyFile(
				createDebugPath( true, 'spell.debug.js', 'spell.release.js', path.join( spellCorePath, 'lib' ) ),
				path.join( html5OutputPath, 'spell.js' )
			)

			// copying stage zero loader
			copyFile(
				createDebugPath( true, 'spell.loader.js', 'spell.loader.min.js', path.join( spellCorePath, 'lib' ) ),
				path.join( outputPath, 'spell.loader.js' )
			)

			printSuccess()

			next()
		}
	}
)
