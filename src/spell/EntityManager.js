/**
 * The EntityManager contains functions for creating, updating and destroying entities and for
 * querying and updating components.
 *
 * You can use the EntityManager for example in your system's init, activate, deactivate, destroy and process functions
 * to create or destroy entities, or to add or remove components from entities and update components.
 *
 * @class spell.EntityManager
 * @singleton
 */
define(
	'spell/EntityManager',
	[
		'spell/defines',
		'spell/shared/util/create',
		'spell/shared/util/deepClone',
		'spell/shared/util/Events',
		'spell/shared/util/template/applyComponentConfig',
		'spell/shared/util/template/TemplateTypes',

		'spell/functions'
	],
	function(
		defines,
		create,
		deepClone,
		Events,
		applyComponentConfig,
		TemplateTypes,

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
		 * @private
		 * @param {Object} id
		 * @return {*}
		 */
		var getEntityId = function( id ) {
			if( !id ) {
				return '' + nextEntityId++
			}

			var number = parseInt( id )

			if( _.isNaN( number ) ) return id

			nextEntityId = Math.max( number + 1, nextEntityId )

			return '' + number
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

		var entityExists = function( componentDictionaries, entityId ) {
			for( var componentId in componentDictionaries ) {
				var componentDictionary = componentDictionaries[ componentId ]

				if( componentDictionary[ entityId ] ) return true
			}

			return false
		}

		var removeComponents = function( eventManager, componentDictionaries, entityId, entityComponentId ) {
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

			if( !entityExists( componentDictionaries, entityId ) ) {
				eventManager.publish( Events.ENTITY_DESTROYED, entityId )
			}
		}

		/**
		 * Applies the overloaded children config to the children config defined in a template.
		 *
		 * @private
		 * @param entityTemplateChildrenConfig
		 * @param overloadedChildrenConfig
		 * @return {*}
		 */
		var applyOverloadedChildrenConfig = function( entityTemplateChildrenConfig, overloadedChildrenConfig ) {
			return _.reduce(
				overloadedChildrenConfig,
				function( memo, overloadedChildConfig ) {
					var entityTemplateChildConfig = _.find(
						memo,
						function( entityTemplateChildConfig ) {
							return overloadedChildConfig.name === entityTemplateChildConfig.name
						}
					)

					if( entityTemplateChildConfig ) {
						entityTemplateChildConfig.children = overloadedChildConfig.children
						entityTemplateChildConfig.id       = overloadedChildConfig.id

						entityTemplateChildConfig.config = applyComponentConfig( entityTemplateChildConfig.config, overloadedChildConfig.config )

					} else {
						memo.push( overloadedChildConfig )
					}

					return memo
				},
				deepClone( entityTemplateChildrenConfig )
			)
		}

		/**
		 * Normalizes the provided entity config
		 *
		 * @param templateManager
		 * @param arg1 can be either an entity template id or a entity config
		 * @private
		 * @return {*}
		 */
		var normalizeEntityConfig = function( templateManager, arg1 ) {
			if( !arg1 ) return

			var config           = arg1.config || {},
				children         = arg1.children || [],
				name             = arg1.name || '',
				entityTemplateId = _.isString( arg1 ) ? arg1 : arg1.entityTemplateId

			if( entityTemplateId ) {
				var entityTemplate = templateManager.getTemplate( entityTemplateId )

				if( !entityTemplate ) {
					throw 'Error: Unknown entity template \'' + entityTemplateId + '\'. Could not create entity.'
				}

				children = applyOverloadedChildrenConfig( entityTemplate.children, children )
			}

			return {
				children         : children,
				config           : config,
				id               : arg1.id ? arg1.id : undefined,
				name             : name,
				entityTemplateId : entityTemplateId
			}
		}

		/**
		 * Normalizes the provided component config
		 *
		 * @param arg0 can be either a component id or a component config
		 * @private
		 * @return {*}
		 */
		var normalizeComponentConfig = function( arg0 ) {
			var componentId,
				config

			if( !arg0 ) return

			if( _.isString( arg0 ) ) {
				componentId = arg0
				config = {}

			} else if( _.isObject( arg0 ) ) {
				if( !_.has( arg0, 'componentId' ) ) {
					throw 'Error: Supplied invalid arguments.'
				}

				componentId = arg0.componentId
				config = arg0.config || {}
			}

			var result = {}
			result[ componentId ] = config

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

		var createEntity = function( eventManager, componentDictionaries, templateManager, entityConfig, isRoot ) {
			isRoot       = ( isRoot === true || isRoot === undefined )
			entityConfig = normalizeEntityConfig( templateManager, entityConfig )

			if( !entityConfig ) throw 'Error: Supplied invalid arguments.'

			var entityTemplateId = entityConfig.entityTemplateId,
				config           = entityConfig.config || {}

			if( !entityTemplateId && !config ) {
				throw 'Error: Supplied invalid arguments.'
			}

			// creating child entities
			var childEntityIds = _.map(
				entityConfig.children,
				function( entityConfig ) {
					return createEntity( eventManager, componentDictionaries, templateManager, entityConfig, false )
				}
			)

			// add additional components which the engine requires
			_.extend(
				config,
				createAdditionalEntityConfig( isRoot, childEntityIds, entityConfig.name )
			)

			var entityId         = getEntityId( entityConfig.id ),
				entityComponents = templateManager.createComponents( entityTemplateId, config || {} )

			addComponents( componentDictionaries, entityId, entityComponents )

			eventManager.publish( Events.ENTITY_CREATED, [ entityId, entityComponents ] )

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

		var EntityManager = function( eventManager, templateManager ) {
			this.componentDictionaries = createComponentList( templateManager.getTemplateIds( TemplateTypes.COMPONENT ) )
			this.eventManager          = eventManager
			this.templateManager       = templateManager
		}

		EntityManager.prototype = {
			/**
			 * Creates an entity using the given configuration object.
			 *
			 * Available configuration options are:
			 *
			 * * **entityTemplateId** [String] - if the entity should be constructed using an entity template you can specify the library path to the entity template here
			 * * **config** [Object] - component configuration for this entity. It can also be used to partially override an entity template config
			 * * **children** [Array] - if this entity has children, an array of nested config objects can be specified here
			 * * **id** [String] - if specified the entity will be created using this id. Please note: you should not use this function unless you know what you're doing. Normally the engine assigns entityIds automatically.
			 * * **name** [String] - a name for this entity. If specified, you can use the {@link #getEntityIdsByName} function to lookup named entities to their entityIds
			 *
			 * Example usage:
			 *
			 *     //create a new entity with the given components
			 *     var entityId = spell.EntityManager.createEntity({
			 *         config: {
			 *
			 *             "spell.component.2d.transform": {
			 *                 "translation": [ 100, 200 ]
			 *             },
			 *             "spell.component.visualObject": {
			 *               //if no configuration is specified the default values of this component will be used
			 *             },
			 *             "spell.component.2d.graphics.appearance": {
			 *                 "assetId": "appearance:library.identifier.of.my.static.appearance"
			 *             }
			 *         }
			 *
			 *     })
			 *
			 *     //create a new entity with child entities
			 *     var entityId = spell.EntityManager.createEntity({
			 *         "config": {
			 *             "spell.component.2d.transform": {
			 *                 "translation": [ 100, 200 ]
			 *             },
			 *             "spell.component.visualObject": {
			 *               //if no configuration is specified the default values of this component will be used
			 *             },
			 *             "spell.component.2d.graphics.appearance": {
			 *                 "assetId": "appearance:library.identifier.of.my.static.appearance"
			 *             }
			 *         },
			 *         "children": [
			 *             {
			 *                 "config": {
			 *                         "spell.component.2d.transform": {
			 *                         "translation": [ -15, 20 ] //translation is relative to the parent
			 *                     },
			 *                     "spell.component.visualObject": {
			 *                       //if no configuration is specified the default values of this component will be used
			 *                     },
			 *                     "spell.component.2d.graphics.appearance": {
			 *                         "assetId": "appearance:library.identifier.of.my.other.static.appearance"
			 *                     }
			 *             }
			 *         ]
			 *
			 *     })
			 *
			 *     //create a new entity from an entity template
			 *     var entityId = spell.EntityManager.createEntity({
			 *         entityTemplateId: 'library.identifier.of.my.template'
			 *     })
			 *
			 *     //create a new entity from an entity template and override values from the template
			 *     var entityId = spell.EntityManager.createEntity({
			 *         entityTemplateId: 'library.identifier.of.my.template',
			 *         config: {
			 *             "spell.component.box2d.simpleBox": {
			 *                 "dimensions": [ 100, 100 ]
			 *              },
			 *              "spell.component.2d.transform": {
			 *                  "translation": [ 150, 50 ]
			 *               }
			 *         }
			 *     })
			 *
			 * @param {Object} entityConfig an entity configuration object
			 * @return {String} the entity id of the newly created entity
			 */
			createEntity : function( entityConfig ) {
				return createEntity( this.eventManager, this.componentDictionaries, this.templateManager, entityConfig )
			},

			/**
			 * Creates entities from a list of entity configs.
			 *
			 * See {@link #createEntity} function for a documentation of the entity config object.
			 *
			 * @param {Array} entityConfigs
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
			 * @param {String} entityId the id of the entity to remove
			 */
			removeEntity : function( entityId ) {
				if( !entityId ) throw 'Error: Missing entity id.'

				removeComponents( this.eventManager, this.componentDictionaries, entityId )
			},

			/**
			 * Returns an entity by its id.
			 *
			 * NOTE: Do not use this function to frequently query large amounts of entities. In order to process entities frequently with better performance
			 * define a system input that matches your requirements.
			 *
			 * @param {String} entityId the entity id
			 * @return {Object}
			 */
			getEntityById : function( entityId ) {
				return assembleEntityInstance( this.componentDictionaries, entityId )
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
			 * Available configuration options are:
			 *
			 * * **componentId** [String] - the library path of the component
			 * * **config** [Object] - attribute configuration for this component. It can also be used to partially override the component's default values
			 *
			 * Example usage:
			 *
			 *     //add a component with it's default configuration to this entity
			 *     spell.EntityManager.addComponent( entityId, "spell.component.2d.graphics.debug.box" )
			 *
			 *     //add a component to this entity and override a default value
			 *     spell.EntityManager.addComponent( entityId, {
			 *         "componentId": "spell.component.2d.graphics.textApperance",
			 *         "config": {
			 *             "text": "Hello World"
			 *         }
			 *     } )
			 *
			 * @param {String} entityId of the entity that the component belongs to
			 * @param {*} arg1 can be a component template id or a component template config
			 */
			addComponent : function( entityId, arg1 ) {
				if( !entityId ) throw 'Error: Missing entity id.'

				addComponents(
					this.componentDictionaries,
					entityId,
					this.templateManager.createComponents( null, normalizeComponentConfig( arg1 ) )
				)
			},

			/**
			 * Removes a component from an entity.
			 *
			 * @param {String} entityId the id of the entity that the component belongs to
			 * @param {String} componentId the library path of the component to remove
			 * @return {*}
			 */
			removeComponent : function( entityId, componentId ) {
				if( !entityId ) throw 'Error: Missing entity id.'

				removeComponents( this.eventManager, this.componentDictionaries, entityId, componentId )
			},

			/**
			 * Returns a component from a specific entity.
			 *
			 * @param {String} componentId the requested component id
			 * @param {String} entityId the id of the requested entity
			 * @return {Object}
			 */
			getComponentById : function( componentId, entityId ) {
				var componentDictionary = this.componentDictionaries[ componentId ]

				return componentDictionary ? componentDictionary[ entityId ] : undefined
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
			 * Example usage:
			 *     //update a component of an entity
			 *     spell.updateComponent(
			 *         "spell.component.2d.graphics.apperance",
			 *         entityId,
			 *         {
			 *             "assetId": "appearance:library.identifier.of.my.static.appearance"
			 *         }
			 *
			 *     )
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
			},

			/**
			 * Updates all components which reference the asset with the updated asset instance.
			 *
			 * @param assetId
			 * @param asset
			 */
			updateAssetReferences : function( assetId, asset ) {
				var componentIds = this.templateManager.getComponentsWithAssets()

				for( var i = 0, numComponentIds = componentIds.length; i < numComponentIds; i++ ) {
					var componentId  = componentIds[ i ],
						componentMap = this.componentDictionaries[ componentId ]

					for( var id in componentMap ) {
						var component = componentMap[ id ]

						if( component.assetId === assetId ) {
							component.asset = asset
						}
					}
				}
			}
		}

		return EntityManager
	}
)
