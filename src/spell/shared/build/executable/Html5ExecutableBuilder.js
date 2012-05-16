define(
	'spell/shared/build/executable/Html5ExecutableBuilder',
	[
		'spell/shared/build/copyFile',
		'spell/shared/build/executable/AbstractExecutableBuilder',
		'spell/shared/build/isFile',

		'fs',
		'path',

		'underscore.string'
	],
	function(
		copyFile,
		AbstractExecutableBuilder,
		isFile,

		fs,
		path,

		_s
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

		var Html5ExecutableBuilder = function( platformAdapterSource ) {
			this.platformAdapterSource = platformAdapterSource
		}

		Html5ExecutableBuilder.prototype = new AbstractExecutableBuilder()

		Html5ExecutableBuilder.prototype.build = function() {
			var errors = []

			// writing runtime module
			var outputFilePath = this.outputPath + '/html5/data.js'
			errors = writeRuntimeModule( outputFilePath, this.runtimeModule )

			if( errors.length > 0 ) return errors


			// writing engine include
			outputFilePath = this.outputPath + '/html5/spell.js'

			if( !isFile( outputFilePath ) ) {
				return errors.concat( 'Error: Could not read file \'' + outputFilePath + '\'.' )
			}

			errors = writeEngineInclude( this.spellPath, outputFilePath, this.platformAdapterSource, this.engineSource )

			return errors
		}

		return Html5ExecutableBuilder
	}
)
