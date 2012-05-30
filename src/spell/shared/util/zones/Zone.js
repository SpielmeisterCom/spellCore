define(
	'spell/shared/util/zones/Zone',
	[
		'spell/shared/util/Events',
		'spell/shared/util/entities/Entities',
		'spell/shared/util/zones/ZoneEntityManager',

		'spell/shared/util/platform/underscore'
	],
	function(
		Events,
		Entities,
		ZoneEntityManager,

		_
	) {
		'use strict'


		/**
		 * private
		 */

		var createSystemCallback = function( globals, blueprintManager, entities, systemBlueprintId ) {
			var blueprint = blueprintManager.getBlueprint( systemBlueprintId )

			// get entity query ids based on system inputs
			var queryIds = _.map(
				blueprint.input,
				function( entityGroup ) {
					return entities.prepareQuery( entityGroup.components )
				}
			)

			var SystemConstructor = require( blueprint.scriptId )

			if( !SystemConstructor ) throw 'Error: Could not resolve script id \'' + blueprint.scriptId + '\' to module.'


			var system = new SystemConstructor( globals ),
				processFunc = _.bind( system.process, system )

			return function( globals, timeInMs, deltaTimeInMs ) {
				var args = [ globals, timeInMs, deltaTimeInMs ]

				args = _.reduce(
					queryIds,
					function( memo, queryId ) {
						return memo.concat( entities.executeQuery( queryId ).elements )
					},
					args
				)

				processFunc.apply( processFunc, args )
			}
		}

		var createSystemCallbacks = function( globals, blueprintManager, entities, systemBlueprintIds ) {
			return _.map(
				systemBlueprintIds,
				function( systemBlueprintId ) {
					return createSystemCallback( globals, blueprintManager, entities, systemBlueprintId )
				}
			)
		}

		var callSystems = function( systems, globals, timeInMs, deltaTimeInMs ) {
			_.each(
				systems,
				function( process ) {
					process( globals, timeInMs, deltaTimeInMs )
				}
			)
		}

		var createInitialEntities = function( entityManager, entityConfigs ) {
			_.each(
				entityConfigs,
				function( entityConfig ) {
					entityManager.createEntity( entityConfig.blueprintId, entityConfig.config )
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
		}

		Zone.prototype = {
			render: function( timeInMs, deltaTimeInMs ) {
				callSystems( this.renderSystems, this.globals, timeInMs, deltaTimeInMs )
			},
			update: function( timeInMs, deltaTimeInMs ) {
				callSystems( this.updateSystems, this.globals, timeInMs, deltaTimeInMs )
			},
			init: function( globals, zoneConfig ) {
				var eventManager   = globals.eventManager,
					resourceLoader = globals.resourceLoader,
					entities       = new Entities(),
					entityManager  = new ZoneEntityManager( globals.entityManager, entities )

				this.entities      = entities
				this.entityManager = entityManager
				this.renderSystems = createSystemCallbacks( globals, this.blueprintManager, entities, zoneConfig.systems.render )
				this.updateSystems = createSystemCallbacks( globals, this.blueprintManager, entities, zoneConfig.systems.update )

				if( _.size( zoneConfig.resources ) === 0 ) {
					createInitialEntities( entityManager, zoneConfig.entities )
					return
				}

				eventManager.subscribe(
					[ Events.RESOURCE_LOADING_COMPLETED, 'zoneResources' ],
					function() {
						createInitialEntities( entityManager, zoneConfig.entities )
					}
				)

				// trigger loading of zone resources
				resourceLoader.addResourceBundle( 'zoneResources', zoneConfig.resources )
				resourceLoader.start()
			},

			destroy: function( globals ) {
			}
		}

		return Zone
	}
)
