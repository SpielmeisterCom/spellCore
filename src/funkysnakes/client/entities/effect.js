define(
	"funkysnakes/client/entities/effect",
	[
		"spell/shared/components/sound/soundEmitter",
		"spell/client/components/network/synchronizationSlave"
	],
	function(
		soundEmitter,
		synchronizationSlave
	) {
		"use strict"


		return function( args ) {
			this.soundEmitter = new soundEmitter( {
				soundId: args.soundId
			} )

			this.synchronizationSlave = new synchronizationSlave( { id: args.networkId } )
		}
	}
)
