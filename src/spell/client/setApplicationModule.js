define(
	'spell/client/setApplicationModule',
    [
        'spell/functions'
    ],
	function(
        _
    ) {
		'use strict'


		return function( spell, configurationManager, applicationModule, applicationConfig, loaderConfig ) {
			if( !applicationModule ) {
				throw 'Error: Missing application module. Please provide a application module.'
			}

			spell.applicationModule = applicationModule

            // the loader config has a higher priority than the application config
			configurationManager.setConfig( _.extend( applicationConfig, loaderConfig ) )
		}
	}
)
