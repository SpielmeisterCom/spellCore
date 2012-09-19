define(
	'spell/shared/util/template/applyComponentConfig',
	[
		'spell/functions'
	],
	function(
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
						attributeConfig
					)

					return entity
				},
				entity
			)
		}

		return applyComponentConfig
	}
)
