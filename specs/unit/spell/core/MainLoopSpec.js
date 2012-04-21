
define(
	[
		"spell/core/MainLoop"
	],
	function(
		MainLoop
	) {
	
		"use strict";
		
		
	
		describe( "MainLoop", function() {
		
			var mainLoop = null
			
			beforeEach( function() {
				mainLoop = MainLoop.create()
			} )
			
			it( "should create a main loop with default values.", function() {
				expect( mainLoop.running             ).toEqual( false )
				expect( mainLoop.timedCallGroups     ).toEqual( [] )
				expect( mainLoop.tickBasedCallGroups ).toEqual( [] )
				expect( mainLoop.durationInSeconds   ).toBeUndefined()
				expect( mainLoop.durationInTicks     ).toBeUndefined()
			} )
		
			it( "should set the running variable.", function() {
				mainLoop = mainLoop.isRunning( true )
				
				expect( mainLoop.running ).toEqual( true )
			} )
			
			it( "should set the duration in seconds.", function() {
				var durationInSeconds = 0.5
				
				mainLoop = mainLoop.withDurationInSeconds( durationInSeconds )
				
				expect( mainLoop.durationInSeconds ).toEqual( durationInSeconds )
			} )
			
			it( "should set the duration in ticks.", function() {
				var durationInTicks = 5
				
				mainLoop = mainLoop.withDurationInTicks( durationInTicks )
				
				expect( mainLoop.durationInTicks ).toEqual( durationInTicks )
			} )
			
			it( "should add a timed call group.", function() {
				var periodInSeconds = 0.5
				mainLoop = mainLoop.withTimedGroup( periodInSeconds )
				
				var expectedGroup = []
				expectedGroup.accumulatedTimeInSeconds = 0
				expectedGroup.periodInSeconds = periodInSeconds
				expect( mainLoop.timedCallGroups[ 0 ] ).toEqual( expectedGroup )
			} )
			
			it( "should add a tick-based call group.", function() {
				var periodInTicks = 3
				mainLoop = mainLoop.withTickBasedGroup( periodInTicks )
				
				var expectedGroup = []
				expectedGroup.periodInTicks = periodInTicks
				expect( mainLoop.tickBasedCallGroups[ 0 ] ).toEqual( expectedGroup )
			} )
			
			it( "should add a call and its manifest to a call group.", function() {
				var system = function() {}
				var manifest = "manifest"
				
				mainLoop = mainLoop
					.withTimedGroup( 0.5 )
						.withCallTo( system, manifest )
				
				expect( mainLoop.timedCallGroups[ 0 ][ 0 ].system ).toEqual( system )
				expect( mainLoop.timedCallGroups[ 0 ][ 0 ].manifest ).toEqual( manifest )
			} )
		} )
	}
)
