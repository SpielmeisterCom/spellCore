define(
	'spell/config/entity/flatten',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		var flattenEntityConfig = function( entityConfigs ) {
			return _.reduce(
				entityConfigs,
				function( memo, entityConfig ) {
					memo.push( entityConfig )

					return _.has( entityConfig, 'children' ) ?
						memo.concat( flattenEntityConfig( entityConfig.children ) ) :
						memo
				},
				[]
			)
		}

		return function( arg0 ) {
			var entityConfigs = _.isArray( arg0 ) ? arg0 : [ arg0 ]

			return flattenEntityConfig( entityConfigs )
		}
	}
)
