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
					debugger

					startEngine( payload.applicationModule )
				},

				/**
				 * Sets the application module. Used in embedded development mode.
				 *
				 * @param payload
				 */
				setApplicationModule : function( payload ) {
					debugger

					setApplicationModule( spell, spell.configurationManager, payload.applicationModule )
				},

				/**
				 * Adds entries to the library cache. Used in embedded development mode.
				 *
				 * @param payload
				 */
				addToCache : function( payload ) {
					debugger

					spell.libraryManager.addToCache( payload.cacheContent )
				},

				/**
				 * Starts a scene. Used in embedded development mode.
				 *
				 * @param payload
				 */
				startScene : function( payload ) {
					debugger

					spell.sceneManager.startScene( payload.startSceneId, payload.initialConfig, payload.showLoadingScene )
				}
			} )
		}
	}
)
