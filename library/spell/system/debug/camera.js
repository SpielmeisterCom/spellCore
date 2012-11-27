/**
 * @class spell.system.debug.camera
 * @singleton
 */

define(
	'spell/system/debug/camera',
	[
		'spell/script/editor/cameraMover',
		'spell/script/editor/entityMover',
		'spell/script/editor/tilemapEditor',

		'spell/math/vec2',
		'spell/math/mat3',
		'spell/functions'
	],
	function(
		cameraMover,
		entityMover,
		tilemapEditor,

		vec2,
		mat3,
		_
	) {
		'use strict'

		var invoke = function( list, functionName ) {
			var args = Array.prototype.slice.call(arguments, 2);

			for( var i = 0; i < list.length; i++ ) {
				var listItem = list[ i ],
					fn = listItem.__proto__[ functionName ]

				if ( fn ) {
					fn.apply( listItem, args )
				}
			}
		}

		var processEvent = function ( spell, event ) {

			var keyCodes = spell.inputManager.getKeyCodes()

			if ( event.type == 'mousewheel' ) {
				invoke( this.plugins, 'onMouseWheel', spell, this, event)

			} else if ( event.type == 'mousemove' ) {

				this.cursorWorldPosition = spell.renderingContext.transformScreenToWorld( event.position )

				invoke( this.plugins, 'onMouseMove', spell, this, event)

			} else if ( event.type == 'mousedown' ) {
				invoke( this.plugins, 'onMouseDown', spell, this, event)

			} else if ( event.type == 'mouseup' ) {
				invoke( this.plugins, 'onMouseUp', spell, this, event)

			} else if ( event.type == 'keydown' ) {

				if( this.commandMode ) {
					invoke( this.plugins, 'onKeyDown', spell, this, event)
				}

				if( event.keyCode == keyCodes.CTRL || event.keyCode == keyCodes.LEFT_WINDOW_KEY) {
					this.commandMode = true
				}

			} else if ( event.type == 'keyup' ) {
				if( this.commandMode ) {
					invoke( this.plugins, 'onKeyUp', spell, this, event)
				}

				if( event.keyCode == keyCodes.CTRL || event.keyCode == keyCodes.LEFT_WINDOW_KEY ) {
					this.commandMode = false
				}
			}

		}

		/**
		 * Creates an instance of the system.
		 *
		 * @constructor
		 * @param {Object} [spell] The spell object.
		 */
		var interactiveEditingSystem = function( spell ) {

			this.activePlugins = [ cameraMover, entityMover, tilemapEditor ]

			//initialize activePlugins
			this.plugins = [ ]

			this.commandMode            = false
			this.selectedEntity         = null
			this.cursorWorldPosition    = null

			for (var i= 0; i< this.activePlugins.length; i++) {
				var pluginConstructor = this.activePlugins[ i ],
					plugin = new pluginConstructor( spell, this )

				this.plugins.push( plugin )
			}
		}

		interactiveEditingSystem.prototype = {
			setSelectedEntity: function ( entityId ) {
				this.selectedEntity = entityId
			},

			getSelectedEntity: function ( entityId ) {
				return this.selectedEntity
			},

			/**
			 * Gets called when the system is created.
			 *
			 * @param {Object} [spell] The spell object.
			 */
			init: function( spell ) {
				invoke( this.plugins, 'init', spell, this)
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
				invoke( this.plugins, 'activate', spell, this)
			},

			/**
			 * Gets called when the system is deactivated.
			 *
			 * @param {Object} [spell] The spell object.
			 */
			deactivate: function( spell ) {
				invoke( this.plugins, 'deactivate', spell, this)
			},

			/**
			 * Gets called to trigger the processing of game state.
			 *
			 * @param {Object} [spell] The spell object.
			 * @param {Object} [timeInMs] The current time in ms.
			 * @param {Object} [deltaTimeInMs] The elapsed time in ms.
			 */
			process: function( spell, timeInMs, deltaTimeInMs ) {

				//process event queue
				var inputEvents      = spell.inputManager.getInputEvents()
				for( var i = 0, numInputEvents = inputEvents.length; i < numInputEvents; i++ ) {

					processEvent.call( this, spell, inputEvents[ i ] )

				}
				invoke( this.plugins, 'process', spell, this, timeInMs, deltaTimeInMs)

				//consume all input events if we're in commandMode
				if( this.commandMode == true ) {
					spell.inputManager.clearInputEvents()
				}
			}
		}

		return interactiveEditingSystem
	}
)
