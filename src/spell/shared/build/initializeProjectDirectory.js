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
				'public/output/resources/textures',
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

			// copy spell sdk blueprints
			var relativeFilePaths = glob.sync(
				'/**/*.json',
				{
					root : spellPath + LIBRARY_BLUEPRINTS_PATH,
					nomount : true
				}
			)

			_.each(
				relativeFilePaths,
				function( relativeFilePath ) {
					var sourceFilePath = path.join( spellPath, LIBRARY_BLUEPRINTS_PATH, relativeFilePath),
						targetFilePath = path.join( projectPath, LIBRARY_BLUEPRINTS_PATH, relativeFilePath),
						targetDirectoryPath = path.dirname( targetFilePath )

					if( path.existsSync( targetFilePath ) ) return

					if( !path.existsSync( targetDirectoryPath ) ) {
						mkdirp.sync( targetDirectoryPath )
					}

					copyFile( sourceFilePath, targetFilePath )
				}
			)


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
					copyFile(
						spellPath + '/publicTemplate/' + fileName,
						projectPath + '/public/' + fileName
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
