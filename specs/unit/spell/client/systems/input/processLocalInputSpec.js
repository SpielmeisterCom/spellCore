define(
	[
		"spell/client/systems/input/processLocalInput",
		"spell/shared/components/input/inputDefinition",
		"spell/shared/components/input/inputReceiver",
		"spell/shared/util/map"
	],
	function(
		processLocalInput,
		inputDefinition,
		inputReceiver,
		map
	) {
		"use strict"
		
		
		describe( "processLocalInput", function() {
		
			var timeInMs = 1000
			var inputId  = 6
			
			var inputDefinitionEntity
			var inputReceiverEntity
			
			var inputDefinitions
			var inputReceivers
			
			beforeEach( function() {
				inputDefinitionEntity = {
					id             : 8,
					inputDefinition: new inputDefinition(
						inputId,
						[
							{ action: "left" , key: 37 },
							{ action: "right", key: 40 }
						]
					)
				}
				
				inputReceiverEntity = {
					id           : 9,
					inputReceiver: new inputReceiver(
						inputId,
						[ "left", "right" ]
					)
				}
				
				inputDefinitions = map.create( [
					[ inputDefinitionEntity.id, inputDefinitionEntity ]
				] )
				inputReceivers = map.create( [
					[ inputReceiverEntity.id, inputReceiverEntity ]
				] )
			} )
			
			it( "should store a start event, if a key is pressed.", function() {
				var inputEvents = [
					{ type: "keydown", keyCode: 37, sequenceNumber: 0 }
				]
				
				processLocalInput(
					timeInMs,
					inputEvents,
					inputDefinitions.elements,
					inputReceivers.elements
				)
				
				expect( inputReceiverEntity.inputReceiver.events ).toEqual( [ {
					type          : "start",
					action        : "left",
					sequenceNumber: 0,
					time          : timeInMs
				} ] )
			} )
			
			it( "should store a stop event, if a key is released.", function() {
				var inputEvents = [
					{ type: "keyup", keyCode: 37, sequenceNumber: 0 }
				]
				
				processLocalInput(
					timeInMs,
					inputEvents,
					inputDefinitions.elements,
					inputReceivers.elements
				)
				
				expect( inputReceiverEntity.inputReceiver.events ).toEqual( [ {
					type          : "stop",
					action        : "left",
					sequenceNumber: 0,
					time          : timeInMs
				} ] )
			} )
			
			it( "should only store the event if input receiver and input definition have the same input id.", function() {
				inputReceiverEntity.inputReceiver.inputId = inputId + 1
				var inputEvents = [
					{ type: "keydown", keyCode: 37, sequenceNumber: 0 }
				]
				
				processLocalInput(
					timeInMs,
					inputEvents,
					inputDefinitions.elements,
					inputReceivers.elements
				)
				
				expect( inputReceiverEntity.inputReceiver.events ).toEqual( [] )
			} )
			
			it( "should not do anything, if no action is specified for the input event.", function() {
				var inputEvents = [
					{ type: "keydown", keyCode: 35, sequenceNumber: 0 }
				]
				
				processLocalInput(
					timeInMs,
					inputEvents,
					inputDefinitions.elements,
					inputReceivers.elements
				)
				
				expect( inputReceiverEntity.inputReceiver.events ).toEqual( [] )
			} )
			
			it( "should clear the input events array.", function() {
				var inputEvents = [
					{ type: "keydown", keyCode: 37, sequenceNumber: 0 }
				]
				
				processLocalInput(
					timeInMs,
					inputEvents,
					inputDefinitions.elements,
					inputReceivers.elements
				)
				
				expect( inputEvents ).toEqual( [] )
			} )
		} )
	}
)
