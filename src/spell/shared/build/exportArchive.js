define(
	'spell/shared/build/exportArchive',
	[
		'spell/shared/build/cleanDirectory',
		'spell/shared/build/executeCreateBuild',
		'spell/shared/build/isFile',

		'ff',
		'fs',
		'flob',
		'mkdirp',
		'path',
		'zipstream'
	],
	function(
		cleanDirectory,
		executeCreateBuild,
		isFile,

		ff,
		fs,
		flob,
		mkdirp,
		path,
		ZipStream
	) {
		'use strict'


		var addFile = function( zip, rootPath, filePaths, next ) {
			var filePath = filePaths.shift()

			if( filePath ) {
				var absoluteFilePath = path.join( rootPath, filePath )

				if( isFile( absoluteFilePath ) ) {
					zip.addFile(
						fs.createReadStream( absoluteFilePath ),
						{ name : filePath.replace( /\/build\/release/, '' ) },
						function() {
							addFile( zip, rootPath, filePaths, next )
						}
					)

				} else {
					addFile( zip, rootPath, filePaths, next )
				}

			} else {
				zip.finalize(
					function( numBytesWritten ) {
						next()
					}
				)
			}
		}

		var createZipFile = function( outputFilePath, rootPath, fileNames, next ) {
			var zip = ZipStream.createZip( { level: 1 } ),
				out = fs.createWriteStream( outputFilePath )

			zip.pipe( out )

			addFile( zip, rootPath, fileNames, next )
		}


		return function( spellCorePath, projectPath, outputFilePath, target, next ) {
			var outputPath         = path.dirname( outputFilePath ),
				projectsPath       = path.resolve( projectPath, '..' ),
				projectName        = path.basename( projectPath ),
				projectFilePath    = path.join( projectPath, 'project.json' ),
				projectBuildPath   = path.join( projectPath, 'build' ),
				inputPath          = path.join( projectBuildPath, 'release' ),
				minify             = true,
				anonymizeModuleIds = true,
				debug              = false

			if( !fs.existsSync( outputPath ) ) {
				mkdirp.sync( outputPath )
			}

			var f = ff(
				function() {
					if( !target &&
						fs.existsSync( inputPath ) ) {

						return
					}

					console.log( 'cleaning...' )

					cleanDirectory( projectBuildPath )


					console.log( 'building...' )

					executeCreateBuild(
						spellCorePath,
						projectPath,
						projectFilePath,
						target,
						minify,
						anonymizeModuleIds,
						debug,
						f.wait()
					)
				},
				function() {
					// create archive
					console.log( 'creating archive "' + outputFilePath + '"...' )

					var filePaths = flob.sync(
						projectName + '/build/release/**',
						{
							cwd : projectsPath
						}
					)

					createZipFile( outputFilePath, projectsPath, filePaths, f.wait() )
				}
			).onComplete( next )
		}
	}
)
