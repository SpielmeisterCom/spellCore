define(
	"spell/shared/util/zones/ZoneManager",
	[
		"spell/shared/util/Events"
	],
	function(
		Events
	) {
		"use strict"


		/**
		 * private
		 */

		var zoneId = 0


		/**
		 * public
		 */

		var ZoneManager = function( eventManager, zoneTemplates, globals ) {
			this.eventManager   = eventManager
			this.zoneTemplates  = zoneTemplates
			this.globals        = globals
			this.theActiveZones = []
		}


		ZoneManager.IS_NO_ACTIVE_ZONE_ERROR            = "The zone you tried to destroy in not an active zone: "
		ZoneManager.ZONE_TEMPLATE_DOES_NOT_EXIST_ERROR = "You tried to create an instance of a zone type that doesn't exist: "


		ZoneManager.prototype = {
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
			},

			destroyZone: function( zone, args ) {
				var wasRemoved = false
				this.theActiveZones = this.theActiveZones.filter( function( activeZone ) {
					if ( activeZone === zone ) {
						wasRemoved = true
						return false
					}

					return true
				} )

				if ( wasRemoved ) {
					this.zoneTemplates[ zone.templateId ].onDestroy.apply( zone, [ this.globals, args ] )

					this.eventManager.publish( Events.DESTROY_ZONE, [ this, zone ] )
				}
				else {
					throw ZoneManager.IS_NO_ACTIVE_ZONE_ERROR + zone
				}
			},

			activeZones: function() {
				return this.theActiveZones
			}
		}


		return ZoneManager
	}
)
