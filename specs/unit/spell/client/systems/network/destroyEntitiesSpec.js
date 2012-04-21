define(
	[
		"spell/client/components/network/synchronizationSlave",
		"spell/client/systems/network/destroyEntities",
		"spell/shared/util/network/snapshots"
	],
	function(
		synchronizationSlave,
		destroyEntities,
		snapshots
	) {
		"use strict"
		
		
		describe( "destroyEntities", function() {
			
			var timeInMilliseconds = 1000
			var interpolationDelay = 100
			
			var directlyUpdatedEntities
			var interpolatedEntities
			
			var entityManager
			
			beforeEach( function() {
				directlyUpdatedEntities = []
				interpolatedEntities    = []
				
				entityManager = {
					destroyEntity: function() {}
				}
				spyOn( entityManager, "destroyEntity" )
			} )
			
			it( "should destroy entities that aren't interpolated directly.", function() {
				var entity = {
					component: "component"
				}
				directlyUpdatedEntities.push( entity )
				
				destroyEntities(
					timeInMilliseconds,
					interpolationDelay,
					directlyUpdatedEntities,
					interpolatedEntities,
					entityManager
				)
				
				expect( entityManager.destroyEntity ).toHaveBeenCalledWith( entity )
			} )
			
			it( "should destroy interpolated entities, if the latest snapshot from before the render time.", function() {
				var entity = {
					synchronizationSlave: new synchronizationSlave( 5 )
				}
				snapshots.add(
					entity.synchronizationSlave.snapshots,
					timeInMilliseconds - interpolationDelay - 100,
					{}
				)
				interpolatedEntities.push( entity )
				
				destroyEntities(
					timeInMilliseconds,
					interpolationDelay,
					directlyUpdatedEntities,
					interpolatedEntities,
					entityManager
				)
				
				expect( entityManager.destroyEntity ).toHaveBeenCalledWith( entity )
			} )
			
			it( "should not destroy an interpolated entity if there still is a snapshot after the render time.", function() {
				var entity = {
					synchronizationSlave: new synchronizationSlave( 5 )
				}
				snapshots.add(
					entity.synchronizationSlave.snapshots,
					timeInMilliseconds - interpolationDelay + 100,
					{}
				)
				interpolatedEntities.push( entity )
				
				destroyEntities(
					timeInMilliseconds,
					interpolationDelay,
					directlyUpdatedEntities,
					interpolatedEntities,
					entityManager
				)
				
				expect( entityManager.destroyEntity ).not.toHaveBeenCalled()
			} )
		} )
	}
)
