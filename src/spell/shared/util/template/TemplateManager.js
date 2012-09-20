define(
	'spell/shared/util/template/TemplateManager',
	[
		'spell/shared/util/deepClone',
		'spell/shared/util/template/applyComponentConfig',
		'spell/shared/util/template/TemplateTypes',

		'spell/functions'
	],
	function(
		deepClone,
		applyComponentConfig,
		TemplateTypes,

		_
	) {
		'use strict'


		/*
		 * private
		 */

		var createName = function() {
		    return _.reduce(
		        arguments,
		        function( memo, argument ) {
		            if( argument === '' ) return memo

		            return memo + ( memo !== '' ? '.' : '' )  + argument
		        },
		        ''
		    )
		}

		var isValidComponentTemplate = function( template ) {
			// check for ambiguous attribute names
			var attributeNameCounts = _.reduce(
				template.attributes,
				function( memo, attributeConfig ) {
					var attributeName = attributeConfig.name

					memo[ attributeName ] = ( _.has( memo, attributeName ) ?
						memo[ attributeName ] += 1 :
						1
					)

					return memo
				},
				{}
			)

			return !_.any(
				attributeNameCounts,
				function( iter ) { return iter > 1 }
			)
		}

		var isValidEntityTemplate = function( template ) {
			// check for duplicate components
			var componentNameCounts = _.reduce(
				template.components,
				function( memo, componentConfig ) {
					var templateId = componentConfig.templateId

					memo[ templateId ] = ( _.has( memo, templateId ) ?
						memo[ templateId ] += 1 :
						1
					)

					return memo
				},
				{}
			)

			_.each(
				componentNameCounts,
				function( componentNameCount, componentName ) {
					if( componentNameCount > 1 ) {
						throw 'Error: Entity template \'' + template.templateId + '\' has duplicate component of type \'' + componentName + '\'.'
					}
				}
			)

			return true
		}

		var isValidDefinition = function( template ) {
			var templateType = template.subtype

			if( !_.contains( TemplateTypes, templateType ) ) return false


			if( templateType === TemplateTypes.COMPONENT ) {
				return isValidComponentTemplate( template )
			}

			if( templateType === TemplateTypes.ENTITY ) {
				return isValidEntityTemplate( template )
			}

			return true
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
					return attribute.type.indexOf( 'assetId:' ) === 0
				}
			)
		}

		var addTemplate = function( assets, templates, componentTemplatesWithAssets, entityPrototypes, definition ) {
			var templateId = createName( definition.namespace, definition.name ),
				type       = definition.subtype

			if( _.has( templates, templateId ) ) throw 'Error: Template definition \'' + templateId + '\' already exists.'

			templates[ templateId ] = definition

			if( type === TemplateTypes.ENTITY ) {
				entityPrototypes[ templateId ] = createComponents( assets, templates, definition.config, null, templateId, false )

			} else if( type === TemplateTypes.COMPONENT ) {
				var hasAssetId = hasAssetIdAttribute( definition.attributes )

				if( hasAssetId ) componentTemplatesWithAssets[ templateId ] = true
			}
		}

		var getTemplate = function( templates, templateId, templateType ) {
			var template = templates[ templateId ]

			return ( !template ?
				false :
				( !templateType ?
					template :
					( template.subtype !== templateType ?
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
		 * @param assets
		 * @param componentTemplate
		 * @param component
		 * @return {*}
		 */
		var injectAsset = function( assets, componentTemplate, component ) {
			if( hasAssetIdAttribute( componentTemplate.attributes ) ) {
				component.asset = assets[ component.assetId ]
			}

			return component
		}

		var createComponents = function( assets, templates, componentConfig, entityPrototype, entityTemplateId, injectAssets ) {
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

					entity[ componentId ] = ( injectAssets ?
						injectAsset( assets, componentTemplate, updatedComponent ) :
						updatedComponent
					)
				}
			)

			return entity
		}


		/*
		 * public
		 */

		function TemplateManager( assets ) {
			this.assets                       = assets
			this.templates                    = {}
			this.entityPrototypes             = {}

			// map of component template ids which have an asset id
			this.componentTemplatesWithAssets = {}
		}

		TemplateManager.prototype = {
			add : function( definition ) {
				if( !isValidDefinition( definition ) ) {
					throw 'Error: The format of the supplied template definition is invalid.'
				}

				addTemplate(
					this.assets,
					this.templates,
					this.componentTemplatesWithAssets,
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

				return createComponents( this.assets, this.templates, config, entityPrototype, entityTemplateId )
			},

			updateComponent : function( componentId, component, attributeConfig ) {
				updateComponent( component, attributeConfig )

				if( this.componentTemplatesWithAssets[ componentId ] ) {
					var assetIdChanged = !!attributeConfig[ 'assetId' ]

					if( assetIdChanged ) {
						injectAsset( this.assets, this.templates[ componentId ], component )
					}
				}
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
						return template.subtype === templateType ? memo.concat( templateId ) : memo
					},
					[]
				)
			}
		}

		return TemplateManager
	}
)
