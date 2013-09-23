/**
 * The EntityManager offers methods for creating, updating and destroying entities as well as for querying and updating components and component attributes.
 *
 * @class spell.entityManager
 * @singleton
 */
define(
	'spell/EntityManager',
	[
		'spell/data/entity/createAmbiguousSiblingName',
		'spell/data/entity/recursiveFind',
		'spell/data/spatial/QuadTree',
		'spell/Defines',
		'spell/shared/util/arrayRemove',
		'spell/shared/util/create',
		'spell/shared/util/createId',
		'spell/shared/util/createModuleId',
		'spell/shared/util/deepClone',
		'spell/data/entity/applyEntityConfig',
		'spell/stringUtil',
		'spell/shared/util/platform/PlatformKit',
		'spell/data/component/init',

		'spell/math/util',
		'spell/math/mat3',
		'spell/math/vec2',

		'spell/functions'
	],
	function(
		createAmbiguousSiblingName,
		recursiveFind,
		QuadTree,
		Defines,
		arrayRemove,
		create,
		createId,
		createModuleId,
		deepClone,
		applyEntityConfig,
		stringUtil,
		PlatformKit,
		initComponent,

		mathUtil,
		mat3,
		vec2,

		_
	) {
		'use strict'


		var nextEntityId                     = 1,
			createComponentType              = PlatformKit.createComponentType,
			INVALID_ENTITY_ID                = Defines.INVALID_ENTITY_ID,
			ROOT_ENTITY_ID                   = Defines.ROOT_ENTITY_ID,
			COMPOSITE_COMPONENT_ID           = Defines.COMPOSITE_COMPONENT_ID,
			METADATA_COMPONENT_ID            = Defines.METADATA_COMPONENT_ID,
			TRANSFORM_COMPONENT_ID           = Defines.TRANSFORM_COMPONENT_ID,
			TEXTURE_MATRIX_COMPONENT_ID      = Defines.TEXTURE_MATRIX_COMPONENT_ID,
			EVENT_HANDLERS_COMPONENT_ID      = Defines.EVENT_HANDLERS_COMPONENT_ID,
			STATIC_APPEARANCE_COMPONENT_ID   = Defines.STATIC_APPEARANCE_COMPONENT_ID,
			ANIMATED_APPEARANCE_COMPONENT_ID = Defines.ANIMATED_APPEARANCE_COMPONENT_ID,
			QUAD_GEOMETRY_COMPONENT_ID       = Defines.QUAD_GEOMETRY_COMPONENT_ID,
			TILEMAP_COMPONENT_ID             = Defines.TILEMAP_COMPONENT_ID,
			VISUAL_OBJECT_COMPONENT_ID       = Defines.VISUAL_OBJECT_COMPONENT_ID

		var isValidComponentDefinition = function( template ) {
			// check for ambiguous attribute names
			var attributeNameCounts = _.reduce(
				template.attributes,
				function( memo, attributeConfig ) {
					var attributeName = attributeConfig.name

					memo[ attributeName ] = memo[ attributeName ] ?
						memo[ attributeName ] + 1 :
						1

					return memo
				},
				{}
			)

			return !_.any(
				attributeNameCounts,
				function( iter ) { return iter > 1 }
			)
		}

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

		var getAncestorComponent = function( compositeComponents, components, currentEntityId ) {
			while( currentEntityId !== INVALID_ENTITY_ID ) {
				currentEntityId = compositeComponents[ currentEntityId ].parentId

				var currentComponent = components[ currentEntityId ]

				if( currentComponent ) {
					return currentComponent
				}
			}
		}

		/**
		 * Updates the world transformation from a local transformation
		 *
		 * @private
		 * @param componentMaps
		 * @param entityId
		 * @return {*}
		 */
		var updateWorldTransform = function( componentMaps, eventManager, spatialIndex, syncSpatialIndex, entityId ) {
			var transformComponents = componentMaps[ TRANSFORM_COMPONENT_ID ],
				transform           = transformComponents[ entityId ]

			if( transform ) {
				var localMatrix = transform.localMatrix,
					worldMatrix = transform.worldMatrix

				// set new localToWorldMatrix
				mat3.identity( localMatrix )
				mat3.translate( localMatrix, localMatrix, transform.translation )
				mat3.rotate( localMatrix, localMatrix, transform.rotation )
				mat3.scale( localMatrix, localMatrix, transform.scale )

				// get nearest ancestor with a transform component
				var ancestorTransform = getAncestorComponent( componentMaps[ COMPOSITE_COMPONENT_ID ], transformComponents, entityId )

				if( ancestorTransform ) {
					// multiply parent's localToWorldMatrix with ours
					mat3.multiply( worldMatrix, ancestorTransform.worldMatrix, localMatrix )

				} else {
					// if this entity has no parent, the localToWorld Matrix equals the localMatrix
					mat3.copy( worldMatrix, localMatrix )
				}

				transform.worldTranslation[ 0 ] = worldMatrix[ 6 ]
				transform.worldTranslation[ 1 ] = worldMatrix[ 7 ]

				if( syncSpatialIndex ) {
					updateSpatialIndex( componentMaps, spatialIndex, entityId )
				}
			}

			// update the children
			var compositeComponents = componentMaps[ COMPOSITE_COMPONENT_ID ],
				childrenIds         = compositeComponents[ entityId ].childrenIds

			for( var i = 0, n = childrenIds.length; i < n; i++ ) {
				updateWorldTransform( componentMaps, eventManager, spatialIndex, syncSpatialIndex, childrenIds[ i ] )
			}
		}

		var updateTextureMatrix = function( textureMatrix ) {
			var matrix      = textureMatrix.matrix,
				translation = textureMatrix.translation,
				scale       = textureMatrix.scale

			mat3.identity( matrix )
			mat3.translate( matrix, matrix, translation )
			mat3.scale( matrix, matrix, scale )

			textureMatrix.isIdentity = (
				translation[ 0 ] === 0 &&
				translation[ 1 ] === 0 &&
				scale[ 0 ] === 1 &&
				scale[ 1 ] === 1
			)
		}

		var updateVisualObjectR = function( compositeComponents, visualObjectComponents, entityId, ancestorWorldOpacity ) {
			var visualObjectComponent = visualObjectComponents[ entityId ],
				worldOpacity          = ancestorWorldOpacity

			if( visualObjectComponent ) {
				visualObjectComponent.worldOpacity = worldOpacity *= visualObjectComponent.opacity
			}

			var childrenIds = compositeComponents[ entityId ].childrenIds

			for( var i = 0, n = childrenIds.length; i < n; i++ ) {
				updateVisualObjectR( compositeComponents, visualObjectComponents, childrenIds[ i ], worldOpacity )
			}
		}

		var updateVisualObject = function( componentMaps, entityId ) {
			var compositeComponents  = componentMaps[ COMPOSITE_COMPONENT_ID ],
				visualObjects        = componentMaps[ VISUAL_OBJECT_COMPONENT_ID ],
				ancestorVisualObject = getAncestorComponent( compositeComponents, visualObjects, entityId )

			updateVisualObjectR(
				compositeComponents,
				visualObjects,
				entityId,
				ancestorVisualObject ? ancestorVisualObject.worldOpacity : 1.0
			)
		}

		var addComponents = function( componentMaps, eventManager, spatialIndex, entityId, entityComponents ) {
			for( var componentId in entityComponents ) {
				var components = componentMaps[ componentId ]

				if( components[ entityId ] ) {
					throw 'Error: Adding a component to the entity with id "' + entityId + '" failed because the entity already has a component named "' + componentId + '". Check with hasComponent first if this entity already has this component.'
				}

				var component = components[ entityId ] = entityComponents[ componentId ]

				if( componentId === COMPOSITE_COMPONENT_ID ) {
					addToParentEntity( components, entityId, component.parentId )

				} else if( componentId === TEXTURE_MATRIX_COMPONENT_ID ) {
					updateTextureMatrix( component )

				} else if( componentId === TRANSFORM_COMPONENT_ID ) {
					updateWorldTransform( componentMaps, eventManager, spatialIndex, true, entityId )

				} else if( componentId === VISUAL_OBJECT_COMPONENT_ID ) {
					updateSpatialIndex( componentMaps, spatialIndex, entityId )
					updateVisualObject( componentMaps, entityId )
				}

				eventManager.publish(
					[ eventManager.EVENT.COMPONENT_CREATED, componentId ],
					[ component, entityId ]
				)
			}
		}

		var entityExists = function( componentMaps, entityId ) {
			for( var componentId in componentMaps ) {
				var componentMap = componentMaps[ componentId ]

				if( componentMap[ entityId ] ) return true
			}

			return false
		}

		/**
		 * Removes the specified component from the entity.
		 *
		 * @param eventManager
		 * @param componentMaps
		 * @param spatialIndex
		 * @param componentId
		 * @param entityId
		 * @return
		 */
		var removeComponent = function( eventManager, componentMaps, spatialIndex, componentId, entityId ) {
			var components = componentMaps[ componentId ],
				component  = components[ entityId ]

			if( !component ) return

			delete components[ entityId ]

			if( componentId === COMPOSITE_COMPONENT_ID ) {
				removeFromParentEntity( components, entityId, component.parentId )

			} else if( componentId === TRANSFORM_COMPONENT_ID ) {
				updateWorldTransform( componentMaps, eventManager, spatialIndex, true, entityId )

			} else if( componentId === VISUAL_OBJECT_COMPONENT_ID ) {
				spatialIndex.remove( entityId )
				updateVisualObject( componentMaps, entityId )
			}

			eventManager.publish( [ eventManager.EVENT.COMPONENT_REMOVED, componentId ], entityId )
		}

		var removeEntity = function( eventManager, componentMaps, spatialIndex, entityId ) {
			var compositeComponent = componentMaps[ COMPOSITE_COMPONENT_ID ][ entityId ]
			if( !compositeComponent ) return

			var childrenIds = compositeComponent.childrenIds

			while( childrenIds.length > 0 ) {
				removeEntity( eventManager, componentMaps, spatialIndex, childrenIds[ 0 ] )
			}

			// remove all components, that is "remove the entity"
			// TODO: use some kind of ordered map here, the current approach is bad
			for( var componentId in componentMaps ) {
				if( componentId === COMPOSITE_COMPONENT_ID ) continue

				removeComponent( eventManager, componentMaps, spatialIndex, componentId, entityId )
			}

			removeComponent( eventManager, componentMaps, spatialIndex, COMPOSITE_COMPONENT_ID, entityId )

			eventManager.publish( eventManager.EVENT.ENTITY_REMOVED, entityId )
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
						entityTemplateChildConfig.children = mergeOverloadedChildren( entityTemplateChildConfig.children, overloadedChildConfig.children )
						entityTemplateChildConfig.id       = overloadedChildConfig.id

						applyEntityConfig( entityTemplateChildConfig.config, overloadedChildConfig.config )

					} else {
						memo.push( overloadedChildConfig )
					}

					return memo
				},
				deepClone( entityTemplateChildrenConfig )
			)
		}

		var mergeOverloadedChildren = function( entityTemplateChildren, overloadedChildren ) {
			if( !overloadedChildren || overloadedChildren.length === 0 ) {
				return overloadedChildren
			}

			if( !entityTemplateChildren || entityTemplateChildren.length === 0 ) {
				return overloadedChildren
			}

			var result = deepClone( entityTemplateChildren )

			for( var i = 0; i < result.length; i++ ) {
				var entityTemplateChild = result[ i ]

				var overloadedChild = _.find(
					overloadedChildren,
					function( tmp ) {
						return tmp.name === entityTemplateChild.name
					}
				)

				if( !overloadedChild ) {
					continue
				}

				applyEntityConfig( entityTemplateChild.config, overloadedChild.config )

				if( overloadedChild.id ) {
					entityTemplateChild.id = overloadedChild.id
				}
			}

			return result
		}

		var addToParentEntity = function( compositeComponents, entityId, parentEntityId ) {
			var parentCompositeComponent = compositeComponents[ parentEntityId ]
			if( !parentCompositeComponent ) return

			parentCompositeComponent.childrenIds.push( entityId )
		}

		var removeFromParentEntity = function( compositeComponents, entityId, parentEntityId ) {
			var parentCompositeComponent = compositeComponents[ parentEntityId ]
			if( !parentCompositeComponent ) return

			var parentChildrenIds = parentCompositeComponent.childrenIds,
				index             = parentChildrenIds.indexOf( entityId )

			if( index >= 0 ) {
				arrayRemove( parentChildrenIds, index )
			}
		}

		var addToSpatialIndex = function( spatialIndex, componentMaps, dimensions, entityId ) {
			var transform    = componentMaps[ TRANSFORM_COMPONENT_ID ][ entityId ],
				visualObject = componentMaps[ VISUAL_OBJECT_COMPONENT_ID ][ entityId ]

			if( !transform ||
				!visualObject ||
				visualObject.pass === 'ui' ||
				visualObject.pass === 'background' ) {

				return
			}

			var compositeComponent = componentMaps[ COMPOSITE_COMPONENT_ID ][ entityId ]

			spatialIndex.insert(
				transform.worldTranslation,
				dimensions,
				{
					id : entityId,
					parent : compositeComponent.parentId,
					children : compositeComponent.childrenIds,
					layer : visualObject ? visualObject.layer : 0
				},
				entityId
			)
		}

		var updateSpatialIndex = function( componentMaps, spatialIndex, entityId ) {
			spatialIndex.remove( entityId )

			addToSpatialIndex(
				spatialIndex,
				componentMaps,
				getEntityDimensions( componentMaps, entityId ),
				entityId
			)
		}

		/**
		 * Normalizes the provided entity config
		 *
		 * @private
		 * @param libraryManager
		 * @param arg1 can be either an entity template id or a entity config
		 * @private
		 * @return {*}
		 */
		var normalizeEntityConfig = function( libraryManager, arg1 ) {
			if( !arg1 ) return

			var entityTemplateId = _.isString( arg1 ) ? arg1 : arg1.entityTemplateId

			var entityConfig = {
				children         : arg1.children || [],
				config           : arg1.config || {},
				id               : arg1.id,
				parentId         : arg1.parentId !== undefined ? arg1.parentId : ROOT_ENTITY_ID,
				name             : arg1.name,
				entityTemplateId : entityTemplateId
			}

			// check for ambiguous sibling names
			var ambiguousName = recursiveFind( entityConfig, createAmbiguousSiblingName )

			if( ambiguousName ) {
				throw 'Error: The entity configuration contains the ambiguous sibling name "' + ambiguousName + '". Entity siblings must have unique names.'
			}

			if( entityTemplateId ) {
				var entityTemplate = libraryManager.get( entityTemplateId )

				if( !entityTemplate ) {
					throw 'Error: Unknown entity template \'' + entityTemplateId + '\'. Could not create entity.'
				}

				entityConfig.children = applyOverloadedChildrenConfig( entityTemplate.children, entityConfig.children )
			}

			return entityConfig
		}

		var createBaseComponents = function( spell, libraryManager, moduleLoader, parentId, name, entityTemplateId ) {
			var result = {},
				component

			// COMPOSITE_COMPONENT_ID
			result[ COMPOSITE_COMPONENT_ID ] = component = createComponent(
				spell,
				moduleLoader,
				libraryManager.get( COMPOSITE_COMPONENT_ID ),
				COMPOSITE_COMPONENT_ID
			)

			component.parentId = parentId

			// METADATA_COMPONENT_ID
			result[ METADATA_COMPONENT_ID ] = component = createComponent(
				spell,
				moduleLoader,
				libraryManager.get( METADATA_COMPONENT_ID ),
				METADATA_COMPONENT_ID
			)

			if( name ) {
				component.name = name
			}

			if( entityTemplateId ) {
				component.entityTemplateId = entityTemplateId
			}

			return result
		}

		var isAmbiguousSiblingName = function( componentMaps, ids, entityId, name ) {
			var metaDataComponents = componentMaps[ METADATA_COMPONENT_ID ]

			for( var i = 0, id, n = ids.length; i < n; i++ ) {
				id = ids[ i ]

				if( entityId != id &&
					metaDataComponents[ id ].name === name ) {

					return true
				}
			}

			return false
		}

		var createComponent = function( spell, moduleLoader, componentDefinition, componentId ) {
			// try component type first
			var component = createComponentType( moduleLoader, spell, componentId )

			// fall back to regular object component when no component type is available
			return initComponent( component || {}, componentDefinition )
		}

		var updateComponent = function( component, attributeConfig ) {
			if( attributeConfig === undefined ) {
				return component

			} else {
				return _.extend( component, attributeConfig )
			}
		}

		var hasAssetIdAttribute = function( attributeConfig ) {
			return !!_.find(
				attributeConfig,
				function( attribute ) {
					var type = attribute.type

					if( !_.isString( type ) ) return false

					return attribute.type.indexOf( 'assetId:' ) === 0
				}
			)
		}

		/**
		 * This function dereferences asset ids. If a component with an asset id attribute is found the reference is resolved and a additional asset attribute
		 * is added to the component instance.
		 *
		 * @private
		 * @param assetManager
		 * @param component
		 * @return {*}
		 */
		var injectAsset = function( assetManager, moduleLoader, component ) {
			var assetId = component.assetId
			if( !assetId ) return

			var asset = assetManager.get( assetId )

			if( !asset &&
				stringUtil.startsWith( assetId, 'script:' ) ) {

				var libraryId = assetId.substr( 7 )

				asset = moduleLoader.require( createModuleId( libraryId ) )
			}

			if( !asset ) {
				throw 'Error: Could not resolve asset id \'' + assetId + '\' to asset instance. Please make sure that the asset id is valid.'
			}

			component.asset = asset

			return component
		}

		var createComponents = function( spell, assetManager, libraryManager, moduleLoader, componentConfig, entityTemplateId, injectAssets ) {
			if( injectAssets === undefined ) injectAssets = true

			if( entityTemplateId ) {
				var entityTemplate = libraryManager.get( entityTemplateId )

				if( !entityTemplate ) {
					throw 'Error: Unknown entity template "' + entityTemplateId + '". Could not create entity.'
				}
			}

			var entity = applyEntityConfig(
				entityTemplate ? deepClone( entityTemplate.config ) : {},
				componentConfig
			)

			_.each(
				entity,
				function( attributeConfig, componentId ) {
					var componentDefinition = libraryManager.get( componentId )

					if( !componentDefinition ) {
						throw 'Error: Could not find component definition "' + componentId +
							entityTemplateId ?
								'" referenced in entity template "' + entityTemplateId + '".' :
								'".'
					}

					var updatedComponent = updateComponent(
						createComponent( spell, moduleLoader, componentDefinition, componentId ),
						attributeConfig
					)

					entity[ componentId ] = hasAssetIdAttribute( componentDefinition.attributes ) && injectAssets ?
						injectAsset( assetManager, moduleLoader, updatedComponent ) :
						updatedComponent
				}
			)

			return entity
		}

		var createEntity = function( spell, assetManager, eventManager, libraryManager, moduleLoader, componentMaps, spatialIndex, entityConfig ) {
			entityConfig = normalizeEntityConfig( libraryManager, entityConfig )

			if( !entityConfig ) throw 'Error: Supplied invalid arguments.'

			var entityTemplateId = entityConfig.entityTemplateId,
				config           = entityConfig.config,
				parentId         = entityConfig.parentId

			if( !entityTemplateId && !config ) {
				throw 'Error: Supplied invalid arguments.'
			}

			var entityId = getEntityId( entityConfig.id )

			// creating base components which the engine requires
			var baeComponents = createBaseComponents( spell, libraryManager, moduleLoader, parentId, entityConfig.name, entityTemplateId )

			addComponents( componentMaps, eventManager, spatialIndex, entityId, baeComponents )

			// creating the entity
			var entityComponents = createComponents( spell, assetManager, libraryManager, moduleLoader, config, entityTemplateId )

			addComponents( componentMaps, eventManager, spatialIndex, entityId, entityComponents )

			// creating child entities
			var children = entityConfig.children

			for( var i = 0, entityConfig, n = children.length; i < n; i++ ) {
				entityConfig = children[ i ]
				entityConfig.parentId = entityId

				createEntity( spell, assetManager, eventManager, libraryManager, moduleLoader, componentMaps, spatialIndex, entityConfig )
			}

			// HACK: now that the composite structure is in place the spatial index can be updated for real
			updateSpatialIndex( componentMaps, spatialIndex, entityId )

			// check for validity: is the name unique?
			if( entityConfig.name ) {
				var parentCompositeComponent = componentMaps[ COMPOSITE_COMPONENT_ID ][ parentId ]

				if( isAmbiguousSiblingName( componentMaps, parentCompositeComponent.childrenIds, entityId, entityConfig.name ) ) {
					throw 'Error: The name "' + entityConfig.name + '" of entity ' + entityId + ' collides with one if its siblings. Entity siblings must have unique names.'
				}
			}

			_.extend( entityComponents, baeComponents )
			eventManager.publish( eventManager.EVENT.ENTITY_CREATED, [ entityId, entityComponents ] )

			return entityId
		}

		var assembleEntityInstance = function( componentMaps, id ) {
			return _.reduce(
				componentMaps,
				function( memo, componentMap, componentId ) {
					var component = componentMap[ id ]

					if( component ) {
						memo[ componentId ] = component
					}

					return memo
				},
				{}
			)
		}

		var getEntityCompositeIds = function( compositeComponents, entityId, resultIds ) {
			resultIds.push( entityId )

			var childrenIds = compositeComponents[ entityId ].childrenIds

			for( var i = 0, numChildrenIds = childrenIds.length; i < numChildrenIds; i++ ) {
				getEntityCompositeIds( compositeComponents, childrenIds[ i ], resultIds )
			}

			return resultIds
		}

		var getEntityDimensions = function( componentMaps, entityId ) {
			var staticAppearances   = componentMaps[ STATIC_APPEARANCE_COMPONENT_ID ],
				animatedAppearances = componentMaps[ ANIMATED_APPEARANCE_COMPONENT_ID ],
				transforms          = componentMaps[ TRANSFORM_COMPONENT_ID ],
				quadGeometries      = componentMaps[ QUAD_GEOMETRY_COMPONENT_ID ],
				tilemaps            = componentMaps[ TILEMAP_COMPONENT_ID ],
				dimensions          = vec2.create()

			if( quadGeometries &&
				quadGeometries[ entityId ] &&
				quadGeometries[ entityId ].dimensions ) {

				// if a quadGeometry is specified, always take this
				vec2.copy( dimensions, quadGeometries[ entityId ].dimensions )

			} else if( staticAppearances && staticAppearances[ entityId ] &&
				staticAppearances[ entityId ].asset &&
				staticAppearances[ entityId ].asset.resource &&
				staticAppearances[ entityId ].asset.resource.dimensions ) {

				// entity has a static appearance
				vec2.copy( dimensions, staticAppearances[ entityId ].asset.resource.dimensions )

			} else if( animatedAppearances &&
				animatedAppearances[ entityId ] &&
				animatedAppearances[ entityId ].asset &&
				animatedAppearances[ entityId ].asset.frameDimensions ) {

				// entity has an animated appearance
				vec2.copy( dimensions, animatedAppearances[ entityId ].asset.frameDimensions )

			} else if( tilemaps &&
				tilemaps[ entityId ] &&
				tilemaps[ entityId ].asset ) {

				// entity is a tilemap
				vec2.copy( dimensions, tilemaps[ entityId ].asset.tilemapDimensions )
				vec2.multiply( dimensions, dimensions, tilemaps[ entityId ].asset.spriteSheet.frameDimensions )

			} else {
				return
			}

			// apply scale factor
			if( transforms && transforms[ entityId ] ) {

                // TODO: using the worldScale would be more correct here, but as we don't want to calculate it
                // only for this test, use the local scale
				// vec2.multiply( dimensions, dimensions, transforms[ entityId ].scale )
			}

			return dimensions
		}

		/**
		 * Sets the attribute of a component to the specified value.
		 *
		 * @private
		 * @param component
		 * @param attributeId
		 * @param value
		 */
		var setAttribute = function( component, attributeId, value ) {
			// TODO: Unfortunately there is no generic copy operator in javascript.
			if( _.isObject( value ) ||
				_.isArray( value ) ) {
				_.extend( component[ attributeId ], value )

			} else {
				component[ attributeId ] = value
			}
		}

		var updateComponentAttributeTM = function( assetManager, moduleLoader, componentsWithAssets, componentId, attributeId, component, value ) {
			setAttribute( component, attributeId, value )

			if( componentsWithAssets[ componentId ] ) {
				var assetIdChanged = attributeId === 'assetId'

				if( assetIdChanged ) {
					injectAsset( assetManager, moduleLoader, component )
				}
			}
		}

		var updateComponentTM = function( assetManager, moduleLoader, componentsWithAssets, componentId, component, attributeConfig ) {
			for( var attributeId in attributeConfig ) {
				setAttribute( component, attributeId, attributeConfig[ attributeId ] )
			}

			if( componentsWithAssets[ componentId ] ) {
				var assetIdChanged = !!attributeConfig[ 'assetId' ]

				if( assetIdChanged ) {
					injectAsset( assetManager, moduleLoader, component )
				}
			}
		}

		var EntityManager = function( spell, configurationManager, assetManager, eventManager, libraryManager, moduleLoader ) {
			this.configurationManager = configurationManager
			this.componentMaps        = {}
			this.assetManager         = assetManager
			this.eventManager         = eventManager
			this.libraryManager       = libraryManager
			this.moduleLoader         = moduleLoader
			this.spell                = spell
			this.spatialIndex         = undefined
			this.componentsWithAssets = {}
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
			 * Example:
			 *
			 *     // create a new entity with the given components
			 *     var entityId = spell.entityManager.createEntity({
			 *         config: {
			 *             "spell.component.2d.transform": {
			 *                 "translation": [ 100, 200 ]
			 *             },
			 *             "spell.component.visualObject": {
			 *               // if no configuration is specified the default values of this component will be used
			 *             },
			 *             "spell.component.2d.graphics.appearance": {
			 *                 "assetId": "appearance:library.identifier.of.my.static.appearance"
			 *             }
			 *         }
			 *     })
			 *
			 *     // create a new entity with child entities
			 *     var entityId = spell.entityManager.createEntity({
			 *         config: {
			 *             "spell.component.2d.transform": {
			 *                 "translation": [ 100, 200 ]
			 *             },
			 *             "spell.component.visualObject": {
			 *               // if no configuration is specified the default values of this component will be used
			 *             },
			 *             "spell.component.2d.graphics.appearance": {
			 *                 "assetId": "appearance:library.identifier.of.my.static.appearance"
			 *             }
			 *         },
			 *         children: [
			 *             {
			 *                 config: {
			 *                     "spell.component.2d.transform": {
			 *                         "translation": [ -15, 20 ] // translation is relative to the parent
			 *                     },
			 *                     "spell.component.visualObject": {
			 *                       // if no configuration is specified the default values of this component will be used
			 *                     },
			 *                     "spell.component.2d.graphics.appearance": {
			 *                         "assetId": "appearance:library.identifier.of.my.other.static.appearance"
			 *                     }
			 *                 }
			 *             }
			 *         ]
			 *     })
			 *
			 *     // create a new entity from an entity template
			 *     var entityId = spell.entityManager.createEntity({
			 *         entityTemplateId: 'library.identifier.of.my.template'
			 *     })
			 *
			 *     // create a new entity from an entity template and override values from the template
			 *     var entityId = spell.entityManager.createEntity({
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
				return createEntity( this.spell, this.assetManager, this.eventManager, this.libraryManager, this.moduleLoader, this.componentMaps, this.spatialIndex, entityConfig )
			},

			/**
			 * Creates entities from a list of entity configs.
			 *
			 * See {@link #createEntity} function for a documentation of the entity config object.
			 *
			 * @param {Array} entityConfigs
			 */
			createEntities : function( entityConfigs ) {
				for( var i = 0, n = entityConfigs.length; i < n; i++ ) {
					this.createEntity( entityConfigs[ i ] )
				}
			},

			/**
			 * Removes an entity
			 *
			 * @param {String} entityId the id of the entity to remove
			 */
			removeEntity : function( entityId ) {
				if( !entityId ) {
					return false
				}

				removeEntity( this.eventManager, this.componentMaps, this.spatialIndex, entityId )

				return true
			},

			/**
			 * Creates an exact copy of the given entityId
			 * @param entityId
			 */
			cloneEntity: function( entityId ) {
				var entityConfig = {
					config : assembleEntityInstance( this.componentMaps, entityId )
				}

				return createEntity( this.spell, this.assetManager, this.eventManager, this.libraryManager, this.moduleLoader, this.componentMaps, this.spatialIndex, entityConfig )
			},


			/**
			 * Returns the width and height for a given entity
			 * @param entityId
			 * @return vec2 2d-vector containing the dimension
			 */
			getEntityDimensions: function( entityId ) {
				return getEntityDimensions( this.componentMaps, entityId )
			},


			/**
			 * Returns an array of ids of entities which have the requested name.
			 *
			 * @param {String} name the name of the entity
			 * @param {String} scopeEntityId the scope of the search is limited to this entity and its descendants
			 * @return {Array}
			 */
			getEntityIdsByName : function( name, scopeEntityId ) {
				var componentMaps      = this.componentMaps,
					metaDataComponents = componentMaps[ METADATA_COMPONENT_ID ],
					resultIds          = []

				var ids = scopeEntityId ?
					getEntityCompositeIds( componentMaps[ COMPOSITE_COMPONENT_ID ], scopeEntityId, [] ) :
					_.keys( metaDataComponents )

				for( var i = 0, n = ids.length; i < n; i++ ) {
					var nameComponentId = ids[ i ]

					if( metaDataComponents[ nameComponentId ] && metaDataComponents[ nameComponentId ][ 'name' ] === name ) {
						resultIds.push( nameComponentId )
					}
				}

				return resultIds
			},

			/**
			 * Returns all entities which intersect with the region defined by the position and dimension. The return
			 * value is an object with the entity ids as keys and additional entity metadata as value.
			 *
			 * @param position {Array} the position of the region in world coordinates
			 * @param dimensions {Array} the dimensions of the region in world coordinates
			 * @return {Object}
			 */
			getEntityIdsByRegion : function( position, dimensions ) {
				return this.spatialIndex.search( position, dimensions )
			},

			/**
			 * Initializes the entity manager.
			 */
			init : function() {
				this.spatialIndex = new QuadTree( this.configurationManager.getValue( 'quadTreeSize' ) )

				// create root entity
				var entityConfig = {
					id : ROOT_ENTITY_ID,
					parentId : INVALID_ENTITY_ID
				}

				createEntity( this.spell, this.assetManager, this.eventManager, this.libraryManager, this.moduleLoader, this.componentMaps, this.spatialIndex, entityConfig )
            },

			/**
			 * Destroys the entity manager. Frees all internal resources.
			 */
			destroy : function() {
				this.removeEntity( ROOT_ENTITY_ID )
			},

			/**
			 * Changes the parent of the specified entity.
			 *
			 * Example:
			 *
			 *     // make entity A the child of entity B
			 *     spell.entityManager.changeParentEntity( aId, bId )
			 *
			 *     // make entity A a root entity, that is it has no parent
			 *     spell.entityManager.changeParentEntity( aId )
			 *
			 * @param entityId the id of the entity which gets reassigned
			 * @param newParentEntityId the id of the entity which will be the parent entity
			 */
			changeParentEntity : function( entityId, newParentEntityId ) {
				if( !entityId ) throw 'Error: Missing entity id.'

				this.updateComponent( entityId, COMPOSITE_COMPONENT_ID, { parentId : newParentEntityId } )
			},

			/**
			 * Check if an entity already has a specific component
			 *
			 * @param {String} entityId of the entity that the component belongs to
			 * @param {String} componentId the library path of the component
			 * @return {Boolean}
			 */
			hasComponent : function( entityId, componentId ) {
				var componentMap = this.componentMaps[ componentId ]
				if( !componentMap ) return false

				return !!componentMap[ entityId ]
			},

			/**
			 * Adds a component to an entity.
			 *
			 * Example:
			 *
			 *     // add a component with it's default configuration to this entity
			 *     spell.entityManager.addComponent( entityId, "spell.component.2d.graphics.debug.box" )
			 *
			 *     // add a component to this entity and override a default value
			 *     spell.entityManager.addComponent(
			 *         entityId,
			 *         "spell.component.2d.graphics.textApperance",
			 *         {
			 *             "text": "Hello World"
			 *         }
			 *     )
			 *
			 * @param {String} entityId of the entity that the component belongs to
			 * @param {String} componentId the library path of the component to add
			 * @param {Object} attributeConfig the attribute configuration of the component
			 */
			addComponent : function( entityId, componentId, attributeConfig ) {
				if( !entityId ) throw 'Error: Missing entity id.'
				if( !componentId ) throw 'Error: Missing component id.'

				var componentConfigs = {}
				componentConfigs[ componentId ] = attributeConfig || {}

				addComponents(
					this.componentMaps,
					this.eventManager,
					this.spatialIndex,
					entityId,
					createComponents( this.spell, this.assetManager, this.libraryManager, this.moduleLoader, componentConfigs )
				)
			},

			/**
			 * Removes a component from an entity.
			 *
			 * @param {String} entityId the id of the entity that the component belongs to
			 * @param {String} componentId the library path of the component to remove
			 */
			removeComponent : function( entityId, componentId ) {
				if( !entityId ) throw 'Error: Missing entity id.'

				var eventManager  = this.eventManager,
					componentMaps = this.componentMaps

				removeComponent( eventManager, componentMaps, this.spatialIndex, componentId, entityId )

				if( !entityExists( componentMaps, entityId ) ) {
					eventManager.publish( eventManager.EVENT.ENTITY_REMOVED, entityId )
				}
			},

			/**
			 * Returns a component from a specific entity.
			 *
			 * @param {String} entityId the id of the requested entity
			 * @param {String} componentId the requested component id
			 * @return {Object}
			 */
			getComponentById : function( entityId, componentId ) {
				var componentMap = this.componentMaps[ componentId ]

				return componentMap ? componentMap[ entityId ] : undefined
			},

			/**
			 * Returns a collection of components which have the requested component id and belong to entities which have the requested name.
			 *
			 * @param {String} componentId the requested component id
			 * @param {String} name the requested entity name
			 * @param {String} scopeEntityId the scope of the search is limited to this entity and its descendants
			 * @return {Object}
			 */
			getComponentsByName : function( componentId, name, scopeEntityId ) {
				var componentMap = this.getComponentMapById( componentId ),
					ids          = this.getEntityIdsByName( name, scopeEntityId )

				if( ids.length === 0 ||
					!componentMap ) {

					return []
				}

				return _.pick( componentMap, ids )
			},

			/**
			 * Updates the attributes of a component. Returns true when successful, false otherwise.
			 *
			 * Example:
			 *     // update a component of an entity
			 *     spell.entityManager.updateComponent(
			 *         entityId,
			 *         "spell.component.2d.graphics.appearance",
			 *         {
			 *             assetId : "appearance:library.identifier.of.my.static.appearance"
			 *         }
			 *     )
			 *
			 * @param {String} entityId the id of the entity which the component belongs to
			 * @param {String} componentId the library path of the component
			 * @param {Object} attributeConfig the attribute configuration change of the component
			 * @return {Boolean} true if the component could be found, false otherwise
			 */
			updateComponent : function( entityId, componentId, attributeConfig ) {
				var componentMaps = this.componentMaps,
					components    = componentMaps[ componentId ],
					component     = components[ entityId ]

				if( !component ) return false

				// HACK: create a partial clone of the component
				var oldComponentState = {}

				for( var attributeId in attributeConfig ) {
					oldComponentState[ attributeId ] = deepClone( component[ attributeId ] )
				}

				updateComponentTM( this.assetManager, this.moduleLoader, this.componentsWithAssets, componentId, component, attributeConfig )

				var eventManager  = this.eventManager,
					spatialIndex  = this.spatialIndex

				if( componentId === COMPOSITE_COMPONENT_ID ) {
					removeFromParentEntity( components, entityId, oldComponentState.parentId )
					addToParentEntity( components, entityId, component.parentId )
					updateWorldTransform( componentMaps, eventManager, spatialIndex, true, entityId )
					updateVisualObject( componentMaps, entityId )

				} else if( componentId === TRANSFORM_COMPONENT_ID ) {
					if( attributeConfig.translation ||
						attributeConfig.scale ||
						attributeConfig.rotation !== undefined ) {

						updateWorldTransform( componentMaps, eventManager, spatialIndex, true, entityId )
					}

				} else if( componentId === TEXTURE_MATRIX_COMPONENT_ID ) {
					if( attributeConfig.translation ||
						attributeConfig.scale ||
						attributeConfig.rotation ) {

						updateTextureMatrix( componentMaps[ TEXTURE_MATRIX_COMPONENT_ID ][ entityId ] )
					}

				} else if( componentId === VISUAL_OBJECT_COMPONENT_ID ) {
					updateSpatialIndex( componentMaps, spatialIndex, entityId )
					updateVisualObject( componentMaps, entityId )
				}

				eventManager.publish( [ eventManager.EVENT.COMPONENT_UPDATED, componentId ], [ component, entityId ] )

				return true
			},

			/**
			 * Updates one attribute of a component. Returns true when successful, false otherwise.
			 *
			 * Example:
			 *     // update a specific attribute of a component of an entity
			 *     spell.entityManager.updateComponentAttribute(
			 *         entityId,
			 *         "spell.component.2d.transform",
			 *         "translation",
			 *         [ 10, 10 ]
			 *     )
			 *
			 * @param {String} entityId the id of the entity which the component belongs to
			 * @param {String} componentId the library path of the component
			 * @param {String} attributeId the id of the attribute
			 * @param {Object} value the value of the attribute
			 * @return {Boolean} true if the component could be found, false otherwise
			 */
			updateComponentAttribute : function( entityId, componentId, attributeId, value ) {
				var componentMaps = this.componentMaps,
					components    = componentMaps[ componentId ],
					component     = components[ entityId ]

				if( !component ) return false

				var oldAttributeValue = component[ attributeId ]
				if( oldAttributeValue === undefined ) return false

				updateComponentAttributeTM( this.assetManager, this.moduleLoader, this.componentsWithAssets, componentId, attributeId, component, value )

				var eventManager  = this.eventManager,
					spatialIndex  = this.spatialIndex

				if( componentId === COMPOSITE_COMPONENT_ID &&
					attributeId === 'parentId' ) {

					removeFromParentEntity( components, entityId, oldAttributeValue )
					addToParentEntity( components, entityId, value )
					updateWorldTransform( componentMaps, eventManager, spatialIndex, true, entityId )
					updateVisualObject( componentMaps, entityId )

				} else if( componentId === TRANSFORM_COMPONENT_ID ) {
					if( attributeId === 'translation' ||
						attributeId === 'scale' ||
						attributeId === 'rotation' ) {

						updateWorldTransform( componentMaps, eventManager, spatialIndex, true, entityId )
					}

				} else if( componentId === TEXTURE_MATRIX_COMPONENT_ID ) {
					if( attributeId === 'translation' ||
						attributeId === 'scale' ||
						attributeId === 'rotation' ) {

						updateTextureMatrix( componentMaps[ TEXTURE_MATRIX_COMPONENT_ID ][ entityId ] )
					}

				} else if( componentId === VISUAL_OBJECT_COMPONENT_ID ) {
					updateSpatialIndex( componentMaps, spatialIndex, entityId )
					updateVisualObject( componentMaps, entityId )
				}

				eventManager.publish( [ eventManager.EVENT.COMPONENT_UPDATED, componentId ], [ component, entityId ] )

				return true
			},

			/**
			 * Returns a component map of a specific type.
			 *
			 * @param {String} componentId the requested component type / id
			 * @return {*}
			 */
			getComponentMapById : function( componentId ) {
				return this.componentMaps[ componentId ]
			},

			updateWorldTransform : function( entityId ) {
				updateWorldTransform( this.componentMaps, this.eventManager, this.spatialIndex, true, entityId )
			},

			updateTextureMatrix : function( entityId ) {
				updateTextureMatrix( this.componentMaps[ TEXTURE_MATRIX_COMPONENT_ID ][ entityId ] )
			},

			/**
			 * Updates all components which reference the asset with the updated asset instance.
			 *
			 * @param assetId
			 * @param asset
			 * @private
			 */
			updateAssetReferences : function( assetId, asset ) {
				var componentMaps = this.componentMaps

				for( var componentId in this.componentsWithAssets ) {
					var componentMap = componentMaps[ componentId ]

					for( var id in componentMap ) {
						var component = componentMap[ id ]

						if( component.assetId === assetId ) {
							component.asset = asset
						}
					}
				}
			},

			/**
			 * Refreshes all references to assets that components hold
			 *
			 * @private
			 * @param assetManager
			 */
			refreshAssetReferences : function( assetManager ) {
				var componentMaps = this.componentMaps

				for( var componentId in this.componentsWithAssets ) {
					var componentMap = componentMaps[ componentId ]

					for( var id in componentMap ) {
						var component = componentMap[ id ]

						if( component.assetId.slice( 0, component.assetId.indexOf( ':' ) ) === 'script' ) {
							continue
						}

						component.asset = assetManager.get( component.assetId )
					}
				}
			},

			/**
			 * Triggers an event on the specified entity.
			 *
			 * @param entityId
			 * @param eventId
			 * @param eventArguments
			 */
			triggerEvent : function( entityId, eventId, eventArguments ) {
				var component = this.componentMaps[ EVENT_HANDLERS_COMPONENT_ID ][ entityId ]

				if( !component ) return

				var eventHandler = component.asset[ eventId ]

				if( !eventHandler ) return

				eventHandler.apply( null, [ this.spell, entityId ].concat( eventArguments ) )
			},

			updateEntityTemplate : function( entityDefinition ) {
				var entityTemplateId = createId( entityDefinition.namespace, entityDefinition.name )

				// get ids of entities which are based on this entity template
				var ids = _.reduce(
					this.componentMaps[ METADATA_COMPONENT_ID ],
					function( memo, component, entityId ) {
						if( component.entityTemplateId === entityTemplateId ) {
							memo.push( entityId )
						}

						return memo
					},
					[]
				)

				for( var i = 0, id, n = ids.length; i < n; i++ ) {
					id = ids[ i ]

					// remove entities
					this.removeEntity( id )
					this.spatialIndex.remove( id )

					// recreate entities while using old ids
					this.createEntity( {
						entityTemplateId : entityTemplateId,
						id : id
					} )
				}
			},

			/**
			 * Registers the component specified by componentDefition. Components must be registered with this method before they can be used.
			 *
			 * @private
			 * @param componentDefinition
			 */
			registerComponent : function( componentDefinition ) {
				var componentId = createId( componentDefinition.namespace, componentDefinition.name )

				if( !isValidComponentDefinition( componentDefinition ) ) {
					throw 'Error: The format of the supplied component definition "' + componentId + '" is invalid.'
				}

				if( !this.componentMaps[ componentId ] ) {
					this.componentMaps[ componentId ] = {}
				}

				if( hasAssetIdAttribute( componentDefinition.attributes ) ) {
					this.componentsWithAssets[ componentId ] = true

				} else {
					delete this.componentsWithAssets[ componentId ]
				}
			}
		}

		return EntityManager
	}
)
