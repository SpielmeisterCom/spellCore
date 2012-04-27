define(
	"spell/client/components/network/synchronizationSlave",
	[
		"spell/shared/util/network/snapshots"
	],
	function(
		snapshots
	) {
		"use strict"


		return function( args ) {
			this.id        = args.id
			this.snapshots = snapshots.create()
		}
	}
)
