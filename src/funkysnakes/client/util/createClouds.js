define(
	"funkysnakes/client/util/createClouds",
	[
		"funkysnakes/shared/config/constants",

		"spell/shared/util/random/XorShift32",

		"spell/math/vec3"
	],
	function(
		constants,

		XorShift32,

		vec3
	) {
		"use strict"


		var createClouds = function( entityManager, numberOfClouds, baseSpeed, type, pass ) {
			if( type !== "cloud_dark" &&
				type !== "cloud_light" ) {

				throw "Type '" + type + "' is not supported"
			}


			var prng = new XorShift32( 437840 )
			var scaleFactor = 1.0
			var tmp = [ 0, 0, 0 ]


			var fromX  = ( -constants.maxCloudTextureSize ) * scaleFactor
			var fromY  = ( -constants.maxCloudTextureSize ) * scaleFactor
			var untilX = ( constants.maxCloudTextureSize + constants.xSize ) * scaleFactor
			var untilY = ( constants.maxCloudTextureSize + constants.ySize ) * scaleFactor


			for( var i = 0; i < numberOfClouds; i++) {
				var position = [
					prng.nextBetween( fromX, untilX ),
					prng.nextBetween( fromY, untilY ),
					0
				]

				vec3.set( baseSpeed, tmp )
				vec3.scale( tmp, prng.nextBetween( 0.75, 1.0 ) * scaleFactor )

				var index = "_0" + ( 1 + ( i % 6 ) )

				entityManager.createEntity(
					"cloud",
					[ {
						scale     : [ scaleFactor, scaleFactor, 0 ],
						textureId : "environment/" + type + index + ".png",
						pass      : pass,
						speed     : tmp,
						position  : position
					} ]
				)
			}
		}


		return createClouds
	}
)
