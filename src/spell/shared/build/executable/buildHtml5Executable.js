define(
	'spell/shared/build/executable/buildHtml5Executable',
	[
		'spell/shared/build/copyFile',
		'spell/shared/build/isFile',
		'spell/shared/build/processSource',

		'fs',
		'path'
	],
	function(
		copyFile,
		isFile,
		processSource,

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

		return function( spellCorePath, outputPath, platformAdapterSource, engineSource, runtimeModuleSource, minify, anonymizeModules, next ) {
			var errors = [],
				html5OutputPath = outputPath + '/html5'

			if( !fs.existsSync( html5OutputPath ) ) {
				fs.mkdirSync( html5OutputPath )
			}

			// writing runtime module
			var outputFilePath = html5OutputPath + '/data.js'
			errors = writeRuntimeModule(
				outputFilePath,
				processSource( runtimeModuleSource, minify, anonymizeModules )
			)

			if( errors.length > 0 ) return errors


			// writing engine include
			outputFilePath = html5OutputPath + '/spell.js'

			var sourceChunks = [
				fs.readFileSync( spellCorePath + '/src/need.js'),
				engineSource,
				platformAdapterSource
			]

			errors = writeEngineInclude(
				outputFilePath,
				processSource( sourceChunks.join( '\n' ), minify, anonymizeModules )
			)

			next( errors )
		}
	}
)
