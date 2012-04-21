define(
	[
		"spell/shared/components/input/inputReceiver",
		"spell/shared/systems/input/processInputEvents",
		"spell/shared/util/map"
	],
	function(
		inputReceiver,
		processInputEvents,
		map
	) {
		"use strict"
		
		
		describe( "processInputEvents", function() {
			
			var inputReceiverEntity
			var inputReceivers
			
			beforeEach( function() {
				inputReceiverEntity = {
					id           : 8,
					inputReceiver: new inputReceiver(
						3,
						[ "left", "right" ]
					)
				}
				
				inputReceivers = map.create( [
					[ inputReceiverEntity.id, inputReceiverEntity ]
				] )
			} )
			
			it( "should set an action, if it has been started.", function() {
				inputReceiverEntity.inputReceiver.events.push( {
					type          : "start",
					action        : "left",
					sequenceNumber: 0,
					time          : 1000
				} )
				
				processInputEvents( inputReceivers.elements )
				
				expect( inputReceiverEntity.inputReceiver.actions[ "left" ] ).toEqual( true )
			} )
			
			it( "should clear an action, if it has been stopped.", function() {
				inputReceiverEntity.inputReceiver.events.push( {
					type          : "start",
					action        : "left",
					sequenceNumber: 0,
					time          : 1000
				} )
				inputReceiverEntity.inputReceiver.events.push( {
					type          : "stop",
					action        : "left",
					sequenceNumber: 1,
					time          : 1000
				} )
				
				processInputEvents( inputReceivers.elements )
				
				expect( inputReceiverEntity.inputReceiver.actions[ "left" ] ).toEqual( false )
			} )
			
			it( "should clear the input events after proccessing them.", function() {
				inputReceiverEntity.inputReceiver.events.push( {
					type          : "start",
					action        : "left",
					sequenceNumber: 0,
					time          : 1000
				} )
				inputReceiverEntity.inputReceiver.events.push( {
					type          : "stop",
					action        : "left",
					sequenceNumber: 1,
					time          : 1000
				} )
				
				processInputEvents( inputReceivers.elements )
				
				expect( inputReceiverEntity.inputReceiver.events.length ).toEqual( 0 )
			} )
		} )
	}
)
