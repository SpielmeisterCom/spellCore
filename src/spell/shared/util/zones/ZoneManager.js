define(
	'spell/shared/util/zones/ZoneManager',
	[
		'spell/shared/util/Events',
		'spell/shared/util/zones/Zone',

		'spell/shared/util/platform/underscore'
	],
	function(
		Events,
		Zone,

		_
	) {
		'use strict'


		/**
		 * private
		 */

		var zoneId = 0


		/**
		 * public
		 */

		var ZoneManager = function( globals, eventManager, blueprintManager, mainLoop ) {
			this.globals          = globals
			this.eventManager     = eventManager
			this.blueprintManager = blueprintManager
			this.mainLoop         = mainLoop
			this.activeZone       = null
		}


//		ZoneManager.IS_NO_ACTIVE_ZONE_ERROR            = 'The zone you tried to destroy in not an active zone: '
//		ZoneManager.ZONE_TEMPLATE_DOES_NOT_EXIST_ERROR = 'You tried to create an instance of a zone type that doesn't exist: '


		ZoneManager.prototype = {
			startZone: function( config ) {
				var zone = new Zone( this.globals, this.blueprintManager, config.systems )
				zone.init( this.globals, config )

				this.mainLoop.setRenderCallback( _.bind( zone.render, zone ) )
				this.mainLoop.setUpdateCallback( _.bind( zone.update, zone ) )

				this.activeZone = zone
			},
			createZone: function( templateId, args ) {
				var zoneTemplate = this.zoneTemplates[ templateId ]

				if ( zoneTemplate === undefined ) {
					throw ZoneManager.ZONE_TEMPLATE_DOES_NOT_EXIST_ERROR + templateId
				}

				var zone = {
					id         : zoneId++,
					templateId : templateId
				}

				zoneTemplate.onCreate.apply( zone, [ this.globals, args ] )
				this.theActiveZones.push( zone )

				this.eventManager.publish( Events.CREATE_ZONE, [ this, zone ] )

				return zone
			}

//			destroyZone: function( zone, args ) {
//				var wasRemoved = false
//				this.theActiveZones = this.theActiveZones.filter( function( activeZone ) {
//					if ( activeZone === zone ) {
//						wasRemoved = true
//						return false
//					}
//
//					return true
//				} )
//
//				if ( wasRemoved ) {
//					this.zoneTemplates[ zone.templateId ].onDestroy.apply( zone, [ this.globals, args ] )
//
//					this.eventManager.publish( Events.DESTROY_ZONE, [ this, zone ] )
//				}
//				else {
//					throw ZoneManager.IS_NO_ACTIVE_ZONE_ERROR + zone
//				}
//			},
//
//			activeZones: function() {
//				return this.theActiveZones
//			}
		}


		return ZoneManager
	}
)
