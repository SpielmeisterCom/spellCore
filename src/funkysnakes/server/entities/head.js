define(
	"funkysnakes/server/entities/head",
	[
		"funkysnakes/shared/components/head",
		"funkysnakes/shared/components/active",
		"funkysnakes/shared/components/activePowerups",
		"funkysnakes/shared/components/body",
		"funkysnakes/shared/components/collisionCircle",
		"funkysnakes/shared/components/orientation",
		"funkysnakes/shared/components/position",
		"funkysnakes/shared/components/score",
		"funkysnakes/shared/components/turningDirection",
		'funkysnakes/shared/components/amountTailElements',

		"spell/server/components/network/synchronizationMaster",
		'spell/shared/components/actor'
	],
	function(
		head,
		active,
		activePowerups,
		body,
		collisionCircle,
		orientation,
		position,
		score,
		turningDirection,
		amountTailElements,

		synchronizationMaster,
		actor
	) {
		"use strict"


		return function( args ) {
			this.synchronizationMaster = new synchronizationMaster( {
				id: args.networkId,
				components: [ "orientation", "position", "activePowerups", "collisionCircle", "shield", "amountTailElements" ],
				resendData: function() { return true }
			} )

			this.active             = new active()
			this.activePowerups     = new activePowerups()
			this.body               = new body( args.clientId )
			this.collisionCircle    = new collisionCircle( 18 )
			this.head               = new head( args.clientId )
			this.actor              = new actor( args.clientId, [ "left", "right", "useItem" ] )
			this.orientation        = new orientation( args.angle )
			this.position           = new position( [ args.x, args.y, 0 ] )
			this.score              = new score( args.clientId )
			this.turningDirection   = new turningDirection()
			this.amountTailElements = new amountTailElements()
		}
	}
)
