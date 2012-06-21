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
					memo[ componentBlueprintId ] = {}

					return memo
				},
				{}
			)
		}

		var addComponents = function( components, entityId, entityComponents ) {
			_.each(
				entityComponents,
				function( component, componentId ) {
					components[ componentId ][ entityId ] = component
				}
			)
		}

		var removeComponents = function( components, entityId, entityComponentId ) {
			if( entityComponentId ) {
				// remove a single component from the entity
				delete components[ entityComponentId ][ entityId ]

			} else {
				// remove all components, that is "remove the entity"
				_.each(
					components,
					function( componentList ) {
						if( !_.has( componentList, entityId ) ) return

						delete componentList[ entityId ]
					}
				)
			}
		}

		/**
		 * Extracts blueprintId and config object from the arguments
		 *
		 * @param arg0 first argument
		 * @param arg1 second argument
		 * @return {*}
		 */
		var extractCreateArguments = function( arg0, arg1 ) {
			var blueprintId,
				config

			if( !arg0 ) return

			if( !arg1 ) {
				if( _.isObject( arg0 ) ) {
					/**
					 * arg0 =  { ... } // config
					 */

					config = arg0

				} else if( _.isString( arg0 ) ) {
					/**
					 * arg0 = 'blueprintId'
					 */

					blueprintId = arg0
				}

			} else {
				/**
				 * arg0 = 'blueprintId'
				 * arg1 = { ... } // config
				 */

				blueprintId = arg0
				config      = arg1
			}

			return {
				blueprintId : blueprintId,
				config : config
			}
		}


		/**
		 * public
		 */

		var EntityManager = function( blueprintManager ) {
			this.blueprintManager = blueprintManager
			this.components = createComponentList( blueprintManager.getBlueprintIds( 'componentBlueprint' ) )
		}

		EntityManager.prototype = {
			/**
			 * Creates an entity
			 *
			 * @param arg0 can be a blueprintId or a config object
			 * @param arg1 a config object
			 * @return {*}
			 */
			createEntity : function( arg0, arg1 ) {
				var args = extractCreateArguments( arg0, arg1 )

				if( !args ) throw 'Error: Supplied invalid arguments.'

				var blueprintId = args.blueprintId,
					config      = args.config

				if( !blueprintId && !config ) {
					throw 'Error: Supplied invalid arguments.'
				}

				if( blueprintId && !this.blueprintManager.hasBlueprint( blueprintId ) ) {
					throw 'Error: Unknown blueprint \'' + blueprintId + '\'. Could not create entity.'
				}

				var entityId = getNextEntityId()

				addComponents(
					this.components,
					entityId,
					this.blueprintManager.createComponents( blueprintId, config || {} )
				)

				return entityId
			},

			/**
			 * Removes an entity
			 *
			 * @param entityId the id of the entity to remove
			 */
			removeEntity : function( entityId ) {
				if( !entityId ) throw 'Error: Missing entity id.'

				removeComponents( this.components, entityId )
			},

			createEntities : function( entityConfigs ) {
				var self = this

				_.each(
					entityConfigs,
					function( entityConfig ) {
						if( _.has( entityConfig, 'blueprintId' ) ) {
							self.createEntity( entityConfig.blueprintId, entityConfig.config )

						} else {
							self.createEntity( entityConfig.config )
						}
					}
				)
			},

			/**
			 * Adds a component to an entity
			 *
			 * @param entityId the id of the entity that the component belongs to
			 * @param arg1 can be a blueprintId or config object
			 * @param arg2 config object
			 * @return {*}
			 */
			addComponent : function( entityId, arg1, arg2 ) {
				if( !entityId ) throw 'Error: Missing entity id.'

				var args = extractCreateArguments( arg1, arg2 ),
					entityConfig = {}
					entityConfig[ args.blueprintId ] = args.config

				addComponents(
					this.components,
					entityId,
					this.blueprintManager.createComponents( null, entityConfig )
				)
			},

			/**
			 * Removes a component from an entity
			 *
			 * @param entityId the id of the entity that the component belongs to
			 * @param componentId the id (blueprint id) of the component to remove
			 * @return {*}
			 */
			removeComponent : function( entityId, componentId ) {
				if( !entityId ) throw 'Error: Missing entity id.'

				removeComponents( this.components, entityId, componentId )
			},

			/**
			 * Returns true if an entity has a component
			 *
			 * @param entityId the id of the entity to check
			 * @param componentId the id of the component to check
			 * @return {Boolean}
			 */
			hasComponent : function( entityId, componentId ) {
				var componentList = this.components[ componentId ]

				if( !componentList ) return false

				return !!componentList[ entityId ]
			},

			getComponentsById : function( componentBlueprintId ) {
				var components = this.components[ componentBlueprintId ]

				if( !components ) throw 'Error: No component list for component blueprint id \'' + componentBlueprintId +  '\' available.'

				return components
			}
		}


		return EntityManager
	}
)
