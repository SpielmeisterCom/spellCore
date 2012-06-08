define(
	'spell/shared/util/zones/Zone',
	[
		'spell/shared/util/create',
		'spell/shared/util/Events',
		'spell/shared/util/entities/Entities',
		'spell/shared/util/zones/ZoneEntityManager',

		'spell/shared/util/platform/underscore'
	],
	function(
		create,
		Events,
		Entities,
		ZoneEntityManager,

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

		var createSystem = function( globals, blueprintManager, zoneEntityManager, systemBlueprintId ) {
			var blueprint = blueprintManager.getBlueprint( systemBlueprintId ),
				constructor = requireScript( blueprint.scriptId),
				entities = zoneEntityManager.zoneEntities

			var constructorArgs = _.reduce(
				blueprint.input,
				function( memo, entityGroup ) {
					return memo.concat(
						// TODO: replace this when the switch to component list driven entity system is performed
						entities.executeQuery(
								entities.prepareQuery( entityGroup.components )
						).elements
					)
				},
				[ globals ]
			)

			return create( constructor, constructorArgs )
		}

		var createSystems = function( globals, blueprintManager, zoneEntityManager, systemBlueprintIds ) {
			return _.map(
				systemBlueprintIds,
				function( systemBlueprintId ) {
					return createSystem( globals, blueprintManager, zoneEntityManager, systemBlueprintId )
				}
			)
		}


		/**
		 * public
		 */

		var Zone = function( globals, blueprintManager ) {
			this.globals          = globals
			this.blueprintManager = blueprintManager
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
				var zoneEntityManager = new ZoneEntityManager( globals.entityManager, new Entities() )

				if( zoneConfig.scriptId ) {
					this.script = requireScript( zoneConfig.scriptId )
					this.script.init( this.globals, zoneEntityManager, zoneConfig )
				}

				this.renderSystems = createSystems( globals, this.blueprintManager, zoneEntityManager, zoneConfig.systems.render )
				this.updateSystems = createSystems( globals, this.blueprintManager, zoneEntityManager, zoneConfig.systems.update )

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
