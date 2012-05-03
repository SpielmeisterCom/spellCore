define(
	"funkysnakes/client/entities/background",
	[
		"funkysnakes/shared/components/position",
		"funkysnakes/client/components/appearance",
		"funkysnakes/client/components/renderData",
		"spell/shared/components/sound/soundEmitter"
	],
	function(
		position,
		appearance,
		renderData,
		soundEmitter
	) {
		"use strict"


		return function( args ) {
			this.position   = new position( args.position || [ 0, 0, 0 ] )

			this.appearance = new appearance( {
				textureId: args.textureId
			} )

			this.renderData = new renderData( { pass: 1 } )

			this.soundEmitter = new soundEmitter( {
				soundId:'music/music',
				volume: 0.5,
				onComplete: soundEmitter.ON_COMPLETE_LOOP,
				background: true
			} )
		}
	}
)
