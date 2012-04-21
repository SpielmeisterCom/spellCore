define(
	[
		"spell/client/components/network/synchronizationSlave",
		"spell/client/systems/network/updateDirectly",
		"spell/shared/util/network/snapshots"
	],
	function(
		synchronizationSlave,
		updateDirectly,
		snapshots
	) {
		"use strict"
		
		
		describe( "updateDirectly", function() {
		
			var entity
			var entitySnapshots
			
			beforeEach( function() {
				var id = 4
				entity = {
					componentA          : { value: "old a" },
					componentB          : { value: "old b" },
					synchronizationSlave: new synchronizationSlave( id )
				}
				
				entitySnapshots = entity.synchronizationSlave.snapshots
				snapshots.add( entitySnapshots, 1000, {
					componentA: { value: "newer a" },
					componentB: { value: "newer b" }
				} )
				snapshots.add( entitySnapshots, 1500, {
					componentA: { value: "newest a" },
					componentB: { value: "newest b" }
				} )
				
				var entities = {}
				entities[ id ] = entity
				
				updateDirectly(	entities )
			} )
			
			it( "should overwrite the entity's components with the version from the latest snapshot.", function() {
				expect( entity.componentA ).toEqual( { value: "newest a" } )
				expect( entity.componentB ).toEqual( { value: "newest b" } )
			} )
			
			it( "should clear all snapshots.", function() {
				expect( snapshots.latest( entitySnapshots ) ).toBeUndefined()
			} )
		} )
	}
)
