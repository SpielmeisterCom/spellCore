define(
	'spell/shared/util/blueprints/BlueprintManager',
	[
		'spell/shared/util/deepClone',
		'spell/shared/util/blueprints/createLocalComponentName',

		'underscore'
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

		var blueprints = {},
			entityTemplates = {}

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
					var localComponentName = createLocalComponentName( componentConfig.id, componentConfig.importName )

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

			if( !_.include( blueprintTypes, bluePrintType ) ) return false


			if( bluePrintType === blueprintTypes.BLUEPRINT_TYPE_COMPONENT ) {
				return isValidComponentBlueprint( blueprint )
			}

			if( bluePrintType === blueprintTypes.BLUEPRINT_TYPE_ENTITY ) {
				return isValidEntityBlueprint( blueprint )
			}

			return true
		}

		var throwCouldNotFindBlueprint = function( blueprintId, blueprintType ) {
			throw 'Could not find a blueprint with id "' + blueprintId + ( blueprintType ? '" of type ' + blueprintType : '' ) + '.'
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
			if( isSingleAttributeComponent ) {
				for( var property in attributeConfig ) {
					return _.clone( attributeConfig[ property ] )
				}
			}

			return _.extend( component, attributeConfig )
		}

		var createEntityTemplate = function( entityBlueprint ) {
			return _.reduce(
				entityBlueprint.components,
				function( memo, componentConfig ) {
					var componentBlueprintId = componentConfig.id,
						componentBlueprint = getBlueprint( blueprintTypes.BLUEPRINT_TYPE_COMPONENT, componentBlueprintId )

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

		var updateEntity = function( entity, entityConfig ) {
			return _.reduce(
				entityConfig,
				function( memo, componentConfig, componentName ) {
					updateComponent(
						memo[ componentName ],
						componentConfig,
						isSingleAttributeComponent( memo[ componentName ] )
					)

					return memo
				},
				entity
			)
		}

		var addBlueprint = function( definition ) {
			var blueprintId = definition.namespace + '/' + definition.name

			if( _.has( blueprints, blueprintId ) ) throw 'Blueprint definition "' + blueprintId + '" already exists.'


			blueprints[ blueprintId ] = definition

			if( definition.type === blueprintTypes.BLUEPRINT_TYPE_ENTITY ) {
				entityTemplates[ blueprintId ] = createEntityTemplate( definition )
			}
		}

		var getBlueprint = function( blueprintType, blueprintId ) {
			var blueprint = blueprints[ blueprintId ]

			if( !blueprint ||
				blueprint.type !== blueprintType ) {

				throw throwCouldNotFindBlueprint( blueprintId, blueprintType )
			}

			return blueprint
		}

		var isSingleAttributeComponent = function( attributes ) {
			if( !attributes ) throw 'Error: \'attributes\' is of type falsy.'

			return _.size( attributes ) === 1
		}


		/**
		 * public
		 */

		function BlueprintManager() {
		}

		BlueprintManager.prototype = {
			add : function( definition ) {
				if( !definition.type ||
					!isValidDefinition( definition ) ) {

					throw 'The format of the supplied blueprint definition is invalid.'
				}

				addBlueprint( definition )
			},
			createEntity : function( blueprintId, entityConfig ) {
				return updateEntity(
					deepClone( entityTemplates[ blueprintId ] ),
					entityConfig
				)
			},
			hasBlueprint : function( blueprintId ) {
				return _.has( blueprints, blueprintId )
			},
			isSingleAttributeComponent : function( blueprintId ) {
				return isSingleAttributeComponent( getBlueprint( blueprintTypes.BLUEPRINT_TYPE_COMPONENT, blueprintId).attributes )
			}
		}

		return BlueprintManager
	}
)
