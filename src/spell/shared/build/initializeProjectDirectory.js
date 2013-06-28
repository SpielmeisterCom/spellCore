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


		/*
		 * public
		 */

		return function( spellCorePath, projectName, projectPath, projectFilePath, isDevEnv, next ) {
			var errors          = [],
				publicDirName   = 'public',
				outputPath      = path.join( projectPath, publicDirName ),
				html5OutputPath = path.join( outputPath, 'html5' )

			// create directory structure
			var paths = [
				publicDirName,
				'build',
				path.join( LIBRARY_PATH, projectName )
			]

			_.each(
				paths,
				function( path ) {
					var fullPath = projectPath + '/' + path

					if( isDirectory( fullPath ) ) return

					mkdirp.sync( fullPath )
				}
			)

			// create project.json
			if( !isFile( projectFilePath ) ) {
				var data = {
				    "version": 1,
				    "config": {
				        "supportedLanguages": []
				    },
				    "startScene": "",
				    "type": "project",
				    "scenes": []
				}

				fs.writeFileSync(
					projectFilePath,
					JSON.stringify( data, null, '\t' ),
					'utf-8'
				)
			}

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

			console.log( 'Initializing completed successfully.' )

			next()
		}
	}
)
