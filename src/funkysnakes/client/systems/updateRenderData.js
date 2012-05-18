define(
	"funkysnakes/client/systems/updateRenderData",
	[
		'spell/shared/util/platform/underscore'
	],
	function(
		_
	) {
		"use strict"


		return function(
			entities
		) {
			_.each( entities, function( entity ) {
				entity.renderData.position = _.clone( entity.position )
				if ( entity.orientation ) {
					entity.renderData.orientation = entity.orientation.angle
				}
				else {
					entity.renderData.orientation = 0
				}
			} )
		}
	}
)
