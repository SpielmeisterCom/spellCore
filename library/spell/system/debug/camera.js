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

		var PLUGIN_MANIFEST = {
			'cameraMover':      cameraMover,
			'entityMover':      entityMover,
			'tilemapEditor':    tilemapEditor
		};


		/**
		 * Creates an instance of the system.
		 *
		 * @constructor
		 * @param {Object} [spell] The spell object.
		 */
		var interactiveEditingSystem = function( spell ) {

			/**
			 * Array holding a list of all plugins that a currently active
			 * @type {Array}
			 */
			this.activePlugins = []

			/**
			 * Map holding pluginName => pluginInstance
			 * @type {Object}
			 */
			this.plugins = {}

			/**
			 * Reference to the spell object
			 */
			this.spell      = spell

			this.commandMode                = false
			this.selectedEntity             = null

			/**
			 * vec2 holding holding the current position of the pointer in world coordinates
			 * (null unless initialized
			 * @type {null}
			 */
			this.cursorWorldPosition        = null

			for (var pluginName in PLUGIN_MANIFEST) {

				var pluginConstructor = PLUGIN_MANIFEST[ pluginName ],
					pluginInstance = new pluginConstructor( spell, this )

				this.plugins[ pluginName ] = pluginInstance

				this.activePlugins.push(pluginName)
			}
		}

		//private
		var invokePlugins = function( plugins, pluginNames, functionName ) {
			var args = Array.prototype.slice.call(arguments, 3);

			for( var i = 0; i < pluginNames.length; i++ ) {
				var pluginName          = pluginNames[ i ],
					pluginInstance      = plugins[ pluginName ],
					fn                  = pluginInstance.__proto__[ functionName ]

				if ( fn ) {
					fn.apply( pluginInstance, args )
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

			invokePlugins( this.plugins, this.activePlugins, event.type, spell, this, event )
		}


		//public
		interactiveEditingSystem.prototype = {
			setSelectedEntity: function( entityId ) {
				this.selectedEntity = entityId
			},

			getSelectedEntity: function( entityId ) {
				return this.selectedEntity
			},

			activatePlugin: function(pluginName) {
				this.activePlugins.push(pluginName)

				invokePlugins( this.plugins, [pluginName], 'activate', this.spell, this)
			},

			activateAllPlugins: function() {
				this.activePlugins = _.keys(PLUGIN_MANIFEST)

				invokePlugins( this.plugins, this.activePlugins, 'activate', this.spell, this)
			},

			deactivatePlugin: function( pluginName ) {
				var plugins         = this.plugins,
					activePlugins   = this.activePlugins,
					spell           = this.spell,
					me              = this

				this.activePlugins = _.filter(
					activePlugins,
					function( pluginNameIter ) {
						if( pluginNameIter === pluginName ) {
							invokePlugins( plugins, [ pluginName ], 'deactivate', spell, me)

							return false
						}

						return true
					}
				)

				console.log( this.activePlugins )

			},

			deactivateAllPlugins: function() {
				invokePlugins( this.plugins, this.activePlugins, 'deactivate', this.spell, this)
				this.activePlugins = []
			},

			/**
			 * Gets called when the system is created.
			 *
			 * @param {Object} [spell] The spell object.
			 */
			init: function( spell ) {
				invokePlugins( this.plugins, this.activePlugins, 'init', spell, this)
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
				this.prototype.activateAllPlugins.call( this )
			},

			/**
			 * Gets called when the system is deactivated.
			 *
			 * @param {Object} [spell] The spell object.
			 */
			deactivate: function( spell ) {
				this.prototype.deactivateAllPlugins.call( this )
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

				invokePlugins( this.plugins, this.activePlugins, 'process', spell, this, timeInMs, deltaTimeInMs)

				//consume all input events if we're in commandMode
				if( this.commandMode == true ) {
					spell.inputManager.clearInputEvents()
				}
			}
		}

		return interactiveEditingSystem
	}
)
