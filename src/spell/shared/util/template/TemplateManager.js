define(
	'spell/shared/util/template/TemplateManager',
	[
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


		/*
		 * private
		 */

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

		var addTemplate = function( assetManager, moduleLoader, onComponentTypeAdded, templates, componentsWithAssets, entityPrototypes, definition ) {
			var templateId = createId( definition.namespace, definition.name ),
				type       = definition.type

			templates[ templateId ] = definition

			if( type === TemplateTypes.ENTITY ) {
				entityPrototypes[ templateId ] = createComponents( assetManager, moduleLoader, templates, definition.config, null, templateId, false )

			} else if( type === TemplateTypes.COMPONENT ) {
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

		var createComponents = function( assetManager, moduleLoader, templates, componentConfig, entityPrototype, entityTemplateId, injectAssets ) {
			if( injectAssets === undefined ) injectAssets = true

			var entity = applyComponentConfig(
				entityPrototype ? deepClone( entityPrototype ) : {},
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


		/*
		 * public
		 */

		var TemplateManager = function( assetManager, moduleLoader ) {
			this.assetManager     = assetManager
			this.moduleLoader     = moduleLoader
			this.templates        = {}
			this.entityPrototypes = {}

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
					this.entityPrototypes,
					definition
				)
			},

			createComponents : function( entityTemplateId, config ) {
				var entityPrototype

				if( entityTemplateId ) {
					entityPrototype = this.entityPrototypes[ entityTemplateId ]

					if( !entityPrototype ) throw 'Error: Could not find entity prototype for template id \'' + entityTemplateId + '\'.'
				}

				return createComponents( this.assetManager, this.moduleLoader, this.templates, config, entityPrototype, entityTemplateId )
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

			hasTemplate : function( templateId ) {
				return !!getTemplate( this.templates, templateId )
			},

			getTemplate : function( templateId ) {
				return getTemplate( this.templates, templateId )
			},

			getTemplateIds : function( templateType ) {
				if( !_.contains( TemplateTypes, templateType ) ) throw 'Error: Template type \'' + templateType + '\' is not supported.'

				return _.reduce(
					this.templates,
					function( memo, template, templateId ) {
						return template.type === templateType ? memo.concat( templateId ) : memo
					},
					[]
				)
			},

			getTemplatesByType : function( templateType ) {
				return _.reduce(
					this.templates,
					function( memo, template ) {
						return templateType === template.type ?
							memo.concat( template ) :
							memo
					},
					[]
				)
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
