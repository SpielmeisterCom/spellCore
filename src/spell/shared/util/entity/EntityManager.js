define(
	'spell/shared/util/entity/EntityManager',
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

		var createComponentList = function( componentTemplateIds ) {
			return _.reduce(
				componentTemplateIds,
				function( memo, componentTemplateId ) {
					memo[ componentTemplateId ] = {}

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
		 * Extracts templateId and config object from the arguments
		 *
		 * @param arg0 first argument
		 * @param arg1 second argument
		 * @return {*}
		 */
		var extractCreateArguments = function( arg0, arg1 ) {
			var templateId,
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
					 * arg0 = 'templateId'
					 */

					templateId = arg0
				}

			} else {
				/**
				 * arg0 = 'templateId'
				 * arg1 = { ... } // config
				 */

				templateId = arg0
				config      = arg1
			}

			return {
				templateId : templateId,
				config : config
			}
		}


		/**
		 * public
		 */

		var EntityManager = function( templateManager ) {
			this.templateManager = templateManager
			this.components = createComponentList( templateManager.getTemplateIds( 'componentTemplate' ) )
		}

		EntityManager.prototype = {
			/**
			 * Creates an entity
			 *
			 * @param arg0 can be a templateId or a config object
			 * @param arg1 a config object
			 * @return {*}
			 */
			createEntity : function( arg0, arg1 ) {
				var args = extractCreateArguments( arg0, arg1 )

				if( !args ) throw 'Error: Supplied invalid arguments.'

				var templateId = args.templateId,
					config      = args.config

				if( !templateId && !config ) {
					throw 'Error: Supplied invalid arguments.'
				}

				if( templateId && !this.templateManager.hasTemplate( templateId ) ) {
					throw 'Error: Unknown template \'' + templateId + '\'. Could not create entity.'
				}

				var entityId = getNextEntityId()

				addComponents(
					this.components,
					entityId,
					this.templateManager.createComponents( templateId, config || {} )
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
						if( _.has( entityConfig, 'templateId' ) ) {
							self.createEntity( entityConfig.templateId, entityConfig.config )

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
			 * @param arg1 can be a templateId or config object
			 * @param arg2 config object
			 * @return {*}
			 */
			addComponent : function( entityId, arg1, arg2 ) {
				if( !entityId ) throw 'Error: Missing entity id.'

				var args = extractCreateArguments( arg1, arg2 ),
					entityConfig = {}
					entityConfig[ args.templateId ] = args.config

				addComponents(
					this.components,
					entityId,
					this.templateManager.createComponents( null, entityConfig )
				)
			},

			/**
			 * Removes a component from an entity
			 *
			 * @param entityId the id of the entity that the component belongs to
			 * @param componentId the id (template id) of the component to remove
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

			getComponentsById : function( componentTemplateId ) {
				var components = this.components[ componentTemplateId ]

				if( !components ) throw 'Error: No component list for component template id \'' + componentTemplateId +  '\' available.'

				return components
			}
		}


		return EntityManager
	}
)
