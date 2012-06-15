define(
	'spell/shared/util/zones/Zone',
	[
		'spell/shared/util/create',
		'spell/shared/util/Events',

		'spell/shared/util/platform/underscore'
	],
	function(
		create,
		Events,

		_
	) {
		'use strict'


		/**
		 * private
		 */

		var requireScript = function( scriptId ) {
			if( !scriptId ) throw 'Error: No script id provided.'

			var module = require( scriptId )

			if( !module ) throw 'Error: Could not resolve script id \'' + scriptId + '\' to module.'

			return module
		}

		var invoke = function( items, functionName, args ) {
			_.each(
				items,
				function( item ) {
					item.prototype[ functionName ].apply( item, args )
				}
			)
		}

		var createSystem = function( globals, blueprintManager, entityManager, systemBlueprintId ) {
			var blueprint = blueprintManager.getBlueprint( systemBlueprintId ),
				constructor = requireScript( blueprint.scriptId )

			var constructorArgs = _.reduce(
				blueprint.input,
				function( memo, inputDefinition ) {
					memo.push( entityManager.getComponentsById( inputDefinition.blueprintId ) )

					return memo
				},
				[ globals ]
			)

			return create( constructor, constructorArgs )
		}

		var createSystems = function( globals, systemBlueprintIds ) {
			var blueprintManager = globals.blueprintManager,
				entityManager    = globals.entityManager

			return _.map(
				systemBlueprintIds,
				function( systemBlueprintId ) {
					return createSystem( globals, blueprintManager, entityManager, systemBlueprintId )
				}
			)
		}


		/**
		 * public
		 */

		var Zone = function( globals ) {
			this.globals          = globals
			this.blueprintManager = globals.blueprintManager
			this.renderSystems    = null
			this.updateSystems    = null
			this.script           = null
		}

		Zone.prototype = {
			render: function( timeInMs, deltaTimeInMs ) {
				invoke( this.renderSystems, 'process', [ this.globals, timeInMs, deltaTimeInMs ] )
			},
			update: function( timeInMs, deltaTimeInMs ) {
				invoke( this.updateSystems, 'process', [ this.globals, timeInMs, deltaTimeInMs ] )
			},
			init: function( globals, zoneConfig ) {
				var entityManager = globals.entityManager

				if( zoneConfig.scriptId ) {
					this.script = requireScript( zoneConfig.scriptId )
					this.script.init( this.globals, entityManager, zoneConfig )
				}

				this.renderSystems = createSystems( globals, zoneConfig.systems.render )
				this.updateSystems = createSystems( globals, zoneConfig.systems.update )

				invoke( this.renderSystems, 'init', [ this.globals, zoneConfig ] )
				invoke( this.updateSystems, 'init', [ this.globals, zoneConfig ] )
			},
			destroy: function( globals, zoneConfig ) {
				invoke( this.renderSystems, 'cleanUp', [ this.globals, zoneConfig ] )
				invoke( this.updateSystems, 'cleanUp', [ this.globals, zoneConfig ] )

				this.script.cleanUp( this.globals )
			}
		}

		return Zone
	}
)
