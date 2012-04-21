
define(
	[
		"spell/core/MainLoop",
		"spell/core/MainLoopDefinitionLanguage"
	],
	function(
		MainLoop,
		MainLoopDefinitionLanguage
	) {
		"use strict";
		
		
		describe( "MainLoopDefinitionLanguage", function() {
		
			var period = 0.02
			
			var mainLoop
			var language
			
			beforeEach( function() {
				mainLoop = MainLoop.create()
				language = MainLoopDefinitionLanguage.create( mainLoop )
			} )
			
			it( "should determine the timing.", function() {
				var definitionFunction = function( run ) {
					run.every( period, MainLoopDefinitionLanguage.UNIT_SECONDS, [
						// no calls
					] )
				}
				language.interpret( definitionFunction )
				
				var expectedMainLoop = new MainLoop()
					.withTimedGroup( period )
				expect( mainLoop ).toEqual( expectedMainLoop )
			} )
			
			it( "should save timed call groups.", function() {
				var definitionFunction = function( run ) {
					run.every( period * 2, MainLoopDefinitionLanguage.UNIT_SECONDS, [
						// no calls
					] )
					run.every( period * 3, MainLoopDefinitionLanguage.UNIT_SECONDS, [
						// no calls
					] )
				}
				language.interpret( definitionFunction )
				
				var expectedMainLoop = new MainLoop()
					.withTimedGroup( period * 2 )
					.withTimedGroup( period * 3 )
				expect( mainLoop ).toEqual( expectedMainLoop )
			} )
			
			it( "should save a tick-based call group.", function() {
				var definitionFunction = function( run ) {
					run.everyTick( [
						// no calls
					] )
				}
				language.interpret( definitionFunction )
			
				var expectedMainLoop = MainLoop.create()
					.withTickBasedGroup( 1 )
				expect( mainLoop ).toEqual( expectedMainLoop )
			} )
			
			it( "should save the time the main loop should end, if one is given.", function() {
				var durationInSeconds = 2.5
				
				var definitionFunction = function( run ) {
					run.endAfter( durationInSeconds, MainLoopDefinitionLanguage.UNIT_SECONDS )
				}
				language.interpret( definitionFunction )
				
				var expectedMainLoop = MainLoop.create()
						.withDurationInSeconds( durationInSeconds )
				expect( mainLoop ).toEqual( expectedMainLoop )
			} )
			
			it( "should save the number of ticks that the main loop should run for, if it is given.", function() {
				var durationInTicks = 5
				
				var definitionFunction = function( run ) {
					run.endAfter( durationInTicks, MainLoopDefinitionLanguage.UNIT_TICKS )
				}
				language.interpret( definitionFunction )
				
				var expectedMainLoop = MainLoop.create()
					.withDurationInTicks( durationInTicks )
				expect( mainLoop ).toEqual( expectedMainLoop )
			} )
			
			it( "should save the manifest of a system.", function() {
				var system = function() {}
				system.manifest = "manifest"
				
				var definitionFunction = function( run ) {
					run.every( period, MainLoopDefinitionLanguage.UNIT_SECONDS, [
						system
					] )
				}
				language.interpret( definitionFunction )
				
				var expectedMainLoop = MainLoop.create()
					.withTimedGroup( period )
						.withCallTo( system, system.manifest )
				expect( mainLoop ).toEqual( expectedMainLoop )
			} )
			
			it( "should throw an exception, if a system doesn't have a manifest.", function() {
				var system = function() {}
				var caughtException
				
				var definitionFunction = function( run ) {
					run.every( period, MainLoopDefinitionLanguage.UNIT_SECONDS, [
						system
					] )
				}
				try {
					language.interpret( definitionFunction )
				}
				catch( exception ) {
					caughtException = exception
				}
				
				expect( caughtException ).toContain( MainLoopDefinitionLanguage.NO_MANIFEST_ERROR )
				expect( caughtException ).toContain( system.toString() )
			} )
		} )
	}
)
