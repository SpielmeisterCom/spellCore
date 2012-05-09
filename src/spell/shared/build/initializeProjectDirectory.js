define(
	'spell/shared/build/initializeProjectDirectory',
	[
		'spell/shared/build/copyFile',
		'spell/shared/build/isDirectory',
		'spell/shared/build/isFile',

		'fs',
		'util',
		'underscore'
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


		return function( spellPath, projectPath, projectFilePath ) {
			var errors = []

			// create directory structure
			var paths = [
				'public',
				'public/output',
				'public/output/resources',
				'public/output/resources/textures',
				'library',
				'library/blueprints'
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
				var data = {"id":1,"name":"","startZone":"","zones":[]}

				fs.writeFileSync(
					projectFilePath,
					JSON.stringify( data, null, '\t' ),
					'utf-8'
				)
			}

			// populate public directory
			var fileNames = [
				'development.html',
				'main.css',
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

			return errors
		}
	}
)
