/*
 * @class spell.shared.util.entity.EntityManager
 */
define(
	'spell/shared/util/entity/EntityManager',
	[
		'spell/shared/util/create',

		'spell/functions'
	],
	function(
		create,

		_
	) {
		'use strict'


		/*
		 * private
		 */

		var nextEntityId        = 0,
			rootComponentId     = 'spell.component.entityComposite.root',
			childrenComponentId = 'spell.component.entityComposite.children'

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

		/*
		 * Normalizes the provided entity config
		 *
		 * @param arg0 can be either a entity template id or a entity config
		 * @return {*}
		 */
		var normalizeEntityConfig = function( arg0 ) {
			var templateId, config, children

			if( !arg0 ) return

			if( _.isString( arg0 ) ) {
				templateId = arg0

			} else if( _.isObject( arg0 ) ) {
				var hasTemplateId = _.has( arg0, 'templateId'),
					hasConfig     = _.has( arg0, 'config' )

				if( hasTemplateId ) templateId = arg0.templateId
				if( hasConfig ) config = arg0.config
				if( !hasTemplateId && !hasConfig ) config = arg0
				if( _.has( arg0, 'children' ) ) children = arg0.children
			}

			return {
				templateId : templateId,
				config : config,
				children : children
			}
		}

		/*
		 * Normalizes the provided component config
		 *
		 * @param arg0 can be either a component template id or a component config
		 * @return {*}
		 */
		var normalizeComponentConfig = function( arg0 ) {
			var templateId,
				config

			if( !arg0 ) return

			if( _.isString( arg0 ) ) {
				templateId = arg0
				config = {}

			} else if( _.isObject( arg0 ) ) {
				if( !_.has( arg0, 'templateId' ) ) {
					throw 'Error: Supplied invalid arguments.'
				}

				templateId = arg0.templateId
				config = arg0.config || {}
			}

			var result = {}
			result[ templateId ] = config

			return result
		}

		var createEntityCompositeConfig = function( isRoot, childEntityIds ) {
			var result = {}

			if( isRoot ) result[ rootComponentId ] = {}

			if( _.size( childEntityIds ) > 0 ) {
				result[ childrenComponentId ] = {
					"ids" : childEntityIds
				}
			}

			return result
		}

		var createEntity = function( components, templateManager, entityConfig, isRoot ) {
			isRoot = ( isRoot === true || isRoot === undefined )
			entityConfig = normalizeEntityConfig( entityConfig )

			if( !entityConfig ) throw 'Error: Supplied invalid arguments.'

			var templateId = entityConfig.templateId,
				config     = entityConfig.config || {}

			if( !templateId && !config ) {
				throw 'Error: Supplied invalid arguments.'
			}

			if( templateId && !templateManager.hasTemplate( templateId ) ) {
				throw 'Error: Unknown template \'' + templateId + '\'. Could not create entity.'
			}

			// creating child entities
			var childEntityIds = _.map(
				entityConfig.children,
				function( entityConfig ) {
					return createEntity( components, templateManager, entityConfig, false )
				}
			)

			// creating current entity
			_.extend( config, createEntityCompositeConfig( isRoot, childEntityIds ) )

			var entityId = getNextEntityId()

			addComponents(
				components,
				entityId,
				templateManager.createComponents( templateId, config || {} )
			)

			return entityId
		}


		/*
		 * public
		 */

		var EntityManager = function( templateManager ) {
			this.templateManager = templateManager
			this.components = createComponentList( templateManager.getTemplateIds( 'componentTemplate' ) )
		}

		EntityManager.prototype = {
			/*
			 * Creates an entity
			 *
			 * @param arg0 an entity template id or an entity config
			 * @return {*}
			 */
			createEntity : function( arg0 ) {
				return createEntity( this.components, this.templateManager, arg0 )
			},

			/*
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
						self.createEntity( entityConfig )
					}
				)
			},

			/*
			 * Adds a component to an entity
			 *
			 * @param entityId the id of the entity that the component belongs to
			 * @param arg1 can be a component template id or a component template config
			 * @return {*}
			 */
			addComponent : function( entityId, arg1 ) {
				if( !entityId ) throw 'Error: Missing entity id.'

				addComponents(
					this.components,
					entityId,
					this.templateManager.createComponents( null, normalizeComponentConfig( arg1 ) )
				)
			},

			/*
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

			/*
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
