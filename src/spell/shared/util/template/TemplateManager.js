define(
	'spell/shared/util/template/TemplateManager',
	[
		'spell/config/entity/createAmbiguousSiblingName',
		'spell/config/entity/recursiveFind',
		'spell/shared/util/createId',
		'spell/shared/util/createModuleId',
		'spell/shared/util/deepClone',
		'spell/shared/util/platform/PlatformKit',
		'spell/shared/util/template/applyComponentConfig',
		'spell/shared/util/template/TemplateTypes',
		'spell/stringUtil',

		'spell/functions'
	],
	function(
		createAmbiguousSiblingName,
		recursiveFind,
		createId,
		createModuleId,
		deepClone,
		PlatformKit,
		applyComponentConfig,
		TemplateTypes,
		stringUtil,

		_
	) {
		'use strict'


		var isValidComponentTemplate = function( template ) {
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

		var isValidEntityTemplate = function( entityTemplate ) {
			// check for duplicate components
			var componentNameCounts = _.reduce(
				entityTemplate.components,
				function( memo, componentConfig ) {
					var componentId = componentConfig.componentId

					memo[ componentId ] = memo[ componentId ] ?
						memo[ componentId ] + 1 :
						1

					return memo
				},
				{}
			)

			// check for ambiguous sibling names
			var ambiguousName = recursiveFind( entityTemplate, createAmbiguousSiblingName )

			if( ambiguousName ) {
				throw 'Error: The entity template "' + createId( entityTemplate.namespace, entityTemplate.name ) + '" contains the ambiguous sibling name "' + ambiguousName + '". Entity siblings must have unique names.'
			}

			_.each(
				componentNameCounts,
				function( componentNameCount, componentName ) {
					if( componentNameCount > 1 ) {
						throw 'Error: Entity template \'' + createId( entityTemplate.namespace, entityTemplate.name ) + '\' has duplicate component of type \'' + componentName + '\'.'
					}
				}
			)

			return true
		}

		var isValidDefinition = function( template ) {
			var templateType = template.type

			if( !_.contains( TemplateTypes, templateType ) ) return false


			if( templateType === TemplateTypes.COMPONENT ) {
				return isValidComponentTemplate( template )
			}

			if( templateType === TemplateTypes.ENTITY ) {
				return isValidEntityTemplate( template )
			}

			return true
		}

		/**
		 * Sets the attribute of a component to the specified value.
		 *
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

		var createComponentPrototype = function( componentTemplate ) {
			return _.reduce(
				componentTemplate.attributes,
				function( memo, attributeConfig ) {
					memo[ attributeConfig.name ] = _.clone( attributeConfig[ 'default' ] )

					return memo
				},
				{}
			)
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

		var addTemplate = function( assetManager, moduleLoader, onComponentTypeAdded, templates, componentsWithAssets, definition ) {
			var templateId = createId( definition.namespace, definition.name ),
				type       = definition.type

			templates[ templateId ] = definition

			if( type === TemplateTypes.COMPONENT ) {
				var hasAssetId = hasAssetIdAttribute( definition.attributes )

				if( hasAssetId ) componentsWithAssets[ templateId ] = true

				onComponentTypeAdded( templateId )
			}
		}

		var getTemplate = function( templates, templateId, templateType ) {
			var template = templates[ templateId ]

			return ( !template ?
				false :
				( !templateType ?
					template :
					( template.type !== templateType ?
						false :
						template
					)
				)
			)
		}

		/**
		 * This function dereferences asset ids. If a component with an asset id attribute is found the reference is resolved and a additional asset attribute
		 * is added to the component instance.
		 *
		 * @param assetManager
		 * @param componentTemplate
		 * @param component
		 * @return {*}
		 */
		var injectAsset = function( assetManager, moduleLoader, componentTemplate, component ) {
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

		var createComponents = function( assetManager, moduleLoader, templates, componentConfig, entityTemplateId, entityTemplate, injectAssets ) {
			if( injectAssets === undefined ) injectAssets = true

			var entity = applyComponentConfig(
				entityTemplate ? deepClone( entityTemplate.config ) : {},
				componentConfig
			)

			_.each(
				entity,
				function( attributeConfig, componentId ) {
					var componentTemplate = getTemplate( templates, componentId, TemplateTypes.COMPONENT )

					if( !componentTemplate ) {
						throw 'Error: Could not find component template \'' + componentId +
							( entityTemplateId ?
								'\' referenced in entity template \'' + entityTemplateId + '\'.' :
								'\'.'
							)
					}

					var updatedComponent = updateComponent(
						createComponentPrototype( componentTemplate ),
						attributeConfig
					)

					entity[ componentId ] = hasAssetIdAttribute( componentTemplate.attributes ) && injectAssets ?
						injectAsset( assetManager, moduleLoader, componentTemplate, updatedComponent ) :
						updatedComponent
				}
			)

			return entity
		}


		var TemplateManager = function( assetManager, moduleLoader ) {
			this.assetManager = assetManager
			this.moduleLoader = moduleLoader
			this.templates    = {}

			// map of components which have an asset id
			this.componentsWithAssets = {}
		}

		TemplateManager.prototype = {
			add : function( definition ) {
				if( !isValidDefinition( definition ) ) {
					throw 'Error: The format of the supplied template definition is invalid.'
				}

				addTemplate(
					this.assetManager,
					this.moduleLoader,
					this.onComponentTypeAdded,
					this.templates,
					this.componentsWithAssets,
					definition
				)
			},

			createComponents : function( entityTemplateId, config ) {
				var entityTemplate = getTemplate( this.templates, entityTemplateId, TemplateTypes.ENTITY )

				return createComponents( this.assetManager, this.moduleLoader, this.templates, config, entityTemplateId, entityTemplate )
			},

			updateComponent : function( componentId, component, attributeConfig ) {
				for( var attributeId in attributeConfig ) {
					setAttribute( component, attributeId, attributeConfig[ attributeId ] )
				}

				if( this.componentsWithAssets[ componentId ] ) {
					var assetIdChanged = !!attributeConfig[ 'assetId' ]

					if( assetIdChanged ) {
						injectAsset( this.assetManager, this.moduleLoader, this.templates[ componentId ], component )
					}
				}
			},

			updateComponentAttribute : function( componentId, attributeId, component, value ) {
				setAttribute( component, attributeId, value )

				if( this.componentsWithAssets[ componentId ] ) {
					var assetIdChanged = attributeId === 'assetId'

					if( assetIdChanged ) {
						injectAsset( this.assetManager, this.moduleLoader, this.templates[ componentId ], component )
					}
				}
			},

			getComponentsWithAssets : function() {
				return _.keys( this.componentsWithAssets )
			},

			getTemplate : function( templateId ) {
				return getTemplate( this.templates, templateId )
			},

			/**
			 * HACK: entityManager and TemplateManager need major surgery.
			 *
			 * @param fn
			 */
			registerComponentTypeAddedCallback : function( fn ) {
				this.onComponentTypeAdded = fn
			}
		}

		return TemplateManager
	}
)
