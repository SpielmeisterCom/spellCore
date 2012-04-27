define(
	"spell/client/systems/network/updateDirectly",
	[
		"spell/shared/util/network/snapshots",
		
		"underscore"
	],
	function(
		snapshots,
		
		_
	) {
		"use strict"
		
		
		return function( entities ) {
			_.each( entities, function( entity ) {
				var entitySnapshots = entity.synchronizationSlave.snapshots
				var latestSnapshot  = snapshots.latest( entitySnapshots )
				
				_.each( latestSnapshot.data, function( component, componentType ) {
					entity[ componentType ] = component
				} )
				
				snapshots.clear( entitySnapshots )
			} )
		}
	}
)
