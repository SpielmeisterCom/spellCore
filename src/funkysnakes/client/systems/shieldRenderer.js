define(
	"funkysnakes/client/systems/shieldRenderer",
	[
		"funkysnakes/shared/config/constants",

		"spell/math/vec3",
		"spell/math/mat4",
		'spell/shared/util/platform/underscore'
	],
	function(
		constants,

		vec3,
		mat4,
		_
	) {
		"use strict"


		function render(
			timeInMs,
			textures,
			context,
			shieldEntities
		) {
			var maxShieldLifetime = constants.shieldLifetime
			var timeInS = timeInMs / 1000
			var scaleMagnitude = 0.04
			var scaleFrequency = Math.PI * 2 * 1.5

			_.each( shieldEntities, function( entity ) {
				var dynamicScaleFactor = 1 - scaleMagnitude + Math.cos( timeInS * scaleFrequency ) * scaleMagnitude,
					dynamicAlphaFactor = 1.0,
					entityRenderData   = entity.renderData


				if( entity.shield.state === "activated" ) {
					var ageInSeconds = maxShieldLifetime - entity.shield.lifetime

					// ((x/-3) + 1) + (x/3) * (cos(x * 30) + 1) / 2
					dynamicAlphaFactor = ( ( ageInSeconds / -maxShieldLifetime ) + 1 ) + ( ageInSeconds / maxShieldLifetime ) * ( Math.cos ( ageInSeconds * 30 ) + 1 ) / 2
				}

				context.save()
				{
					var textureId = "effects/shield.png"
					var shieldTexture = textures[ textureId ]

					context.setGlobalAlpha( dynamicAlphaFactor )

					// object to world space transformation go here
					context.translate( entityRenderData.position )
					context.rotate( entityRenderData.orientation )

					// "appearance" transformations go here
					context.scale( [ shieldTexture.width * dynamicScaleFactor, shieldTexture.height * dynamicScaleFactor, 1 ] )
					context.translate( [ -0.5, -0.5, 0 ] )

					context.drawTexture( shieldTexture, 0, 0, 1, 1 )
				}
				context.restore()
			} )
		}


		return render
	}
)
