define(
	'spell/shared/build/exportArchive',
	[
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


		return function( spellCorePath, projectPath, outputFilePath, next ) {
			var outputPath         = path.dirname( outputFilePath ),
				projectsPath       = path.resolve( projectPath, '..' ),
				projectName        = path.basename( projectPath ),
				projectFilePath    = path.resolve( projectPath, 'project.json' ),
				inputPath          = path.join( projectPath, 'build', 'release' ),
				target             = 'html5',
				minify             = true,
				anonymizeModuleIds = true,
				debug              = false

			if( !fs.existsSync( outputPath ) ) {
				mkdirp.sync( outputPath )
			}

			var f = ff(
				function() {
					if( fs.existsSync( inputPath ) ) {
						return
					}

					executeCreateBuild(
						target,
						spellCorePath,
						projectPath,
						projectFilePath,
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
