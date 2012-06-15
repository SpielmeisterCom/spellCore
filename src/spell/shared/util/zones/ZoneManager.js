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
		 * public
		 */

		var ZoneManager = function( globals, mainLoop ) {
			this.globals          = globals
			this.mainLoop         = mainLoop
		}

		ZoneManager.prototype = {
			startZone: function( zoneConfig ) {
				var zone = new Zone( this.globals )
				zone.init( this.globals, zoneConfig )

				this.mainLoop.setRenderCallback( _.bind( zone.render, zone ) )
				this.mainLoop.setUpdateCallback( _.bind( zone.update, zone ) )
			}
		}

		return ZoneManager
	}
)
