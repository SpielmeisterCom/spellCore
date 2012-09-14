define(
	'spell/shared/build/exportDeploymentArchive',
	[
		'spell/shared/build/executeCreateDeployBuild',
		'spell/shared/build/isFile',

		'fs',
		'flob',
		'mkdirp',
		'path',
		'zipstream'
	],
	function(
		executeCreateDeployBuild,
		isFile,

		fs,
		flob,
		mkdirp,
		path,
		ZipStream
	) {
		'use strict'


		/*
		 * private
		 */

		var addFile = function( zip, rootPath, filePaths ) {
			var filePath = filePaths.shift()

			if( filePath ) {
				var absoluteFilePath = path.join( rootPath, filePath )

				if( isFile( absoluteFilePath ) ) {
					zip.addFile(
						fs.createReadStream( absoluteFilePath ),
						{ name : filePath.replace( /\/build\/deploy/, '' ) },
						function() {
							addFile( zip, rootPath, filePaths )
						}
					)

				} else {
					addFile( zip, rootPath, filePaths )
				}

			} else {
				zip.finalize()
			}
		}


		var createZipFile = function( outputFilePath, rootPath, fileNames ) {
			var zip = ZipStream.createZip( { level: 1 } ),
				out = fs.createWriteStream( outputFilePath )

			zip.pipe( out )

			addFile( zip, rootPath, fileNames )
		}


		/*
		 * public
		 */

		return function( spellCorePath, projectPath, outputFilePath, next ) {
			var outputPath      = path.dirname( outputFilePath ),
				projectsPath    = path.resolve( projectPath, '..' ),
				projectName     = path.basename( projectPath ),
				projectFilePath = path.resolve( projectPath, 'project.json' )

			if( !fs.existsSync( outputPath ) ) {
				mkdirp.sync( outputPath )
			}

			// create deployment build
			executeCreateDeployBuild(
				'html5',
				spellCorePath,
				projectPath,
				projectFilePath,
				next
			)

			// create archive
			var filePaths = flob.sync(
				projectName + '/build/deploy/**',
				{
					cwd : projectsPath
				}
			)

			createZipFile( outputFilePath, projectsPath, filePaths )
		}
	}
)
