define(
	'spell/client/setApplicationModule',
    [
        'spell/functions'
    ],
	function(
        _
    ) {
		'use strict'


		return function( spell, configurationManager, target, applicationModule, loaderConfig ) {
			if( !applicationModule ) {
				throw 'Error: Missing application module. Please provide a application module.'
			}

			var applicationConfig = applicationModule.config,
				targetConfig      = applicationConfig[ target ]

			if( !targetConfig ) {
				throw 'Error: The application config does not include configuration for the target "' + target + '".'
			}

			spell.applicationModule = applicationModule

			// TODO: move all general configuration options below a common parent attribute (i.e. "general") in the project.json
			var generalConfig = _.pick(
				applicationModule.config,
				'screenSize',
				'screenMode',
				'orientation',
				'loadingScene',
				'projectId',
				'version',
				'defaultLanguage',
				'qualityLevels',
				'supportedLanguages'
			)

            // config precedence: loader config > target config > general config
			configurationManager.setConfig( _.extend( generalConfig, targetConfig, loaderConfig ) )
		}
	}
)
