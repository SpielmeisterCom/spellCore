define(
	'spell/shared/build/exportDeploymentArchive',
	[
		'spell/shared/build/isFile',

		'fs',
		'glob',
		'mkdirp',
		'path',
		'tar-async'
	],
	function(
		isFile,

		fs,
		glob,
		mkdirp,
		path,
		tar
	) {
		'use strict'


		/**
		 * private
		 */

		/**
		 * Writes list of files to a tar "tape"
		 *
		 * @param tape
		 * @param rootPath
		 * @param filePaths
		 */
		var writeFiles = function( tape, rootPath, filePaths ) {
			var filePath = filePaths.shift()

			if( filePath ) {
				var absoluteFilePath = path.join( rootPath, filePath )
				if( isFile( absoluteFilePath ) ) {
					var data = fs.readFileSync( absoluteFilePath )

					tape.append(
						filePath,
						data,
						function() {
							writeFiles( tape, rootPath, filePaths )
						}
					)
				} else {
					writeFiles( tape, rootPath, filePaths )
				}

			} else {
				tape.close()
			}
		}


		/**
		 * public
		 */

		return function( projectPath, outputFilePath, next ) {
			var outputPath   = path.dirname( outputFilePath ),
				projectsPath = path.resolve( projectPath, '..' ),
				projectName  = path.basename( projectPath )

			if( !fs.existsSync( outputPath ) ) {
				mkdirp.sync( outputPath )
			}

			// create tar archive
			var tape = new tar( {
				output : fs.createWriteStream( outputFilePath )
			} )

			var filePaths = glob.sync(
				projectName + '/public/**',
				{
					cwd : projectsPath
				}
			)

			writeFiles( tape, projectsPath, filePaths )
		}
	}
)
