define(
	"funkysnakes/client/entities/head",
	[
		"funkysnakes/client/components/appearance",
		"funkysnakes/client/components/networkInterpolation",
		"funkysnakes/client/components/powerupEffects",
		"funkysnakes/client/components/renderData",
		"funkysnakes/client/components/shadowCaster",
		"funkysnakes/shared/components/head",
		"funkysnakes/shared/components/activePowerups",
		"funkysnakes/shared/components/orientation",
		"funkysnakes/shared/components/position",
		"funkysnakes/shared/components/body",
		"funkysnakes/shared/components/active",
		'funkysnakes/shared/components/amountTailElements',

		"spell/client/components/network/synchronizationSlave",
		"spell/shared/components/actor"
	],
	function(
		appearance,
		networkInterpolation,
		powerupEffects,
		renderData,
		shadowCaster,
		head,
		activePowerups,
		orientation,
		position,
		body,
		active,
		amountTailElements,

		synchronizationSlave,
		actor
	) {
		"use strict"


		return function( args ) {
			this.appearance = new appearance( {
				textureId : args.headTextureId,
				offset    : [ -29, -28 ]
			} )

			this.shadowCaster = new shadowCaster( {
				textureId : "shadows/vehicle.png"
			} )

			this.powerupEffects = new powerupEffects( {
				baseTextureId          : args.headTextureId,
				speedTextureId         : args.speedTextureId,
				invincibilityTextureId : args.invincibilityTextureId
			} )

			this.activePowerups       = new activePowerups()
			this.actor                = new actor( "player", [ "left", "right" ] )
			this.networkInterpolation = new networkInterpolation()
			this.orientation          = new orientation( args.angle )
			this.position             = new position( [ args.x, args.y, 0 ] )
			this.renderData           = new renderData( { pass: 5 } )
			this.synchronizationSlave = new synchronizationSlave( { id: args.networkId } )
			this.body                 = new body( args.clientId )
			this.head                 = new head( args.clientId )
			this.active               = new active()
			this.amountTailElements   = new amountTailElements()
		}
	}
)
