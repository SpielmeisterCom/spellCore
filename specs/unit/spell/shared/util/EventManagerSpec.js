define(
	[
		"spell/shared/util/EventManager"
	],
	function(
		EventManager
	) {
		"use strict"
		
		
		describe( "EventManager", function() {
		
			var eventManager
			
			var subscriberA
			var subscriberB
			var subscriberC
			
			beforeEach( function() {
				eventManager = new EventManager()
				
				subscriberA = jasmine.createSpy()
				subscriberB = jasmine.createSpy()
				subscriberC = jasmine.createSpy()
			} )
			
			it( "should publish an event to subscribers of the event's scope.", function() {
				eventManager.subscribe( [ "eventType", "scopeA" ], subscriberA )
				eventManager.subscribe( [ "eventType", "scopeA" ], subscriberB )
				eventManager.subscribe( [ "eventType", "scopeB" ], subscriberC )
				
				eventManager.publish( [ "eventType", "scopeA" ], [ "argA", "argB" ] )
				
				expect( subscriberA ).toHaveBeenCalledWith( "argA", "argB" )
				expect( subscriberB ).toHaveBeenCalledWith( "argA", "argB" )
				expect( subscriberC ).not.toHaveBeenCalled()
			} )
			
			it( "should publish an event to subscribers of a parent scope.", function() {
				eventManager.subscribe( [ "eventType", "scopeA" ], subscriberA )
				eventManager.publish( [ "eventType" ], [ "argA", "argB" ] )
				
				expect( subscriberA ).toHaveBeenCalledWith( "argA", "argB" )
			} )
			
			it( "should not publish an event to subscribers that have been unsubscribed.", function() {
				eventManager.subscribe( [ "eventType" ], subscriberA )
				eventManager.unsubscribe( [ "eventType" ], subscriberA )
				
				eventManager.publish( [ "eventType" ], [ "argA", "argB" ] )
				
				expect( subscriberA ).not.toHaveBeenCalled()
			} )
			
			describe( "subscription events", function() {
				it( "should publish an event for every subscription.", function() {
					eventManager.subscribe( [ "subscribe" ], subscriberA )
					
					eventManager.subscribe( [ "eventTypeA", "scope" ], subscriberB )
					
					expect( subscriberA ).toHaveBeenCalledWith( [ "eventTypeA", "scope" ], subscriberB )
				} )
				
				it( "should publish an event for every un-subscription.", function() {
					eventManager.subscribe( [ "unsubscribe" ], subscriberA )
					
					eventManager.subscribe( [ "eventTypeA", "scope" ], subscriberB )
					eventManager.unsubscribe( [ "eventTypeA", "scope" ], subscriberB )
					
					expect( subscriberA ).toHaveBeenCalledWith( ["eventTypeA", "scope" ], subscriberB )
				} )
			} )
		} )
	}
)
