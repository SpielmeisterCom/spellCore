define(
	'spell/shared/components/actor',
	[
		'spell/shared/util/platform/underscore'
	],
	function(
		_
	) {
		'use strict'


		return function( id, actionIds ) {
			this.id      = id
			this.actions = _.reduce(
				actionIds,
				function( memo, iter ) {
					memo[ iter ] = {
						executing : false,
						needSync  : false
					}

					return memo
				},
				{}
			)
		}
	}
)
