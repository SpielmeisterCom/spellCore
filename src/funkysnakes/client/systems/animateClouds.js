define(
	"funkysnakes/client/systems/animateClouds",
	[
		"funkysnakes/shared/config/constants",

		"spell/shared/util/math",

		"glmatrix/vec3",
		'spell/shared/util/platform/underscore'
	],
	function(
		constants,

		math,

		vec3,
		_
	) {
		"use strict"


		var scaleFactor = 1.0
		var fromX  = ( -constants.maxCloudTextureSize ) * scaleFactor
		var fromY  = ( -constants.maxCloudTextureSize ) * scaleFactor
		var untilX = ( constants.maxCloudTextureSize + constants.xSize ) * scaleFactor
		var untilY = ( constants.maxCloudTextureSize + constants.ySize ) * scaleFactor

		var distanceCovered = vec3.create( [ 0, 0, 0 ] )


		var animateClouds = function(
			timeInMs,
			deltaTimeInMs,
			cloudEntities
		) {
			var deltaTimeInS = deltaTimeInMs / 1000

			_.each(
				cloudEntities,
				function( cloud ) {
					vec3.scale( cloud.cloud.speed, deltaTimeInS, distanceCovered )
					vec3.add( cloud.position, distanceCovered )

					if( cloud.position[ 0 ] > untilX ||
						cloud.position[ 0 ] < fromX ) {

						cloud.position[ 0 ] = ( cloud.cloud.speed[ 0 ] > 0 ? fromX : untilX )
					}

					if( cloud.position[ 1 ] > untilY ||
						cloud.position[ 1 ] < fromY ) {

						cloud.position[ 1 ] = ( cloud.cloud.speed[ 1 ] > 0 ? fromY : untilY )
					}
				}
			)
		}


		return animateClouds
	}
)
