define(
	'spell/shared/util/template/TemplateManager',
	[
		'spell/shared/util/deepClone',
		'spell/shared/util/template/TemplateTypes',

		'spell/functions'
	],
	function(
		deepClone,
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

		var throwCouldNotFindTemplate = function( templateId, templateType ) {
			throw 'Error: Could not find a template with id \'' + templateId + ( templateType ? '\' of type ' + templateType : '' ) + '.'
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

		var createEntityPrototype = function( assets, templates, entityTemplate ) {
			return _.reduce(
				entityTemplate.config,
				function( memo, componentConfig, componentTemplateId ) {
					var componentTemplate = getTemplate( templates, componentTemplateId, TemplateTypes.COMPONENT )

					if( !componentTemplate ) throwCouldNotFindTemplate( componentTemplateId, TemplateTypes.COMPONENT )

					memo[ componentTemplateId ] = injectAsset(
						assets,
						componentTemplate,
						updateComponent( createComponentPrototype( componentTemplate ), componentConfig )
					)

					return memo
				},
				{}
			)
		}

		var addTemplate = function( assets, templates, entityPrototypes, definition ) {
			var templateId = createName( definition.namespace, definition.name )

			if( _.has( templates, templateId ) ) throw 'Error: Template definition \'' + templateId + '\' already exists.'


			templates[ templateId ] = definition

			if( definition.type === TemplateTypes.ENTITY ) {
				entityPrototypes[ templateId ] = createEntityPrototype( assets, templates, definition )
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

		var hasAssetIdAttribute = function( attributeConfig ) {
			return !!_.find(
				attributeConfig,
				function( attribute ) {
					return attribute.type.indexOf( 'assetId:' ) === 0
				}
			)
		}

		/**
		 * This function dereferences asset ids. If a component with an asset id attribute is found th reference is resolved and a additional asset attribute is
		 * add to the component instance.
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

		var createComponentsFromEntityTemplate = function( assets, templates, entityTemplateId, entity, componentConfig ) {
			return _.reduce(
				componentConfig,
				function( memo, attributeConfig, componentId ) {
					var componentTemplate = getTemplate( templates, componentId, TemplateTypes.COMPONENT )

					if( !componentTemplate ) {
						throw 'Error: Could not find component template \'' + componentId + '\' for \'' + entityTemplateId + '\'.'
					}

					memo[ componentId ] = injectAsset(
						assets,
						componentTemplate,
						updateComponent(
							memo[ componentId ] || {},
							attributeConfig
						)
					)

					return memo
				},
				entity
			)
		}

		var createComponents = function( assets, templates, componentConfig ) {
			return _.reduce(
				componentConfig,
				function( memo, attributeConfig, componentId ) {
					var componentTemplate = getTemplate( templates, componentId, TemplateTypes.COMPONENT )

					if( !componentTemplate ) {
						throw 'Error: Could not find component template \'' + componentId + '\'.'
					}

					memo[ componentId ] = injectAsset(
						assets,
						componentTemplate,
						updateComponent(
							createComponentPrototype( componentTemplate ),
							attributeConfig
						)
					)

					return memo
				},
				{}
			)
		}


		/*
		 * public
		 */

		function TemplateManager( assets ) {
			this.assets           = assets
			this.templates        = {}
			this.entityPrototypes = {}
		}

		TemplateManager.prototype = {
			add : function( definition ) {
				if( !definition.type ||
					!isValidDefinition( definition ) ) {

					throw 'Error: The format of the supplied template definition is invalid.'
				}

				addTemplate( this.assets, this.templates, this.entityPrototypes, definition )
			},

			createComponents : function( entityTemplateId, config ) {
				if( entityTemplateId ) {
					var entityPrototype = this.entityPrototypes[ entityTemplateId ]

					if( !entityPrototype ) throw 'Error: Could not find entity prototype for template id \'' + entityTemplateId + '\'.'

					return createComponentsFromEntityTemplate(
						this.assets,
						this.templates,
						entityTemplateId,
						deepClone( entityPrototype, true ),
						config
					)

				} else {
					return createComponents( this.assets, this.templates, config )
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
						return template.type === templateType ? memo.concat( templateId ) : memo
					},
					[]
				)
			}
		}

		return TemplateManager
	}
)
