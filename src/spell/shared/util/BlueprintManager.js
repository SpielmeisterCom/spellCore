define(
	'spell/shared/util/BlueprintManager',
	[
		'underscore'
	],
	function(
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


		var blueprints = {}

		var isValidDefinition = function( blueprintType ) {
			return _.include( blueprintTypes, blueprintType )
		}

		var hasBlueprintDefinition = function( blueprintId ) {
			return _.has( blueprints, blueprintId )
		}

		var throwCouldNotFindBlueprint = function( blueprintId, blueprintType ) {
			throw 'Could not find a blueprint with id ' + blueprintId + ( blueprintType ? ' of type ' + blueprintType : '' ) + '.'
		}

		var addBlueprint = function( definition ) {
			if( _.has( blueprints, definition.type ) ) throw 'Blueprint definition ' + definition.type + ' already exists.'

			blueprints[ definition.namespace + '/' + definition.name ] = definition
		}

		var getBlueprint = function( blueprintType, blueprintId ) {
			var blueprint = blueprints[ blueprintId ]

			if( !blueprint ||
				blueprint.type !== blueprintType ) {

				throw throwCouldNotFindBlueprint( blueprintId, blueprintType )
			}

			return blueprint
		}


		/**
		 * public
		 */

		function BlueprintManager() {
		}

		BlueprintManager.prototype = {
			add : function( definition ) {
				if( !definition.type &&
					!isValidDefinition( definition.type ) ) {

					throw 'The format of the supplied blueprint definition is invalid.'
				}

				addBlueprint( definition )
			},
			createEntity : function( blueprintId, entityConfig ) {
				var blueprint = getBlueprint( blueprintTypes.BLUEPRINT_TYPE_ENTITY, blueprintId )

				if( !blueprint ) throwCouldNotFindBlueprint( blueprintId )

				return _.reduce(
					blueprint.components,
					function( memo, componentConfig ) {
						var componentId = componentConfig.id
						memo[ componentId ] = componentConfig

						return memo
					},
					{}
				)
			},
			createComponent : function( blueprintId, config ) {
			}
		}

		return BlueprintManager
	}
)
