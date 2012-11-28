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

			if(event.position) {
				this.cursorWorldPosition = spell.renderingContext.transformScreenToWorld( event.position )
			}

			if(event.type == 'keydown' &&  event.keyCode == keyCodes.CTRL || event.keyCode == keyCodes.LEFT_WINDOW_KEY) {
				this.commandMode = true
			} else if(event.type == 'keyup' &&  event.keyCode == keyCodes.CTRL || event.keyCode == keyCodes.LEFT_WINDOW_KEY) {
				this.commandMode = false
			}

			if( this.eventLockPluginInstance && _.indexOf(this.eventLockNames, event.type) !== -1 ) {
				invoke( [ this.eventLockPluginInstance ], event.type, spell, this, event)
			} else {
				invoke( this.plugins, event.type, spell, this, event )
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

			this.commandMode                = false
			this.selectedEntity             = null
			this.cursorWorldPosition        = null

			this.eventLockPluginInstance    = null
			this.eventLockNames             = []

			this.processLockPluginInstance  = null

			for (var i= 0; i< this.activePlugins.length; i++) {
				var pluginConstructor = this.activePlugins[ i ],
					plugin = new pluginConstructor( spell, this )

				this.plugins.push( plugin )
			}
		}

		interactiveEditingSystem.prototype = {
			setSelectedEntity: function( entityId ) {
				this.selectedEntity = entityId
			},

			getSelectedEntity: function( entityId ) {
				return this.selectedEntity
			},

			/**
			 * This function can be used by a plugin to acquire an exclusive process lock.
			 * Only the process function for this function will be called after the lock has been set.
			 * @param pluginInstance
			 */
			acquireProcessLock: function( pluginInstance ) {
				this.processLockPluginInstance = pluginInstance
			},

			releaseProcessLock: function () {
				this.processLockPluginInstance = null
			},

			/**
			 * This function can be used by a plugin to acquire exlusive access to input events
			 * @param pluginInstance
			 */
			acquireEventLock: function( pluginInstance, eventNames ) {
				this.eventLockNames          = eventNames
				this.eventLockPluginInstance = pluginInstance
			},

			/**
			 * If the mouse lock can be released this function must be called
			 * @param pluginInstance
			 */
			releaseEventLock: function( ) {
				this.eventLockNames             = []
				this.eventLockPluginInstance    = null
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

				if( this.processLockPluginInstance !== null) {
					invoke( [ this.processLockPluginInstance ], 'process', spell, this, timeInMs, deltaTimeInMs)
				} else {
					invoke( this.plugins, 'process', spell, this, timeInMs, deltaTimeInMs)
				}

				//consume all input events if we're in commandMode
				if( this.commandMode == true ) {
					spell.inputManager.clearInputEvents()
				}
			}
		}

		return interactiveEditingSystem
	}
)
