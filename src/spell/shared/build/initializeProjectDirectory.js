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
		'spell/functions'
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

		/*
		 * private
		 */

		var LIBRARY_TEMPLATES_PATH = '/library/templates',
			LIBRARY_SCRIPTS_PATH   = '/library/scripts',
			LIBRARY_ASSETS_PATH    = '/library/assets'

		/*
		 * Copies the contents of source path to target path recursively
		 *
		 * @param sourcePath
		 * @param targetPath
		 */
		var copyDirectory = function( sourcePath, targetPath ) {
			var relativeFilePaths = glob.sync(
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
					if( fs.existsSync( targetFilePath ) ) return

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

		return function( spellPath, projectName, projectPath, projectFilePath ) {
			var errors          = [],
				publicDirName   = 'public',
				outputPath      = projectPath + '/' + publicDirName,
				html5OutputPath = outputPath + '/html5'

			// create directory structure
			var paths = [
				publicDirName,
				'library',
				'library/templates',
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
					"startScene": "Scene1",
					"scenes": [
						{
							"name": "Scene1",
							"scriptId": "spell/scene/default",
							"entities": []
						}
					],
					"systems": {
						"update": [],
						"render": [
							"spell.system.keyInput",
							"spell.system.render"
						]
					}
				}

				fs.writeFileSync(
					projectFilePath,
					JSON.stringify( data, null, '\t' ),
					'utf-8'
				)
			}

			// copy spell sdk templates, scripts and assets
			copyDirectory( spellPath + LIBRARY_TEMPLATES_PATH, projectPath + LIBRARY_TEMPLATES_PATH )
			copyDirectory( spellPath + LIBRARY_SCRIPTS_PATH, projectPath + LIBRARY_SCRIPTS_PATH )
			copyDirectory( spellPath + LIBRARY_ASSETS_PATH, projectPath + LIBRARY_ASSETS_PATH )


			// populate public directory
			var fileNames = [
				'main.css',
				'spellEdShim.html'
			]

			_.each(
				fileNames,
				function( fileName ) {
					var projectDirectoryFilePath = projectPath + '/' + publicDirName + '/' + fileName

					if( fs.existsSync( projectDirectoryFilePath ) ) return

					copyFile(
						spellPath + '/publicTemplate/' + fileName,
						projectDirectoryFilePath
					)
				}
			)

			// copying engine include (built for development mode)
			if( !fs.existsSync( html5OutputPath ) ) {
				fs.mkdirSync( html5OutputPath )
			}

			copyFile(
				spellPath + '/build/spell.js',
				html5OutputPath + '/spell.js'
			)

			// copying stage zero loader
			copyFile(
				spellPath + '/src/spell/client/stageZeroLoader.js',
				outputPath + '/spell.js'
			)

			// add symlink to library directory
			fs.symlinkSync(
				projectPath + '/library',
				outputPath + '/library'
			)

			return errors
		}
	}
)
