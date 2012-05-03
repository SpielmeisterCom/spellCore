define(
	"funkysnakes/server/entities",
	[
		"funkysnakes/server/entities/head",
		"funkysnakes/server/entities/invincibilityPowerup",
		"funkysnakes/server/entities/shieldPowerup",
		"funkysnakes/server/entities/player",
		"funkysnakes/server/entities/speedPowerup",
		"funkysnakes/server/entities/effect",
		"funkysnakes/shared/entities/game"
	],
	function(
		head,
		invincibilityPowerup,
		shieldPowerup,
		player,
		speedPowerup,
		effect,
		game
	) {
		"use strict"


		return {
			"game"                : game,
			"head"                : head,
			"invincibilityPowerup": invincibilityPowerup,
			"shieldPowerup"       : shieldPowerup,
			"player"              : player,
			"speedPowerup"        : speedPowerup,
			"effect"              : effect
		}
	}
)
