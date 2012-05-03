define(
	"funkysnakes/client/entities/speedPowerup",
	[
		"funkysnakes/client/components/appearance",
		"funkysnakes/client/components/networkInterpolation",
		"funkysnakes/client/components/renderData",
		"funkysnakes/client/components/shadowCaster",
		"funkysnakes/shared/components/position",
		"funkysnakes/shared/components/assignedToPlayer",
		"funkysnakes/shared/components/tailElement",
		"funkysnakes/shared/config/players",
		"spell/shared/components/sound/soundEmitter",

		"spell/client/components/network/synchronizationSlave"
	],
	function(
		appearance,
		networkInterpolation,
		renderData,
		shadowCaster,
		position,
		assignedToPlayer,
		tailElement,
		playerConfiguration,
		soundEmitter,

		synchronizationSlave
	) {
		"use strict"


		var createTextureId = function( playerId ) {
			if( playerId === -1 ) {
				return "items/neutral_container.png"
			}


			var player = playerConfiguration[ playerId ]

			return player.bodyTextureId
		}

		return function( args ) {
			this.networkInterpolation = new networkInterpolation()
			this.position             = new position( args.position )
			this.renderData           = new renderData( { pass: 5 } )
			this.synchronizationSlave = new synchronizationSlave( { id: args.networkId } )
			this.assignedToPlayer     = new assignedToPlayer( args.playerId )

			if( args.type === "speed" ) {
				this.appearance = new appearance( {
					textureId : createTextureId( this.assignedToPlayer.playerId ),
					offset    :  [ -12, -12 ]
				} )

				this.soundEmitter = new soundEmitter( {
					soundId:'fx/spawn',
					volume: 0.40
				} )

			} else if( args.type === "spentSpeed" ) {
				this.appearance = new appearance( {
					textureId : "items/dropped_container_0.png",
					offset    :  [ -12, -12 ]
				} )

				this.soundEmitter = new soundEmitter( {
					soundId:'fx/speed',
					volume: 0.60
				} )
			}

			this.shadowCaster= new shadowCaster( {
				textureId: "shadows/container.png"
			} )

			if( args.tailElement ) {
				this.tailElement = new tailElement( args.tailElement )
			}
		}
	}
)
