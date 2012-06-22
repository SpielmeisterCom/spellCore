define(
	'spell/shared/util/template/TemplateManager',
	[
		'spell/shared/util/deepClone',
		'spell/shared/util/template/createLocalComponentName',
		'spell/shared/util/platform/underscore'
	],
	function(
		deepClone,
		createLocalComponentName,
		_
	) {
		'use strict'


		/**
		 * private
		 */

		var templateTypes = {
			TEMPLATE_TYPE_ENTITY    : 'entityTemplate',
			TEMPLATE_TYPE_COMPONENT : 'componentTemplate',
			TEMPLATE_TYPE_SYSTEM    : 'systemTemplate'
		}

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
			// check for ambiguous local component names
			var componentNameCounts = _.reduce(
				template.components,
				function( memo, componentConfig ) {
					var localComponentName = createLocalComponentName( componentConfig.templateId, componentConfig.importName )

					memo[ localComponentName ] = ( _.has( memo, localComponentName ) ?
						memo[ localComponentName ] += 1 :
						1
					)

					return memo
				},
				{}
			)

			return !_.any(
				componentNameCounts,
				function( iter ) { return iter > 1 }
			)
		}

		var isValidDefinition = function( template ) {
			var templateType = template.type

			if( !_.contains( templateTypes, templateType ) ) return false


			if( templateType === templateTypes.TEMPLATE_TYPE_COMPONENT ) {
				return isValidComponentTemplate( template )
			}

			if( templateType === templateTypes.TEMPLATE_TYPE_ENTITY ) {
				return isValidEntityTemplate( template )
			}

			return true
		}

		var throwCouldNotFindTemplate = function( templateId, templateType ) {
			throw 'Error: Could not find a template with id \'' + templateId + ( templateType ? '\' of type ' + templateType : '' ) + '.'
		}

		var createComponentTemplate = function( componentTemplate, hasSingleAttribute ) {
			if( hasSingleAttribute ) {
				return _.clone( componentTemplate.attributes[ 0 ][ 'default' ] )
			}

			return _.reduce(
				componentTemplate.attributes,
				function( memo, attributeConfig ) {
					memo[ attributeConfig.name ] = _.clone( attributeConfig[ 'default' ] )

					return memo
				},
				{}
			)
		}

		var updateComponent = function( component, attributeConfig, hasSingleAttribute ) {
			if( attributeConfig === undefined ) {
				return component

			} else if( hasSingleAttribute ) {
				return  _.clone( attributeConfig )

			} else {
				return _.extend( component, attributeConfig )
			}
		}

		var createEntityTemplate = function( templates, entityTemplate ) {
			return _.reduce(
				entityTemplate.components,
				function( memo, componentConfig ) {
					var componentTemplateId = componentConfig.templateId,
						componentTemplate = getTemplate( templates, componentTemplateId, templateTypes.TEMPLATE_TYPE_COMPONENT )

					if( !componentTemplate ) throwCouldNotFindTemplate( componentTemplateId, templateTypes.TEMPLATE_TYPE_COMPONENT )


					var localComponentName = createLocalComponentName( componentTemplateId, componentConfig.importName ),
						hasSingleAttribute = isSingleAttributeComponent( componentTemplate.attributes )

					memo[ localComponentName ] = updateComponent(
						createComponentTemplate( componentTemplate, hasSingleAttribute ),
						componentConfig.config,
						hasSingleAttribute
					)

					return memo
				},
				{}
			)
		}

		var addTemplate = function( templates, entityPrototype, definition ) {
			var templateId = createName( definition.namespace, definition.name )

			if( _.has( templates, templateId ) ) throw 'Error: Template definition \'' + templateId + '\' already exists.'


			templates[ templateId ] = definition

			if( definition.type === templateTypes.TEMPLATE_TYPE_ENTITY ) {
				entityPrototype[ templateId ] = createEntityTemplate( templates, definition )
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

		var isSingleAttributeComponent = function( attributes ) {
			if( attributes === undefined ) throw 'Error: \'attributes\' is of type falsy.'

			return _.isObject( attributes ) &&
				_.size( attributes ) === 1 &&
				attributes[ 0 ].name === 'value'
		}

		var createComponentsFromEntityTemplate = function( templates, templateId, entity, config ) {
			return _.reduce(
				config,
				function( memo, componentConfig, componentId ) {
					var componentTemplate = getTemplate( templates, componentId, templateTypes.TEMPLATE_TYPE_COMPONENT )

					if( !_.has( memo, componentId ) ) {
						throw 'Error: Entity template for entity template \'' + templateId + '\' is missing component \'' + componentId + '\'.' +
							' Maybe you forgot to add the component to the entity template?'
					}

					memo[ componentId ] = updateComponent(
						memo[ componentId ],
						componentConfig,
						isSingleAttributeComponent( componentTemplate.attributes )
					)

					return memo
				},
				entity
			)
		}

		var createComponents = function( templates, config ) {
			return _.reduce(
				config,
				function( memo, componentConfig, componentId ) {
					var componentTemplate = getTemplate( templates, componentId, templateTypes.TEMPLATE_TYPE_COMPONENT ),
						hasSingleAttribute = isSingleAttributeComponent( componentTemplate.attributes )

					memo[ componentId ] = updateComponent(
						createComponentTemplate( componentTemplate, hasSingleAttribute ),
						componentConfig,
						hasSingleAttribute
					)

					return memo
				},
				{}
			)
		}


		/**
		 * public
		 */

		function TemplateManager() {
			this.templates = {}
			this.entityPrototypes = {}
		}

		TemplateManager.prototype = {
			add : function( definition ) {
				if( !definition.type ||
					!isValidDefinition( definition ) ) {

					throw 'Error: The format of the supplied template definition is invalid.'
				}

				addTemplate( this.templates, this.entityPrototypes, definition )
			},

			createComponents : function( entityTemplateId, config ) {
				if( entityTemplateId ) {
					var entityPrototype = this.entityPrototypes[ entityTemplateId ]

					if( !entityPrototype ) throw 'Error: Could not find entity prototype for template id \'' + entityTemplateId + '\'.'

					return createComponentsFromEntityTemplate( this.templates, entityTemplateId, deepClone( entityPrototype ), config )

				} else {
					return createComponents( this.templates, config )
				}
			},

			hasTemplate : function( templateId ) {
				return !!getTemplate( this.templates, templateId )
			},

			getTemplate : function( templateId ) {
				return getTemplate( this.templates, templateId )
			},

			getTemplateIds : function( templateType ) {
				if( !_.contains( templateTypes, templateType ) ) throw 'Error: Template type \'' + templateType + '\' is not supported.'

				return _.reduce(
					this.templates,
					function( memo, template, templateId ) {
						return template.type === templateType ? memo.concat( templateId ) : memo
					},
					[]
				)
			},

			/**
			 * Returns true if the component is a single attribute component, false otherwise.
			 *
			 * @param templateId - component template id
			 * @return {*}
			 */
			isSingleAttributeComponent : function( templateId ) {
				var template = getTemplate( this.templates, templateId, templateTypes.TEMPLATE_TYPE_COMPONENT )

				if( !template ) throw 'Error: Could not find component template with id \'' + templateId + '\'.'

				return isSingleAttributeComponent( template.attributes )
			}
		}

		return TemplateManager
	}
)
