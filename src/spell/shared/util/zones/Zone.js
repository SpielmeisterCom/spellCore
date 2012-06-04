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

		var createSystem = function( globals, blueprintManager, entities, systemBlueprintId ) {
			var blueprint = blueprintManager.getBlueprint( systemBlueprintId),
				constructorArgs = [ globals ]

			constructorArgs = _.reduce(
				blueprint.input,
				function( memo, entityGroup ) {
					return memo.concat(
						entities.executeQuery(
							entities.prepareQuery( entityGroup.components )
						).elements
					)
				},
				constructorArgs
			)

			var SystemConstructor = require( blueprint.scriptId )

			if( !SystemConstructor ) throw 'Error: Could not resolve script id \'' + blueprint.scriptId + '\' to module.'


			return create( SystemConstructor, constructorArgs )
		}

		var invoke = function( items, functionName, args ) {
			_.each(
				items,
				function( item ) {
					item.prototype[ functionName ].apply( item, args )
				}
			)
		}

		var createSystems = function( globals, blueprintManager, entities, systemBlueprintIds ) {
			return _.map(
				systemBlueprintIds,
				function( systemBlueprintId ) {
					return createSystem( globals, blueprintManager, entities, systemBlueprintId )
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
				invoke( this.renderSystems, 'process', [ this.globals, timeInMs, deltaTimeInMs ] )
			},
			update: function( timeInMs, deltaTimeInMs ) {
				invoke( this.updateSystems, 'process', [ this.globals, timeInMs, deltaTimeInMs ] )
			},
			init: function( globals, zoneConfig ) {
				var eventManager   = globals.eventManager,
					resourceLoader = globals.resourceLoader,
					entities       = new Entities(),
					entityManager  = new ZoneEntityManager( globals.entityManager, entities )

				this.entities      = entities
				this.entityManager = entityManager
				this.renderSystems = createSystems( globals, this.blueprintManager, entities, zoneConfig.systems.render )
				this.updateSystems = createSystems( globals, this.blueprintManager, entities, zoneConfig.systems.update )

				invoke( this.renderSystems, 'init', [ this.globals ] )
				invoke( this.updateSystems, 'init', [ this.globals ] )

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
				invoke( this.renderSystems, 'cleanUp', [ this.globals ] )
				invoke( this.updateSystems, 'cleanUp', [ this.globals ] )
			}
		}

		return Zone
	}
)
