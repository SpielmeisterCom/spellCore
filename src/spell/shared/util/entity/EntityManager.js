/**
 * @class spell.shared.util.entity.EntityManager
 */
define(
	'spell/shared/util/entity/EntityManager',
	[
		'spell/defines',
		'spell/shared/util/create',

		'spell/functions'
	],
	function(
		defines,
		create,

		_
	) {
		'use strict'


		/*
		 * private
		 */

		var nextEntityId          = 1,
			ROOT_COMPONENT_ID     = defines.ROOT_COMPONENT_ID,
			CHILDREN_COMPONENT_ID = defines.CHILDREN_COMPONENT_ID,
			NAME_COMPONENT_ID     = defines.NAME_COMPONENT_ID

		/**
		 * Returns an entity id. If no entity id is provided a new one is generated.
		 *
		 * @param {Object} id
		 * @return {Integer}
		 */
		var getEntityId = function( id ) {
			if( !id ) return nextEntityId++

			return id
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

		var addComponents = function( componentDictionaries, entityId, entityComponents ) {
			_.each(
				entityComponents,
				function( component, componentId ) {
					if( !!componentDictionaries[ componentId ][ entityId ] ) {
						throw 'Error: Adding a component to the entity with id \'' + entityId + '\' failed because the requested id is already in use. ' +
							'Please make sure that no duplicate entity ids are used.'
					}

					componentDictionaries[ componentId ][ entityId ] = component
				}
			)
		}

		var removeComponents = function( componentDictionaries, entityId, entityComponentId ) {
			if( entityComponentId ) {
				// remove a single component from the entity
				delete componentDictionaries[ entityComponentId ][ entityId ]

			} else {
				// remove all componentDictionaries, that is "remove the entity"
				_.each(
					componentDictionaries,
					function( componentDictionary ) {
						if( !_.has( componentDictionary, entityId ) ) return

						delete componentDictionary[ entityId ]
					}
				)
			}
		}

		/*
		 * Normalizes the provided entity config
		 *
		 * @param templateManager
		 * @param arg1 can be either a entity template id or a entity config
		 * @return {*}
		 */
		var normalizeEntityConfig = function( templateManager, arg1 ) {
			if( !arg1 ) return

			var config     = arg1.config || {},
				children   = arg1.children || [],
				name       = arg1.name || '',
				templateId = _.isString( arg1 ) ? arg1 : arg1.templateId

			if( templateId ) {
				var template = templateManager.getTemplate( templateId )

				if( !template ) {
					throw 'Error: Unknown template \'' + templateId + '\'. Could not create entity.'
				}

				if( template.children &&
					template.children.length > 0 ) {

					children = children.concat( template.children )
				}
			}

			return {
				children   : children,
				config     : config,
				id         : arg1.id ? arg1.id : undefined,
				name       : name,
				templateId : templateId
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

		var createAdditionalEntityConfig = function( isRoot, childEntityIds, name ) {
			var result = {}

			if( isRoot ) result[ ROOT_COMPONENT_ID ] = {}

			if( _.size( childEntityIds ) > 0 ) {
				result[ CHILDREN_COMPONENT_ID ] = {
					ids : childEntityIds
				}
			}

			result[ NAME_COMPONENT_ID ] = {
				value : name
			}

			return result
		}

		var createEntity = function( componentDictionaries, templateManager, entityConfig, isRoot ) {
			isRoot       = ( isRoot === true || isRoot === undefined )
			entityConfig = normalizeEntityConfig( templateManager, entityConfig )

			if( !entityConfig ) throw 'Error: Supplied invalid arguments.'

			var templateId = entityConfig.templateId,
				config     = entityConfig.config || {}

			if( !templateId && !config ) {
				throw 'Error: Supplied invalid arguments.'
			}

			// creating child entities
			var childEntityIds = _.map(
				entityConfig.children,
				function( entityConfig ) {
					return createEntity( componentDictionaries, templateManager, entityConfig, false )
				}
			)

			// add additional components which the engine requires
			_.extend(
				config,
				createAdditionalEntityConfig( isRoot, childEntityIds, entityConfig.name )
			)

			var entityId = getEntityId( entityConfig.id )

			addComponents(
				componentDictionaries,
				entityId,
				templateManager.createComponents( templateId, config || {} )
			)

			return entityId
		}

		var assembleEntityInstance = function( componentDictionaries, id ) {
			return _.reduce(
				componentDictionaries,
				function( memo, componentDictionary, componentId ) {
					var component = componentDictionary[ id ]

					if( component ) {
						memo[ componentId ] = component
					}

					return memo
				},
				{}
			)
		}


		/*
		 * public
		 */

		var EntityManager = function( templateManager ) {
			this.componentDictionaries = createComponentList( templateManager.getTemplateIds( 'componentTemplate' ) )
			this.templateManager       = templateManager
		}

		EntityManager.prototype = {
			/**
			 * Creates an entity
			 *
			 * @param {*} arg0 an entity template id or an entity config
			 * @return {*}
			 */
			createEntity : function( arg0 ) {
				return createEntity( this.componentDictionaries, this.templateManager, arg0 )
			},

			/**
			 * Creates entities from a list of entity configs.
			 *
			 * @param {Object} entityConfigs
			 */
			createEntities : function( entityConfigs ) {
				var self = this

				_.each(
					entityConfigs,
					function( entityConfig ) {
						self.createEntity( entityConfig )
					}
				)
			},

			/**
			 * Removes an entity
			 *
			 * @param {String} id the id of the entity to remove
			 */
			removeEntity : function( id ) {
				if( !id ) throw 'Error: Missing entity id.'

				removeComponents( this.componentDictionaries, id )
			},

			/**
			 * Returns an entity by its id.
			 *
			 * NOTE: Do not use this function to frequently query large amounts of entities. In order to process entities frequently with better performance
			 * define a system input that matches your requirements.
			 *
			 * @param {String} id the entity id
			 * @return {Object}
			 */
			getEntityById : function( id ) {
				return assembleEntityInstance( this.componentDictionaries, id )
			},

			/**
			 * Returns an array of ids of entities which have the requested name.
			 *
			 * @param {String} name the name of the entity
			 * @return {Array}
			 */
			getEntityIdsByName : function( name ) {
				var nameComponents = this.componentDictionaries[ NAME_COMPONENT_ID ],
					ids            = []

				for( var id in nameComponents ) {
					if( nameComponents[ id ].value === name ) {
						ids.push( id )
					}
				}

				return ids
			},

			/**
			 * Returns a collection of entities which have the requested name.
			 *
			 * @param {String} name the name of the entity
			 * @return {Object}
			 */
			getEntitiesByName : function( name ) {
				var ids = this.getEntityIdsByName( name )

				var entities = {}

				for( var i = 0, numIds = ids.length; i < numIds; i++ ) {
					var id = ids[ i ]

					entities[ id ] = this.getEntityById( id )
				}

				return entities
			},

			/**
			 * Adds a component to an entity.
			 *
			 * @param {String} id the id of the entity that the component belongs to
			 * @param {*} arg1 can be a component template id or a component template config
			 * @return {*}
			 */
			addComponent : function( id, arg1 ) {
				if( !id ) throw 'Error: Missing entity id.'

				addComponents(
					this.componentDictionaries,
					id,
					this.templateManager.createComponents( null, normalizeComponentConfig( arg1 ) )
				)
			},

			/**
			 * Removes a component from an entity.
			 *
			 * @param {String} id the id of the entity that the component belongs to
			 * @param {String} componentId the id (template id) of the component to remove
			 * @return {*}
			 */
			removeComponent : function( id, componentId ) {
				if( !id ) throw 'Error: Missing entity id.'

				removeComponents( this.componentDictionaries, id, componentId )
			},

			/**
			 * Returns a component from a specific entity.
			 *
			 * @param {String} componentId the requested component id
			 * @param {String} id the id of the requested entity
			 * @return {Object}
			 */
			getComponentById : function( componentId, id ) {
				var componentDictionary = this.componentDictionaries[ componentId ]

				return componentDictionary ? componentDictionary[ id ] : undefined
			},

			/**
			 * Returns a collection of components which have the requested component id and belong to entities which have the requested name.
			 *
			 * @param {String} componentId the requested component id
			 * @param {String} name the requested entity name
			 * @return {Object}
			 */
			getComponentsByName : function( componentId, name ) {
				var componentDictionary = this.getComponentDictionaryById( componentId ),
					ids                 = this.getEntityIdsByName( name )

				if( ids.length === 0 ||
					!componentDictionary ) {

					return []
				}

				return _.pick( componentDictionary, ids )
			},

			/**
			 * Updates the attributes of a component. Returns true when successful, false otherwise.
			 *
			 * @param {String} componentId the component id of the component
			 * @param {String} entityId the id of the entity which the component belongs to
			 * @param {Object} attributeConfig the attribute configuration change of the component
			 * @return {Boolean}
			 */
			updateComponent : function( componentId, entityId, attributeConfig ) {
				var component = this.getComponentById( componentId, entityId )

				if( !component ) return false

				this.templateManager.updateComponent( componentId, component, attributeConfig )

				return true
			},

			/**
			 * Returns a component dictionary of a specific type.
			 *
			 * @param {String} componentId the requested component type / id
			 * @return {*}
			 */
			getComponentDictionaryById : function( componentId ) {
				return this.componentDictionaries[ componentId ]
			}
		}

		return EntityManager
	}
)
