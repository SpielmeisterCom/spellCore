define(
	[
		"funkysnakes/shared/util/snapshots",
		
		"underscore"
	],
	function(
		snapshots,
		
		_
	) {
		"use strict"
		
		
		performanceTest( "snapshots", function() {
			var time = 500
			
			var theSnapshots = snapshots.create()
			
			_.times( 10000, function() {
				snapshots.add( theSnapshots, time, {} )
				snapshots.drop( theSnapshots, 500 )
				
				var renderTime = time - 100
				snapshots.snapshotAt( theSnapshots, renderTime )
				snapshots.snapshotAfter( theSnapshots, renderTime )
				
				snapshots.latest( theSnapshots )
				
				time += 50
			} )
		} )
	}
)
