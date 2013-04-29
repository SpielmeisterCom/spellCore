define(
	'spell/config/entity/applyEntityConfig',
	[
		'spell/shared/util/deepClone',

		'spell/functions'
	],
	function(
		deepClone,

		_
	) {
		'use strict'


		/**
		 * Applies a an entity configuration to an entity and returns the updated entity. Attribute instances are copied by reference.
		 *
		 * @param entity
		 * @param entityConfig
		 * @return {*}
		 */
		var applyEntityConfig = function( entity, entityConfig ) {
			for( var componentId in entityConfig ) {
				entity[ componentId ] = _.extend(
					entity[ componentId ] || {},
					deepClone( entityConfig[ componentId ] )
				)
			}

			return entity
		}

		return applyEntityConfig
	}
)
