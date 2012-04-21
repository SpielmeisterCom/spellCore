define(
	[
		"spell/server/components/network/synchronizationMaster",
		"spell/server/systems/network/sendEntityUpdate"
	],
	function(
		synchronizationMaster,
		sendEntityUpdate
	) {
		"use strict"
		
		
		describe( "sendEntityUpdate", function() {
		
			var timeInMs = 1000
			
			var synchronizedEntities
			var playerEntities
			var networkListener
			var client
			var clients
			
			beforeEach( function() {
				synchronizedEntities = {}
				playerEntities       = {}
				
				playerEntities[ 6 ] = {
					inputReceiver: {
						lastProcessedInput: 4
					},
					player: {
						clientId: "clientId"
					}
				}
				
				networkListener = {
					createdEntities  : [],
					destroyedEntities: []
				}
				
				client = {
					send: function() {}
				}
				spyOn( client, "send" )
				
				clients = {
					"clientId": client
				}
			} )
			
			describe( "entity creations", function() {
			
				var entityCreation = { type: "entity", args: { value: "an argument" } }
				
				beforeEach( function() {
					networkListener.createdEntities = [ entityCreation ]
				} )
				
				it( "should send the created entities.", function() {
					sendEntityUpdate(
						timeInMs,
						playerEntities,
						synchronizedEntities,
						networkListener,
						clients
					)
					
					expect( client.send ).toHaveBeenCalledWith( "entityUpdate", {
						time              : timeInMs,
						lastProcessedInput: 4,
						createdEntities   : [ entityCreation ],
						destroyedEntities : [],
						updatedEntities   : []
					} )
				} )
				
				it( "should reset networkListener's createdEntities.", function() {
					sendEntityUpdate(
						timeInMs,
						playerEntities,
						synchronizedEntities,
						networkListener,
						clients
					)
					
					expect( networkListener.createdEntities ).toEqual( [] )
				} )
			} )
			
			describe( "entity destructions", function() {
				
				var networkId = 4
				
				beforeEach( function() {
					networkListener.destroyedEntities = [ networkId ]
				} )
				
				it( "should send the destroyed entities.", function() {
					sendEntityUpdate(
						timeInMs,
						playerEntities,
						synchronizedEntities,
						networkListener,
						clients
					)
					
					expect( client.send ).toHaveBeenCalledWith( "entityUpdate", {
						time              : timeInMs,
						lastProcessedInput: 4,
						createdEntities   : [],
						destroyedEntities : [ networkId ],
						updatedEntities   : []
					} )
				} )
				
				it( "should reset networkListener's destroyedEntities.", function() {
					sendEntityUpdate(
						timeInMs,
						playerEntities,
						synchronizedEntities,
						networkListener,
						clients
					)
					
					expect( networkListener.destroyedEntities ).toEqual( [] )
				} )
			} )
			
			describe( "entity updates", function() {
			
				var networkId = 4
				
				var synchronizedEntity
				
				beforeEach( function() {
					synchronizedEntity = {
						componentA: "componentA",
						componentB: "componentB",
						synchronizationMaster: new synchronizationMaster( {
							id        : networkId,
							components: [ "componentA" ]
						} )
					}
					
					synchronizedEntities[ 9 ] = synchronizedEntity
				} )
				
				it( "should send the updated entities, if the resendData function returns true.", function() {
					synchronizedEntity.synchronizationMaster.resendData = function() { return true }
					synchronizedEntity.synchronizationMaster.lastSentSnapshot = "not null"
					
					sendEntityUpdate(
						timeInMs,
						playerEntities,
						synchronizedEntities,
						networkListener,
						clients
					)
					
					expect( client.send ).toHaveBeenCalledWith( "entityUpdate", {
						time              : timeInMs,
						lastProcessedInput: 4,
						createdEntities   : [],
						destroyedEntities : [],
						updatedEntities   : [ {
							id    : networkId,
							entity: {
								componentA: "componentA"
							}
						} ]
					} )
				} )
				
				it( "should save the last snapshot that was sent to the synchronizationMaster component.", function() {
					sendEntityUpdate(
						timeInMs,
						playerEntities,
						synchronizedEntities,
						networkListener,
						clients
					)
					
					expect( synchronizedEntity.synchronizationMaster.lastSentSnapshot ).toEqual( {
						id    : networkId,
						entity: {
							componentA: "componentA"
						}
					} )
				} )
				
				it( "should not send an entity, if the resendData function returns false.", function() {
					synchronizedEntity.synchronizationMaster.resendData = function() { return false }
					synchronizedEntity.synchronizationMaster.lastSentSnapshot = "not null"
					
					sendEntityUpdate(
						timeInMs,
						playerEntities,
						synchronizedEntities,
						networkListener,
						clients
					)
					
					expect( client.send ).toHaveBeenCalledWith( "entityUpdate", {
						time              : timeInMs,
						lastProcessedInput: 4,
						createdEntities   : [],
						destroyedEntities : [],
						updatedEntities   : []
					} )
				} )
				
				it( "should ignore resendData's result, if no snapshot has been sent yet.", function() {
					synchronizedEntity.synchronizationMaster.resendData = function() { return false }
					
					sendEntityUpdate(
						timeInMs,
						playerEntities,
						synchronizedEntities,
						networkListener,
						clients
					)

					expect( client.send ).toHaveBeenCalledWith( "entityUpdate", {
						time              : timeInMs,
						lastProcessedInput: 4,
						createdEntities   : [],
						destroyedEntities : [],
						updatedEntities   : [ {
							id    : networkId,
							entity: {
								componentA: "componentA"
							}
						} ]
					} )
				} )
				
				it( "should pass the entity and the last snapshot to resendData.", function() {
					synchronizedEntity.synchronizationMaster.resendData = jasmine.createSpy()
					synchronizedEntity.synchronizationMaster.lastSentSnapshot = "snapshot"
					
					sendEntityUpdate(
						timeInMs,
						playerEntities,
						synchronizedEntities,
						networkListener,
						clients
					)
					
					expect( synchronizedEntity.synchronizationMaster.resendData ).toHaveBeenCalledWith(
						synchronizedEntity,
						synchronizedEntity.synchronizationMaster.lastSentSnapshot
					)
				} )
			} )
		} )
	}
)
