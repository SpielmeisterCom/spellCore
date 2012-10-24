define(
	'spell/shared/util/createDebugMessageHandler',
	[
		'spell/shared/util/createCacheContent',
		'spell/shared/util/createLibraryFilePathFromId',
		'spell/shared/util/createId',
		'spell/shared/util/development/updateAsset',
		'spell/shared/util/development/updateScript',
		'spell/shared/util/development/system/add',
		'spell/shared/util/development/system/move',
		'spell/shared/util/development/system/remove',
		'spell/shared/util/development/system/update',
		'spell/shared/util/Events',
		'spell/shared/util/platform/PlatformKit',

		'spell/functions'
	],
	function(
		createCacheContent,
		createLibraryFilePathFromId,
		createId,
		updateAsset,
		updateScript,
		addSystem,
		moveSystem,
		removeSystem,
		updateSystem,
		Events,
		PlatformKit,

		_
	) {
		'use strict'


		var addDebugFlag = function( configurationManager, name, value ) {
			if( !configurationManager.debug ) {
				configurationManager.debug = {}
			}

			configurationManager.debug[ name ] = value
		}

		var startRuntimeModule = function( startEngine, spell, payload ) {
			var runtimeModule = payload.runtimeModule

			spell.runtimeModule = runtimeModule

			/*
			 * The scene provided by the editor includes synchronization metadata. In order to preserve this data and to force the engine to use this version
			 * of the scene, it gets injected into the cache to prevent loading of the "vanilla" version from storage.
			 */
			var scene = payload.scene

			if( scene ) {
				var cacheContent = createCacheContent( [
					{
						content : payload.scene,
						filePath : createLibraryFilePathFromId( createId( scene.namespace, scene.name ) )
					}
				] )
			}

			startEngine( runtimeModule, cacheContent )
		}

		var updateComponent = function( spell, payload ) {
			var success = spell.EntityManager.updateComponent( payload.componentId, payload.entityId, payload.config )

			if( !success ) {
				spell.logger.error( 'Could not update component \'' + payload.componentId + '\' in entity ' + payload.entityId + '.' )
			}
		}

		var drawCoordinateGrid = function( spell, payload ) {
			addDebugFlag( spell.configurationManager, 'drawCoordinateGrid', !!payload )
		}

		var drawTitleSafeOutline = function( spell, payload ) {
			addDebugFlag( spell.configurationManager, 'drawTitleSafeOutline', !!payload )
		}

		var simulateScreenAspectRatio = function( spell, payload ) {
			addDebugFlag( spell.configurationManager, 'screenAspectRatio', payload.aspectRatio )

			spell.eventManager.publish( Events.SCREEN_ASPECT_RATIO, [ payload.aspectRatio ] )
		}

		return function( spell, startEngine ) {
			var messageTypeToHandler = {
				'spelled.debug.startRuntimeModule'        : _.bind( startRuntimeModule, null, startEngine ),
				'spelled.debug.drawCoordinateGrid'        : drawCoordinateGrid,
				'spelled.debug.drawTitleSafeOutline'      : drawTitleSafeOutline,
				'spelled.debug.updateComponent'           : updateComponent,
				'spelled.debug.updateAsset'               : updateAsset,
				'spelled.debug.updateScript'              : updateScript,
				'spelled.debug.simulateScreenAspectRatio' : simulateScreenAspectRatio,
				'spelled.debug.system.add'                : addSystem,
				'spelled.debug.system.move'               : moveSystem,
				'spelled.debug.system.remove'             : removeSystem,
				'spelled.debug.system.update'             : updateSystem,
			}

			return function( message ) {
				var handler = messageTypeToHandler[ message.type ]

				handler( spell, message.payload )
			}
		}
	}
)
