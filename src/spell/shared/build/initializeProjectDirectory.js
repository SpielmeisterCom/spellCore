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

		var LIBRARY_TEMPLATES_PATH = 'library/templates',
			LIBRARY_SCRIPTS_PATH   = 'library/scripts',
			LIBRARY_ASSETS_PATH    = 'library/assets'

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
				'build',
				path.join( LIBRARY_ASSETS_PATH, projectName ),
				path.join( LIBRARY_TEMPLATES_PATH, projectName, 'component' ),
				path.join( LIBRARY_TEMPLATES_PATH, projectName, 'entity' ),
				path.join( LIBRARY_TEMPLATES_PATH, projectName, 'system' ),
				path.join( LIBRARY_SCRIPTS_PATH, projectName )
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
					"name": projectName,
					"startScene": "",
					"scenes": []
				}

				fs.writeFileSync(
					projectFilePath,
					JSON.stringify( data, null, '\t' ),
					'utf-8'
				)
			}

			// copy spell sdk templates, scripts and assets
			copyDirectory( path.join( spellPath, LIBRARY_TEMPLATES_PATH ), path.join( projectPath, LIBRARY_TEMPLATES_PATH ) )
			copyDirectory( path.join( spellPath, LIBRARY_SCRIPTS_PATH ),   path.join( projectPath, LIBRARY_SCRIPTS_PATH ) )
			copyDirectory( path.join( spellPath, LIBRARY_ASSETS_PATH ),    path.join( projectPath, LIBRARY_ASSETS_PATH ) )


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
				spellPath + '/build/spell.dev.js',
				html5OutputPath + '/spell.js'
			)

			// copying stage zero loader
			copyFile(
				spellPath + '/src/spell/client/stageZeroLoader.js',
				outputPath + '/spell.js'
			)

			// add symlink to library directory
			var outputLibraryPath = outputPath + '/library'

			if( !fs.existsSync( outputLibraryPath ) ) {
				fs.symlinkSync( '../library', outputLibraryPath, 'dir' )
			}

			return errors
		}
	}
)
