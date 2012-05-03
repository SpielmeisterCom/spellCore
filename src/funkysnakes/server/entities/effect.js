define(
	"funkysnakes/server/entities/effect",
	[
		"spell/shared/components/sound/soundEmitter",
		"spell/server/components/network/synchronizationMaster"
	],
	function(
		soundEmitter,
		synchronizationMaster
	) {
		"use strict"


		return function( args ) {
			this.synchronizationMaster = new synchronizationMaster( {
				id: args.networkId,
				components: [ "soundEmitter" ],
				resendData: function() { return true }
			} )

			this.soundEmitter = new soundEmitter( {
				soundId: args.soundId
			} )
		}
	}
)
