
define(
	[
		"spell/core/callNextFrame",
		"spell/core/Entity",
		"spell/core/MainLoop",
		"spell/core/MainLoopExecutor",
		"spell/core/Manifest"
	],
	function(
		callNextFrame,
		Entity,
		MainLoop,
		MainLoopExecutor,
		Manifest
	) {
		"use strict";
		
	
		describe( "MainLoopExecutor", function() {
	
			var entities
			var mainLoop
			var entityCreator
			var entityCreatorFactory
			var entityDestroyer
			var entityDestroyerFactory
			
			var mainLoopExecutor
			
			
			beforeEach( function() {
			
				entities = {
					prepareQuery: function() {},
					create: function() {},
					get: function() {},
					remove: function() {},
					query: function() {}
				}
				
				mainLoop = MainLoop.create()
				
				entityCreator = {
					createEntity: function() {},
					commit: function() {}
				}
				entityCreatorFactory = jasmine.createSpy().andReturn( entityCreator )
				
				entityDestroyer = {
					destroyEntity: function() {},
					commit: function() {}
				}
				entityDestroyerFactory = jasmine.createSpy().andReturn( entityDestroyer )
				
				
				
				mainLoopExecutor = MainLoopExecutor.create(
					entities,
					mainLoop,
					entityCreatorFactory,
					entityDestroyerFactory,
					callNextFrame
				)
			} )
			
			describe( "basic functionality", function() {
				
				// Tick-based call group timing is not covered by this spec. It is covered by the acceptance spec,
				// however. The reason for this is, that in order to test tick-based behavior, we'd need to test
				// MainLoopExecutor in isolation, controlling timing using a mock callNextFrame function.
				// This would require a significant rework of this spec. Right now, I don't think it's worth the
				// effort.
				
				it( "should call a function in a single execution group once every iteration.", function() {
					var system   = jasmine.createSpy()
					var manifest = Manifest.create() // empty manifest, no arguments needed
					mainLoop
						.withDurationInSeconds( 0.1 )
						.withTimedGroup( 0.05 )
							.withCallTo( system, manifest )

					mainLoopExecutor.execute()
					waitForMainLoopToStop()
					
					runs( function() {
						expect( system.callCount ).toEqual( 2 )
					} )
				} )
				
				it( "should not call anything, if the duration is zero seconds.", function() {
					var systemA = jasmine.createSpy()
					var systemB = jasmine.createSpy()
					var manifestA = Manifest.create() // empty manifest, no arguments needed
					var manifestB = Manifest.create()
					mainLoop
						.withDurationInSeconds( 0 )
						.withTimedGroup( 0.05 )
							.withCallTo( systemA, manifestA )
						.withTickBasedGroup( 1 )
							.withCallTo( systemB, manifestB )
				
					mainLoopExecutor.execute()
					waitForMainLoopToStop()
					
					runs( function() {
						expect( systemA ).not.toHaveBeenCalled()
						expect( systemB ).not.toHaveBeenCalled()
					} )
				} )
				
				it( "should not call anything, if the duration is zero ticks.", function() {
					var systemA = jasmine.createSpy()
					var systemB = jasmine.createSpy()
					var manifestA = Manifest.create() // empty manifest, no arguments needed
					var manifestB = Manifest.create()
					mainLoop
						.withDurationInTicks( 0 )
						.withTimedGroup( 0.05 )
							.withCallTo( systemA, manifestA )
						.withTickBasedGroup( 1 )
							.withCallTo( systemB, manifestB )
				
					mainLoopExecutor.execute()
					waitForMainLoopToStop()
					
					runs( function() {
						expect( systemA ).not.toHaveBeenCalled()
						expect( systemB ).not.toHaveBeenCalled()
					} )
				} )
				
				it( "should run for the specified duration.", function() {
					var durationInSeconds = 0.05
					mainLoop
						.withDurationInSeconds( durationInSeconds )
				
					var startTime = Date.now()
					mainLoopExecutor.execute()
					
					waitForMainLoopToStop()
					
					runs( function() {
						var endTime = Date.now()
						var timeTaken = ( endTime - startTime ) / 1000
						
						var tolerance = 0.025
						var minimumTime = durationInSeconds - tolerance
						var maximumTime = durationInSeconds + tolerance
						
						expect( timeTaken ).toBeGreaterThan( minimumTime )
						expect( timeTaken ).toBeLessThan( maximumTime )
					} )
				} )
				
				it( "should pass the passedTimeInSeconds variable to the called function.", function() {
					var systemA = jasmine.createSpy()
					var systemB = jasmine.createSpy()
					var manifestA = Manifest.create()
						.pushArgument( "passedTimeInSeconds" )
					var manifestB = Manifest.create()
						.pushArgument( "passedTimeInSeconds" )
					var periodAInSeconds = 0.05
					var periodBInSeconds = 0.1
					mainLoop
						.withDurationInSeconds( 0.1 )
						.withTimedGroup( periodAInSeconds )
							.withCallTo( systemA, manifestA )
						.withTimedGroup( periodBInSeconds )
							.withCallTo( systemB, manifestB )
					
					mainLoopExecutor.execute()
					waitForMainLoopToStop()
					
					runs( function() {
						expect( systemA ).toHaveBeenCalledWith( periodAInSeconds )
						expect( systemB ).toHaveBeenCalledWith( periodBInSeconds )
					} )
				} )
				
				it( "should take the timing of different groups into account.", function() {
					
					var systemA = jasmine.createSpy()
					var systemB = jasmine.createSpy()
					var systemC = jasmine.createSpy()
					var manifestA = Manifest.create() // empty manifests, no arguments needed
					var manifestB = Manifest.create()
					var manifestC = Manifest.create()
					mainLoop
						.withDurationInSeconds( 0.1 )
						.withTimedGroup( 0.05 )
							.withCallTo( systemA, manifestA )
							.withCallTo( systemB, manifestB )
						.withTimedGroup( 0.1 )
							.withCallTo( systemC, manifestC )
					
					mainLoopExecutor.execute()
					waitForMainLoopToStop()
					
					runs( function() {
						expect( systemA.callCount ).toEqual( 2 )
						expect( systemB.callCount ).toEqual( 2 )
						expect( systemC.callCount ).toEqual( 1 )
					} )
				} )
			} )
			
			describe( "component queries", function() {
			
				var aComponents = [ "a1", "a2" ]
				var bComponents = [ "b1", "b2" ]
				
				var entityA = Entity.create( "entityA", [ { name: "a", value: "a1" }, { name: "b", value: "b1" } ] )
				var entityB = Entity.create( "entityB", [ { name: "a", value: "a2" }, { name: "b", value: "b2" } ] )
				
				
				
				beforeEach( function() {
					mainLoop
						.withDurationInSeconds( 0.05 )
				} )
				
				
			
				it( "should pass entities into a function.", function() {
					var queryId = 2
					var system   = jasmine.createSpy()
					var manifest = Manifest.create()
						.pushArgument( "entities" ).withComponents( "a", "b" )
					manifest.arguments[ 0 ].queryId = queryId
					mainLoop
						.withTimedGroup( 0.05 )
							.withCallTo( system, manifest )
					spyOn( entities, "query" ).andReturn( [ entityA, entityB ] )

					mainLoopExecutor.execute()
					waitForMainLoopToStop()
					
					runs( function() {
						expect( entities.query ).toHaveBeenCalledWith( queryId )
						expect( system ).toHaveBeenCalledWith( [ entityA, entityB ] )
					} )
				} )
				
				it( "should create entities.", function() {
					var system   = jasmine.createSpy()
					var manifest = Manifest.create()
						.pushArgument( "createEntity" )
					mainLoop
						.withTimedGroup( 0.05 )
							.withCallTo( system, manifest )
					spyOn( entityCreator, "commit" )
					
					mainLoopExecutor.execute()
					waitForMainLoopToStop()
					
					runs( function() {
						expect( system ).toHaveBeenCalledWith( entityCreator.createEntity )
						expect( entityCreator.commit ).toHaveBeenCalled()
					} )
				} )
				
				it( "should remove entities.", function() {
					var system   = jasmine.createSpy()
					var manifest = Manifest.create()
						.pushArgument( "destroyEntity" )
					mainLoop
						.withTimedGroup( 0.05 )
							.withCallTo( system, manifest )
					spyOn( entityDestroyer, "commit" )
					
					mainLoopExecutor.execute()
					waitForMainLoopToStop()
					
					runs( function() {
						expect( system ).toHaveBeenCalledWith( entityDestroyer.destroyEntity )
						expect( entityDestroyer.commit ).toHaveBeenCalled()
					} )
				} )
			} )
			
			describe( "robustness", function() {
				// The next spec in disabled. The behavior it specifies is valid, however, the uncaught exception
				// breaks the spec runner on node. Unless a solution is found, this spec must stay deactivated.
				xit( "should abort execution if an exception occurs.", function() {
					var system = jasmine.createSpy().andThrow( "This exception can be safely ignored. If you see this, it means that the spec that threw it works correctly." )
					var manifest = Manifest.create()
					mainLoop
						.withTimedGroup( 0.05 )
							.withCallTo( system, manifest )
				
					mainLoopExecutor.execute()
					waitForMainLoopToStop()
					
					runs( function() {
						// Nothing to expect. All we want is that it doesn't time out.
					} )
				} )
			} )
			
			
			function waitForMainLoopToStop() {
				waitsFor( function() {
					return !mainLoop.running
				}, "main loop to stop running." )
			}
		} )
	}
)
