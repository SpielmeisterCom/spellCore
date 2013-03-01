define(
	'spell/shared/build/initializeProjectDirectory',
	[
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

		return function( spellCorePath, projectName, projectPath, projectFilePath, isDevEnvironment ) {
			var errors          = [],
				publicDirName   = 'public',
				outputPath      = projectPath + '/' + publicDirName,
				html5OutputPath = outputPath + '/html5'

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
					"type"       : "project",
					"startScene" : "",
					"scenes"     : [],
					"version"    : 1
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
						path.join( spellCorePath , 'publicTemplate' , fileName ),
						path.join( projectPath, publicDirName, fileName )
					)
				}
			)

			// Copying engine include. Depending on the execution environment either the development or deployment version of the engine include is used
			// for development.
			if( !fs.existsSync( html5OutputPath ) ) {
				fs.mkdirSync( html5OutputPath )
			}

			var engineIncludeFilename = isDevEnvironment ? 'spell.dev.js' : 'spell.deploy.js'

			copyFile(
				path.join( spellCorePath, 'build', engineIncludeFilename ),
				path.join( html5OutputPath, 'spell.js' )
			)

			// copying stage zero loader
			copyFile(
				path.join( spellCorePath, 'build', 'spell.loader.js' ),
				path.join( outputPath, 'spell.js' )
			)

			return errors
		}
	}
)
