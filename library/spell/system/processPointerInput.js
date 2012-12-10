define(
	'spell/system/processPointerInput',
	[
		'spell/math/util',
		'spell/functions'
	],
	function(
		mathUtil,
		_
	) {
		'use strict'
		
		var eventHandlerNames = [
			/**
			 * Event that is triggered when a contact touches the screen on element
			 */
			'pointerDown',

			/**
			 * Event that is triggered when a contact moves on the screen while over an element
			 */
			'pointerMove',
			
			/**
			 * Event that is triggered when a contact is raised off of the screen over an element
			 */
			'pointerUp',
			
			/**
			 * Event that is triggered when a contact moves from outside to inside the bounds of this element. 
			 * This event is always raised, whether or not the pointer is captured to this element
			 */
			'pointerOver',
			
			/**
			 * This event is triggered when a pointer moves from inside to outside the boundaries of this element. 
			 * This event is always raised, whether or not the pointer is captured to this element.
			 */
			'pointerOut',
			
			/**
			 * Event that is triggered when a contact (normally a pen) moves over an element without touching the surface
			 */
			'pointerHoover'
		]
		
		var registeredEventHandlerMap = {}
		
		/**
		 * Creates an instance of the system.
		 *
		 * @constructor
		 * @param {Object} [spell] The spell object.
		 */
		var processPointerInput = function( spell ) {
			
		}
		
		//private
		var isPointWithinEntity = function ( entityManager, transform, worldPosition, entityId ) {
			var entityDimensions 	= entityManager.getEntityDimensions( entityId )

			return mathUtil.isPointInRect( worldPosition, transform.worldTranslation, entityDimensions[ 0 ], entityDimensions[ 1 ], transform.worldRotation )

		}
		
		var processEvent = function( spell, entityManager, inputEvent ) {
			var pointedEntityMap = this.pointedEntityMap
		
			if ( inputEvent.type === 'mousedown' || inputEvent.type === 'mousemove' ) {

				var cursorWorldPosition = spell.renderingContext.transformScreenToWorld( inputEvent.position )
		
				for( var entityId in this.transforms ) {
					if( pointedEntityMap[ entityId ] === undefined ) {
						pointedEntityMap[ entityId ] = false
					}

					if( isPointWithinEntity( entityManager, this.transforms[ entityId ], cursorWorldPosition, entityId ) ) {
						
						if( inputEvent.type === 'mousedown') {
							entityManager.triggerEvent( entityId, 'pointerDown' )

						} else if ( inputEvent.type === 'mousemove' ) {
							entityManager.triggerEvent( entityId, 'pointerMove' )
						}

						if( pointedEntityMap[ entityId ] === false ) {
							pointedEntityMap[ entityId ] = true
							entityManager.triggerEvent( entityId, 'pointerOver' )
						}

					} else {

						if( pointedEntityMap[ entityId ] === true ) {
							pointedEntityMap[ entityId ] = false
							entityManager.triggerEvent( entityId, 'pointerOut' )
						}

					}
				}
			}
			

		}
		
		processPointerInput.prototype = {
			/**
		 	 * Gets called when the system is created.
		 	 *
		 	 * @param {Object} [spell] The spell object.
			 */
			init: function( spell ) {
				/**
				 * Holds a map entityId => Boolean whether an entity is currently pointed to or not
				 * @type {Object}
				 */
				this.pointedEntityMap = {}
			},
		
			/**
		 	 * Gets called when the system is destroyed.
		 	 *
		 	 * @param {Object} [spell] The spell object.
			 */
			destroy: function( spell ) {
				
			},
		
			/**
		 	 * Gets called when the system is activated.
		 	 *
		 	 * @param {Object} [spell] The spell object.
			 */
			activate: function( spell ) {
				
			},
		
			/**
		 	 * Gets called when the system is deactivated.
		 	 *
		 	 * @param {Object} [spell] The spell object.
			 */
			deactivate: function( spell ) {
				
			},
		
			/**
		 	 * Gets called to trigger the processing of game state.
		 	 *
			 * @param {Object} [spell] The spell object.
			 * @param {Object} [timeInMs] The current time in ms.
			 * @param {Object} [deltaTimeInMs] The elapsed time in ms.
			 */
			process: function( spell, timeInMs, deltaTimeInMs ) {
				var entityManager    = spell.entityManager,
					inputEvents      = spell.inputManager.getInputEvents()

				for( var i = 0, numInputEvents = inputEvents.length; i < numInputEvents; i++ ) {
					processEvent.call( this, spell, entityManager, inputEvents[ i ] )
				}				
			}
		}
		
		return processPointerInput
	}
)
