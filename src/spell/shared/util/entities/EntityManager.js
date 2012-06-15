define(
	'spell/shared/util/entities/EntityManager',
	[
		'spell/shared/util/create',

		'spell/shared/util/platform/underscore'
	],
	function(
		create,

		_
	) {
		'use strict'


		/**
		 * private
		 */

		var nextEntityId = 0

		var getNextEntityId = function() {
			return nextEntityId++
		}

		var createComponentList = function( componentBlueprintIds ) {
			return _.reduce(
				componentBlueprintIds,
				function( memo, componentBlueprintId ) {
					memo[ componentBlueprintId ] = []

					return memo
				},
				{}
			)
		}

		var addComponents = function( components, entityId, entityComponents ) {
			_.each(
				entityComponents,
				function( entityComponent, entityComponentId ) {
					components[ entityComponentId ][ entityId ] = entityComponent
				}
			)
		}


		/**
		 * public
		 */

		var EntityManager = function( blueprintManager ) {
			this.blueprintManager = blueprintManager
			this.components = createComponentList( blueprintManager.getBlueprintIds( 'componentBlueprint' ) )
		}

		EntityManager.prototype = {
			createEntity: function( blueprintId, entityConfig ) {
				if( !this.blueprintManager.hasBlueprint( blueprintId ) ) {
					throw 'Error: Unknown blueprint \'' + blueprintId + '\'. Could not create entity.'
				}

				var id = getNextEntityId()

				addComponents(
					this.components,
					id,
					this.blueprintManager.createEntityComponents( blueprintId, entityConfig )
				)

				return id
			},

			createEntities: function( entityConfigs ) {
				var self = this

				_.each(
					entityConfigs,
					function( entityConfig ) {
						self.createEntity( entityConfig.blueprintId, entityConfig.config )
					}
				)
			},

			getComponentsById : function( componentBlueprintId ) {
				return this.components[ componentBlueprintId ]
			}
		}


		return EntityManager
	}
)
