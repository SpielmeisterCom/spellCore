define(
	"spell/server/components/network/synchronizationMaster",
	function() {
		"use strict"


		return function( args ) {
			this.id               = args.id
			this.components       = args.components
			this.lastSentSnapshot = null
			this.resendData       = args.resendData || null
		}
	}
)
