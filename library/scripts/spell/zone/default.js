define(
	'spell/scene/default',
	[
		'spell/shared/util/Events',

		'spell/functions'
	],
	function(
		Events,

		_
	) {
		'use strict'


		/**
		 * public
		 */

		return {
			cleanup : {},
			init : function( globals, sceneEntityManager, sceneConfig ) {
				var eventManager     = globals.eventManager,
					resourceLoader   = globals.resourceLoader,
					runtimeModule    = globals.runtimeModule,
					resourceBundleId = sceneConfig.name

				if( _.size( runtimeModule.resources ) === 0 ) {
					sceneEntityManager.createEntities( sceneConfig.entities )

				} else {
					eventManager.subscribe(
						[ Events.RESOURCE_LOADING_COMPLETED, resourceBundleId ],
						function() {
							sceneEntityManager.createEntities( sceneConfig.entities )
						}
					)

					// trigger loading of scene resources
					resourceLoader.addResourceBundle( resourceBundleId, runtimeModule.resources )
					resourceLoader.start()
				}
			}
		}
	}
)
