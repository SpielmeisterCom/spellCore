define(
	[
		"spell/shared/util/zones/ZoneEntityManager"
	],
	function(
		ZoneEntityManager
	) {
		"use strict"
		
		
		describe( "ZoneEntityManager", function() {
		
			var entity = { component: "component" }
			var args   = [ "argA", "argB" ]
			
			var globalEntityManager
			var zoneEntities
			var listener
			var zoneEntityManager
			
			beforeEach( function() {
				globalEntityManager = {
					createEntity   : function() {},
					addComponent   : function() {},
					removeComponent: function() {}
				}
				
				zoneEntities = {
					add   : function() {},
					remove: function() {},
					update: function() {}
				}
				
				listener = {
					onCreateEntity : function() {},
					onDestroyEntity: function() {}
				}
				
				zoneEntityManager = new ZoneEntityManager( globalEntityManager, zoneEntities, [ listener ] )
			} )
			
			describe( "createEntity", function() {
				it( "should pass the argument to the global entity manager.", function() {
					spyOn( globalEntityManager, "createEntity" )
					
					zoneEntityManager.createEntity( "entity", args )
					
					expect( globalEntityManager.createEntity ).toHaveBeenCalledWith( "entity", args )
				} )
				
				it( "should add the entity to the zone's entities.", function() {
					spyOn( globalEntityManager, "createEntity" ).andReturn( entity )
					spyOn( zoneEntities, "add" )
					
					zoneEntityManager.createEntity( "entity", args )
					
					expect( zoneEntities.add ).toHaveBeenCalledWith( entity )
				} )
				
				it( "should notify the listeners.", function() {
					spyOn( globalEntityManager, "createEntity" ).andReturn( entity )
					spyOn( listener, "onCreateEntity" )
					
					zoneEntityManager.createEntity( "entity", args )
					
					expect( listener.onCreateEntity ).toHaveBeenCalledWith( "entity", args, entity )
				} )
				
				it( "should return the created entity.", function() {
					spyOn( globalEntityManager, "createEntity" ).andReturn( entity )
					
					var returnedEntity = zoneEntityManager.createEntity( "entity", args )
					
					expect( returnedEntity ).toEqual( entity )
				} )
			} )
			
			describe( "destroyEntity", function() {
				it( "should remove the entity from the zone's entities.", function() {
					spyOn( zoneEntities, "remove" )
					
					zoneEntityManager.destroyEntity( entity )
					
					expect( zoneEntities.remove ).toHaveBeenCalledWith( entity )
				} )
				
				it( "should notify the listeners.", function() {
					spyOn( listener, "onDestroyEntity" )
					
					zoneEntityManager.destroyEntity( entity )
					
					expect( listener.onDestroyEntity ).toHaveBeenCalledWith( entity )
				} )
			} )
			
			describe( "addComponent", function() {
				it( "should pass the argument to the global entity manager.", function() {
					spyOn( globalEntityManager, "addComponent" )
					
					zoneEntityManager.addComponent( entity, "component", args )
					
					expect( globalEntityManager.addComponent ).toHaveBeenCalledWith( entity, "component", args )
				} )
				
				it( "should update zone's entities.", function() {
					spyOn( zoneEntities, "update" )
					
					zoneEntityManager.addComponent( entity, "otherComponent", args )
					
					expect( zoneEntities.update ).toHaveBeenCalledWith( entity )
				} )
				
				it( "should not update the zone's entities, if the component was there in the first place.", function() {
					spyOn( zoneEntities, "update" )
					
					zoneEntityManager.addComponent( entity, "component", args )
					
					expect( zoneEntities.update ).not.toHaveBeenCalled()
				} )
			} )
			
			describe( "removeComponent", function() {
				it( "should pass the argument to the global entity manager.", function() {
					spyOn( globalEntityManager, "removeComponent" )
					
					zoneEntityManager.removeComponent( entity, "component" )
					
					expect( globalEntityManager.removeComponent ).toHaveBeenCalledWith( entity, "component" )
				} )
				
				it( "should update the zone's entities.", function() {
					spyOn( zoneEntities, "update" )
					
					zoneEntityManager.removeComponent( entity, "component" )
					
					expect( zoneEntities.update ).toHaveBeenCalledWith( entity )
				} )
				
				it( "should not update the zone's entities, if no component has actually been removed.", function() {
					spyOn( zoneEntities, "update" )
					
					zoneEntityManager.removeComponent( "entity", "otherComponent" )
					
					expect( zoneEntities.update ).not.toHaveBeenCalled()
				} )
			} )
		} )
	}
)
