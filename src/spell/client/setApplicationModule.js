define(
	'spell/client/setApplicationModule',
	function() {
		'use strict'


		return function( spell, configurationManager, applicationModule ) {
			if( !applicationModule ) {
				throw 'Error: Missing application module. Please provide a application module.'
			}

			spell.applicationModule = applicationModule

			configurationManager.setConfig( applicationModule.config )
		}
	}
)
