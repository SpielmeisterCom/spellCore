define(
	'funkysnakes/server/util/getFreePlayerId',
	[
		'spell/shared/util/platform/underscore'
	],
	function(
		_
	) {
		'use strict'


		/**
		 * Returns the smallest free player id.
		 *
		 * @param playerEntities
		 * @return {*}
		 */
		var getFreePlayerId = function( playerEntities ) {
			var playerIds = _.sortBy(
				_.map(
					playerEntities,
					function( entity ) {
						return entity.player.playerId
					}
				),
				function( playerId ) {
					return playerId
				}
			)

			return _.reduce(
				playerIds,
				function( memo, iter ) {
					return ( memo === iter ? ++memo : memo )
				},
				0
			)
		}

		return getFreePlayerId
	}
)
