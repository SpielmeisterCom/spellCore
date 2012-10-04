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
					"scenes"     : []
				}

				fs.writeFileSync(
					projectFilePath,
					JSON.stringify( data, null, '\t' ),
					'utf-8'
				)
			}

			// copy spell sdk library
			copyDirectory( path.join( spellCorePath, LIBRARY_PATH ), path.join( projectPath, LIBRARY_PATH ) )


			// populate public directory
			var fileNames = [
				'main.css',
				'spellEdShim.html'
			]

			_.each(
				fileNames,
				function( fileName ) {
					var projectDirectoryFilePath = projectPath + '/' + publicDirName + '/' + fileName

					copyFile(
						spellCorePath + '/publicTemplate/' + fileName,
						projectDirectoryFilePath
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
				html5OutputPath + '/spell.js'
			)

			// copying stage zero loader
			copyFile(
				spellCorePath + '/src/spell/client/stageZeroLoader.js',
				outputPath + '/spell.js'
			)

			return errors
		}
	}
)
