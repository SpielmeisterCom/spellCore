define(
	"funkysnakes/client/systems/fade",
	[
		"spell/math/vec3",
		'spell/shared/util/platform/underscore'
	],
	function(
		vec3,
		_
	) {
		"use strict"


		function fade(
			timeInMs,
			deltaTimeInMs,
			entityManager,
			fadeEntities
		) {
			_.each(
				fadeEntities,
				function( entity ) {
					var fade = entity.fade
					fade.age += deltaTimeInMs

					if( fade.age < fade.beginAfter ) return

					var delta = ( fade.age - fade.beginAfter ) / fade.duration

					if( delta > 1.0 ) {
						entity.renderData.opacity = fade.end
						entityManager.removeComponent( entity, 'fade' )

						return
					}

					entity.renderData.opacity = fade.start + delta * ( fade.end - fade.start )
				}
			)
		}

		return fade
	}
)
