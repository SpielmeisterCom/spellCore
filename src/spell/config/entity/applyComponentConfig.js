define(
	'spell/config/entity/applyComponentConfig',
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
		 * Applies a component config to an entity and returns the configured entity. Attribute instances are copied by reference.
		 *
		 * @param entity
		 * @param componentConfig
		 * @return {*}
		 */
		var applyComponentConfig = function( entity, componentConfig ) {
			return _.reduce(
				componentConfig,
				function( entity, attributeConfig, componentId ) {
					entity[ componentId ] = _.extend(
						entity[ componentId ] || {},
						deepClone( attributeConfig )
					)

					return entity
				},
				entity
			)
		}

		return applyComponentConfig
	}
)
