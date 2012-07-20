define(
	'spell/shared/build/executable/buildHtml5Executable',
	[
		'spell/shared/build/copyFile',
		'spell/shared/build/isFile',
		'spell/shared/build/minifySource',

		'fs',
		'path'
	],
	function(
		copyFile,
		isFile,
		minifySource,

		fs,
		path
	) {
		'use strict'


		/*
		 * private
		 */

		var writeRuntimeModule = function( outputFilePath, runtimeModuleSource ) {
			var errors = []

			var outputPath = path.dirname( outputFilePath )

			if( !fs.existsSync( outputPath ) ) {
				fs.mkdirSync( outputPath )
			}

			// delete file if it already exists
			if( isFile( outputFilePath ) ) {
				fs.unlinkSync( outputFilePath )
			}

			fs.writeFileSync( outputFilePath, runtimeModuleSource, 'utf-8' )

			return errors
		}

		var createEngineInclude = function( spellPath, platformAdapterSource, engineSource, minify ) {
			var needjs = fs.readFileSync( spellPath + '/src/need.js'),
			 	source = needjs + '\n' + engineSource + '\n' + platformAdapterSource

			return minify ? minifySource( source ) : source
		}

		var writeEngineInclude = function( outputFilePath, source ) {
			var errors = []

			// delete file if it already exists
			if( isFile( outputFilePath ) ) {
				fs.unlinkSync( outputFilePath )
			}

			fs.writeFileSync( outputFilePath, source, 'utf-8' )

			return errors
		}


		/*
		 * public
		 */

		return function( spellPath, outputPath, platformAdapterSource, engineSource, runtimeModule, minify, next ) {
			var errors = [],
				html5OutputPath = outputPath + '/html5'

			if( !fs.existsSync( html5OutputPath ) ) {
				fs.mkdirSync( html5OutputPath )
			}

			// writing runtime module
			var outputFilePath = html5OutputPath + '/data.js'
			errors = writeRuntimeModule( outputFilePath, runtimeModule )

			if( errors.length > 0 ) return errors


			// writing engine include
			outputFilePath = html5OutputPath + '/spell.js'

			errors = writeEngineInclude(
				outputFilePath,
				createEngineInclude( spellPath, platformAdapterSource, engineSource, minify )
			)

			next( errors )
		}
	}
)
