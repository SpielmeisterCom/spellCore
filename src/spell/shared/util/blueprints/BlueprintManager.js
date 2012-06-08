define(
	'spell/shared/util/blueprints/BlueprintManager',
	[
		'spell/shared/util/deepClone',
		'spell/shared/util/blueprints/createLocalComponentName',
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

		var blueprintTypes = {
			BLUEPRINT_TYPE_ENTITY    : 'entityBlueprint',
			BLUEPRINT_TYPE_COMPONENT : 'componentBlueprint',
			BLUEPRINT_TYPE_SYSTEM    : 'systemBlueprint'
		}

		var isValidComponentBlueprint = function( blueprint ) {
			// check for ambiguous attribute names
			var attributeNameCounts = _.reduce(
				blueprint.attributes,
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

		var isValidEntityBlueprint = function( blueprint ) {
			// check for ambiguous local component names
			var componentNameCounts = _.reduce(
				blueprint.components,
				function( memo, componentConfig ) {
					var localComponentName = createLocalComponentName( componentConfig.blueprintId, componentConfig.importName )

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

		var isValidDefinition = function( blueprint ) {
			var bluePrintType = blueprint.type

			if( !_.contains( blueprintTypes, bluePrintType ) ) return false


			if( bluePrintType === blueprintTypes.BLUEPRINT_TYPE_COMPONENT ) {
				return isValidComponentBlueprint( blueprint )
			}

			if( bluePrintType === blueprintTypes.BLUEPRINT_TYPE_ENTITY ) {
				return isValidEntityBlueprint( blueprint )
			}

			return true
		}

		var throwCouldNotFindBlueprint = function( blueprintId, blueprintType ) {
			throw 'Error: Could not find a blueprint with id \'' + blueprintId + ( blueprintType ? '\' of type ' + blueprintType : '' ) + '.'
		}

		var createComponentTemplate = function( componentBlueprint ) {
			if( _.size( componentBlueprint.attributes ) === 1 ) {
				return _.clone( componentBlueprint.attributes[ 0 ][ 'default' ] )
			}

			return _.reduce(
				componentBlueprint.attributes,
				function( memo, attributeConfig ) {
					memo[ attributeConfig.name ] = _.clone( attributeConfig[ 'default' ] )

					return memo
				},
				{}
			)
		}

		var updateComponent = function( component, attributeConfig, isSingleAttributeComponent ) {
			if( attributeConfig === undefined ) {
				return component

			} else if( isSingleAttributeComponent ) {
				return  _.clone( attributeConfig )

			} else {
				return _.extend( component, attributeConfig )
			}
		}

		var createEntityTemplate = function( blueprints, entityBlueprint ) {
			return _.reduce(
				entityBlueprint.components,
				function( memo, componentConfig ) {
					var componentBlueprintId = componentConfig.blueprintId,
						componentBlueprint = getBlueprint( blueprints, componentBlueprintId, blueprintTypes.BLUEPRINT_TYPE_COMPONENT )

					if( !componentBlueprint ) throwCouldNotFindBlueprint( componentBlueprintId, blueprintTypes.BLUEPRINT_TYPE_COMPONENT )


					var localComponentName = createLocalComponentName( componentBlueprintId, componentConfig.importName )

					memo[ localComponentName ] = updateComponent(
						createComponentTemplate( componentBlueprint ),
						componentConfig.config,
						isSingleAttributeComponent( componentBlueprint.attributes )
					)

					return memo
				},
				{}
			)
		}

		var updateEntity = function( blueprints, blueprintId, entity, entityConfig ) {
			return _.reduce(
				entityConfig,
				function( memo, componentConfig, componentId ) {
					var componentBlueprint = getBlueprint( blueprints, componentId, blueprintTypes.BLUEPRINT_TYPE_COMPONENT )

					if( !_.has( memo, componentId ) ) {


						console.log( memo )


						throw 'Error: Entity template for entity blueprint \'' + blueprintId + '\' is missing component \'' + componentId + '\'.' +
							' Maybe you forgot to add the component to the entity blueprint?'
					}

					memo[ componentId ] = updateComponent(
						memo[ componentId ],
						componentConfig,
						isSingleAttributeComponent( componentBlueprint.attributes )
					)

					return memo
				},
				entity
			)
		}

		var addBlueprint = function( blueprints, entityTemplates, definition ) {
			var blueprintId = definition.namespace + '.' + definition.name

			if( _.has( blueprints, blueprintId ) ) throw 'Error: Blueprint definition \'' + blueprintId + '\' already exists.'


			blueprints[ blueprintId ] = definition

			if( definition.type === blueprintTypes.BLUEPRINT_TYPE_ENTITY ) {
				entityTemplates[ blueprintId ] = createEntityTemplate( blueprints, definition )
			}
		}

		var getBlueprint = function( blueprints, blueprintId, blueprintType ) {
			var blueprint = blueprints[ blueprintId ]

			return ( !blueprint ?
				false :
				( !blueprintType ?
					blueprint :
					( blueprint.type !== blueprintType ?
						false :
						blueprint
					)
				)
			)
		}

		var isSingleAttributeComponent = function( attributes ) {
			if( attributes === undefined ) throw 'Error: \'attributes\' is of type falsy.'

			return _.isObject( attributes ) &&
				_.size( attributes ) === 1
		}


		/**
		 * public
		 */

		function BlueprintManager() {
			this.blueprints = {}
			this.entityTemplates = {}
		}

		BlueprintManager.prototype = {
			add : function( definition ) {
				if( !definition.type ||
					!isValidDefinition( definition ) ) {

					throw 'Error: The format of the supplied blueprint definition is invalid.'
				}

				addBlueprint( this.blueprints, this.entityTemplates, definition )
			},
			createEntity : function( blueprintId, entityConfig ) {
				var entityTemplate = this.entityTemplates[ blueprintId ]

				if( !entityTemplate ) throw 'Error: Could not find entity template for blueprint id \'' + blueprintId + '\'.'

				return updateEntity(
					this.blueprints,
					blueprintId,
					deepClone( this.entityTemplates[ blueprintId ] ),
					entityConfig
				)
			},
			hasBlueprint : function( blueprintId ) {
				return !!getBlueprint( this.blueprints, blueprintId )
			},
			getBlueprint : function( blueprintId ) {
				return getBlueprint( this.blueprints, blueprintId )
			},

			/**
			 * Returns true if the component is a single attribute component, false otherwise.
			 *
			 * @param blueprintId - component blueprint id
			 * @return {*}
			 */
			isSingleAttributeComponent : function( blueprintId ) {
				return isSingleAttributeComponent( getBlueprint( this.blueprints, blueprintId, blueprintTypes.BLUEPRINT_TYPE_COMPONENT ).attributes )
			}
		}

		return BlueprintManager
	}
)
