define(
	[
		"spell/client/components/network/synchronizationSlave",
		"spell/client/systems/network/processEntityUpdates",
		"spell/shared/util/network/snapshots"
	],
	function(
		synchronizationSlave,
		processEntityUpdates,
		snapshots
	) {
		"use strict"
		
		
		xdescribe( "processEntityUpdates", function() {
		
			var updateTime         = 1000
			var lastProcessedInput = 8
		
			var entities
			var entityManager
			var incomingMessages
			
			beforeEach( function() {
				entities = {}
				
				entityManager = {
					createEntity   : function() {},
					destroyEntity  : function() {},
					addComponent   : function() {},
					removeComponent: function() {}
				}
				
				incomingMessages = {
					entityUpdate: [ {
						time              : updateTime,
						lastProcessedInput: lastProcessedInput,
						createdEntities   : [],
						destroyedEntities : [],
						updatedEntities   : []
					} ]
				}
			} )
			
			it( "should create entities that have been created on the server.", function() {
				var entityType = "entityType"
				var entityArgs = { value: "some value" }
				
				spyOn( entityManager, "createEntity" )
				incomingMessages.entityUpdate[ 0 ].createdEntities = [ { type: entityType, args: entityArgs } ]
				
				processEntityUpdates(
					entities,
					entityManager,
					incomingMessages
				)
				
				expect( entityManager.createEntity ).toHaveBeenCalledWith( entityType, entityArgs )
			} )
			
			it( "should add the destroy component to destroyed entities.", function() {
				var id     = 4
				var entity = { component: "a component" }
				
				entities[ id ] = entity
				spyOn( entityManager, "addComponent" )
				incomingMessages.entityUpdate[ 0 ].destroyedEntities = [ id ]
				
				processEntityUpdates(
					entities,
					entityManager,
					incomingMessages
				)
				
				expect( entityManager.addComponent ).toHaveBeenCalledWith( entity, "markedForDestruction" )
			} )
			
			it( "should save a snapshot for updated entities.", function() {
				var id     = 4
				var entity = {
					synchronizationSlave: new synchronizationSlave( id )
				}
				var updatedEntity = {
					componentA: { value: "new value for a" },
					componentB: { value: "new value for b" }
				}
				
				entities[ id ] = entity
				incomingMessages.entityUpdate[ 0 ].updatedEntities = [ { id: id, entity: updatedEntity } ]
				
				processEntityUpdates(
					entities,
					entityManager,
					incomingMessages
				)
				
				var expectedSnapshots = snapshots.create()
				snapshots.add( expectedSnapshots, updateTime, {
					lastProcessedInput: lastProcessedInput,
					entity            : updatedEntity
				} )
				expect( entity.synchronizationSlave.snapshots ).toEqual( expectedSnapshots )
			} )
			
			it( "should consume every update it processes.", function() {
				processEntityUpdates(
					entities,
					entityManager,
					incomingMessages
				)
				
				expect( incomingMessages.entityUpdate.length ).toEqual( 0 )
			} )
		} ) 
	}
)
