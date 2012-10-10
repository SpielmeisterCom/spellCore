define(
	'spell/shared/util/createDebugMessageHandler',
	[
		'spell/shared/util/createId',
		'spell/shared/util/development/updateAsset',
		'spell/shared/util/development/updateScript',
		'spell/shared/util/development/updateSystem',
		'spell/shared/util/Events',
		'spell/shared/util/platform/PlatformKit',

		'spell/functions'
	],
	function(
		createId,
		updateAsset,
		updateScript,
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

		var executeRuntimeModule = function( startEngine, spell, payload ) {
			spell.runtimeModule = payload
			startEngine( payload )
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
				'spelled.debug.executeRuntimeModule'      : _.bind( executeRuntimeModule, null, startEngine ),
				'spelled.debug.drawCoordinateGrid'        : drawCoordinateGrid,
				'spelled.debug.drawTitleSafeOutline'      : drawTitleSafeOutline,
				'spelled.debug.simulateScreenAspectRatio' : simulateScreenAspectRatio,
				'spelled.debug.updateComponent'           : updateComponent,
				'spelled.debug.updateAsset'               : updateAsset,
				'spelled.debug.updateScript'              : updateScript,
				'spelled.debug.updateSystem'              : updateSystem
			}

			return function( message ) {
				var handler = messageTypeToHandler[ message.type ]

				if( !handler ) return

				handler( spell, message.payload )
			}
		}
	}
)
