define(
	'spell/client/development/createApplicationMessageHandler',
	[
		'spell/client/setApplicationModule',
		'spell/client/development/createMessageDispatcher'
	],
	function(
		setApplicationModule,
		createMessageDispatcher
	) {
		'use strict'


		return function( spell, startEngine ) {
			return createMessageDispatcher( {
				/**
				 * Starts the application module. Used in standalone development mode.
				 *
				 * @param payload
				 */
				startApplicationModule : function( payload ) {
					startEngine( payload.applicationModule )
				},

				/**
				 * Sets the application module. Used in embedded development mode.
				 *
				 * @param payload
				 */
				setApplicationModule : function( payload ) {
                    setApplicationModule(
                        spell,
                        spell.configurationManager,
                        payload.applicationModule,
                        payload.applicationModule.config,
                        spell.loaderConfig
                    )
				},

				/**
				 * Adds entries to the library cache. Used in embedded development mode.
				 *
				 * @param payload
				 */
				addToCache : function( payload ) {
					spell.libraryManager.addToCache( payload.cacheContent )
				},

				/**
				 * Starts a scene. Used in embedded development mode.
				 *
				 * @param payload
				 */
				startScene : function( payload ) {
					spell.sceneManager.startScene( payload.targetSceneId, payload.initialConfig, payload.showLoadingScene )
				}
			} )
		}
	}
)
