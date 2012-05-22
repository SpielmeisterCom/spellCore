define(
	'spell/shared/build/executable/buildHtml5Executable',
	[
		'spell/shared/build/copyFile',
		'spell/shared/build/isFile',

		'fs',
		'path'
	],
	function(
		copyFile,
		isFile,

		fs,
		path
	) {
		'use strict'


		/**
		 * private
		 */

		var writeRuntimeModule = function( outputFilePath, runtimeModuleSource ) {
			var errors = []

			var outputPath = path.dirname( outputFilePath )

			if( !path.existsSync( outputPath ) ) {
				fs.mkdirSync( outputPath )
			}

			// delete file if it already exists
			if( isFile( outputFilePath ) ) {
				fs.unlinkSync( outputFilePath )
			}

			fs.writeFileSync( outputFilePath, runtimeModuleSource, 'utf-8' )

			return errors
		}

		var writeEngineInclude = function( spellPath, outputFilePath, platformAdapterSource, engineSource ) {
			var errors = []

			var needjs         = fs.readFileSync( spellPath + '/src/need.js' ),
				deploymentGlue = fs.readFileSync( spellPath + '/src/spell/shared/build/deploymentGlue.js' ),
				data           = needjs + '\n' + engineSource + '\n' + platformAdapterSource + '\n' + deploymentGlue

			// delete file if it already exists
			if( isFile( outputFilePath ) ) {
				fs.unlinkSync( outputFilePath )
			}

			fs.writeFileSync( outputFilePath, data, 'utf-8' )

			return errors
		}


		/**
		 * public
		 */

		return function( spellPath, outputPath, platformAdapterSource, engineSource, runtimeModule, next ) {
			var errors = [],
				html5OutputPath = outputPath + '/html5'

			if( !path.existsSync( html5OutputPath ) ) {
				fs.mkdirSync( html5OutputPath )
			}

			// writing runtime module
			var outputFilePath = html5OutputPath + '/data.js'
			errors = writeRuntimeModule( outputFilePath, runtimeModule )

			if( errors.length > 0 ) return errors


			// writing engine include
			outputFilePath = html5OutputPath + '/spell.js'

			errors = writeEngineInclude( spellPath, outputFilePath, platformAdapterSource, engineSource )


			next( errors )
		}
	}
)
