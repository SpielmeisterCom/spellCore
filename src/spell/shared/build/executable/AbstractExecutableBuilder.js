define(
	'spell/shared/build/executable/AbstractExecutableBuilder',
	function() {
		'use strict'


		/**
		 * public
		 */

		var AbstractExecutableBuilder = function() {
			this.engineSource    = null
			this.outputPath    = null
			this.runtimeModule = null
			this.spellPath     = null
		}

		AbstractExecutableBuilder.prototype = {
			setEngineSource : function( source ) {
				this.engineSource = source
			},
			setOutputPath : function( path ) {
				this.outputPath = path
			},
			setRuntimeModule : function( module ) {
				this.runtimeModule = module
			},
			setSpellPath : function( path ) {
				this.spellPath = path
			},
			setTempPath : function( path ) {
				this.tempPath = path
			},
			build : function() {
				console.log( 'building abstract executable' )
			}
		}

		return AbstractExecutableBuilder
	}
)
