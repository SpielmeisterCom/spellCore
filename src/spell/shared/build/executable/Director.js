define(
	'spell/shared/build/executable/Director',
	[
		'underscore'
	],
	function(
		_
	) {
		'use strict'


		/**
		 * public
		 */

		var Director = function( builders ) {
			this.builders = builders
		}

		Director.prototype = {
			setEngineSource : function( source ) {
				_.invoke( this.builders, 'setEngineSource', source )
			},
			setOutputPath : function( path ) {
				_.invoke( this.builders, 'setOutputPath', path )
			},
			setRuntimeModule : function( runtimeModule ) {
				_.invoke( this.builders, 'setRuntimeModule', runtimeModule )
			},
			setSpellPath : function( path ) {
				_.invoke( this.builders, 'setSpellPath', path )
			},
			setTempPath : function( path ) {
				_.invoke( this.builders, 'setTempPath', path )
			},
			build : function() {
				var errors = []

				_.each(
					this.builders,
					function( builder ) {
						errors.concat( builder.build() )

						if( errors.length > 0 ) return errors
					}
				)

				return errors
			}
		}

		return Director
	}
)
