define(
	'spell/shared/build/initializeProjectDirectory',
	[
		'spell/shared/build/copyFile',
		'spell/shared/build/isDirectory',
		'spell/shared/build/isFile',

		'fs',
		'glob',
		'mkdirp',
		'path',
		'util',
		'spell/shared/util/platform/underscore'
	],
	function(
		copyFile,
		isDirectory,
		isFile,

		fs,
		glob,
		mkdirp,
		path,
		util,
		_
	) {
		'use strict'

		/**
		 * private
		 */

		var LIBRARY_BLUEPRINTS_PATH = '/library/blueprints'
		var LIBRARY_SCRIPTS_PATH    = '/library/scripts'

		/**
		 * Copies the contents of source path to target path recursively
		 *
		 * @param sourcePath
		 * @param targetPath
		 */
		var copyDirectory = function( sourcePath, targetPath ) {
			var relativeFilePaths = glob.sync(
				'/**/*.{js,json}',
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

					if( path.existsSync( targetFilePath ) ) return

					if( !path.existsSync( targetDirectoryPath ) ) {
						mkdirp.sync( targetDirectoryPath )
					}

					copyFile( sourceFilePath, targetFilePath )
				}
			)
		}


		/**
		 * public
		 */

		return function( spellPath, projectName, projectPath, projectFilePath ) {
			var errors = []

			// create directory structure
			var paths = [
				'public',
				'public/output',
				'public/output/resources',
				'library',
				'library/blueprints',
				'library/assets'
			]

			_.each(
				paths,
				function( path ) {
					var fullPath = projectPath + '/' + path

					if( isDirectory( fullPath ) ) return

					fs.mkdirSync( fullPath )
				}
			)

			// create project.json
			if( !isFile( projectFilePath ) ) {
				var data = {
					"name": projectName,
					"startZone": "Zone1",
					"zones": [
						{
							"name": "Zone1",
							"entities": []
						}
					]
				}

				fs.writeFileSync(
					projectFilePath,
					JSON.stringify( data, null, '\t' ),
					'utf-8'
				)
			}

			// copy spell sdk blueprints, scripts
			copyDirectory( spellPath + LIBRARY_BLUEPRINTS_PATH, projectPath + LIBRARY_BLUEPRINTS_PATH )
			copyDirectory( spellPath + LIBRARY_SCRIPTS_PATH, projectPath + LIBRARY_SCRIPTS_PATH )


			// populate public directory
			var fileNames = [
				'debug.html',
				'index.html',
				'main.css',
				'playerProductInstall.swf',
				'spellEdShim.html'
			]

			_.each(
				fileNames,
				function( fileName ) {
					var projectDirectoryFilePath = projectPath + '/public/' + fileName

					if( path.existsSync( projectDirectoryFilePath ) ) return

					copyFile(
						spellPath + '/publicTemplate/' + fileName,
						projectDirectoryFilePath
					)
				}
			)

			copyFile(
				spellPath + '/src/spell/client/stageZeroLoader.js',
				projectPath + '/public/spell.js'
			)


			return errors
		}
	}
)
