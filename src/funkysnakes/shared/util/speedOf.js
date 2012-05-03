define(
	"funkysnakes/shared/util/speedOf",
	[
		"funkysnakes/shared/config/constants",
		"spell/shared/util/math"
	],
	function(
		constants,
		math
	) {
		"use strict"


		return function( head ) {
			return math.clamp(
				constants.speedPerSecond + head.head.speedBonus - ( head.amountTailElements.value * 3 ),
				constants.minSpeedPerSecond,
				constants.maxSpeedPerSecond
			)
		}
	}
)
