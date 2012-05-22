define(
	'spell/shared/build/initializeProjectDirectory',
	[
		'spell/shared/build/copyFile',
		'spell/shared/build/isDirectory',
		'spell/shared/build/isFile',

		'fs',
		'util',
		'spell/shared/util/platform/underscore'
	],
	function(
		copyFile,
		isDirectory,
		isFile,

		fs,
		util,
		_
	) {
		'use strict'


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

			// populate public directory
			var fileNames = [
				'debug.html',
				'debugFlash.html',
				'main.css',
				'playerProductInstall.swf',
				'spellEdShim.html',
				'swfobject.js'
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

			return errors
		}
	}
)
