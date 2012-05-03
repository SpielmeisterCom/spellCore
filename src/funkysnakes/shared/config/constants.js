define(
	'funkysnakes/shared/config/constants',
	function() {
		return {
			// viewport dimensions in logical units
			xSize: 1024,
			ySize: 768,

			// screen size
			minWidth : 640,
			minHeight : 480,
			maxWidth : 1024,
			maxHeight : 768,

			// playing field border
			left  : 82,
			right : 942,
			top   : 668,
			bottom: 100,

			// ship
			minSpeedPerSecond : 80,
			maxSpeedPerSecond : 390,
			speedPerSecond    : 130,
			speedPowerupBonus : 50,

			interpolationDelay: 100,

			// tail
			pastPositionsDistance: 10,
			tailElementDistance  : 30,
			distanceTailToShip   : 35,

			// shield
			shieldLifetime: 2.0, // in seconds

			// misc
			maxCloudTextureSize: 512,
			maxNumberPlayers: 4
		}
	}
)
