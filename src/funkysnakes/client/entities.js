define(
	"funkysnakes/client/entities",
	[
		"funkysnakes/client/entities/arena",
		"funkysnakes/client/entities/cloud",
		"funkysnakes/client/entities/coloredRectangle",
		"funkysnakes/client/entities/head",
		"funkysnakes/client/entities/invincibilityPowerup",
		"funkysnakes/client/entities/shieldPowerup",
		"funkysnakes/client/entities/player",
		"funkysnakes/client/entities/scoreDisplay",
		"funkysnakes/client/entities/speedPowerup",
		"funkysnakes/client/entities/background",
		"funkysnakes/client/entities/widget",
		"funkysnakes/client/entities/widgetThatFades",
		"funkysnakes/shared/entities/game",
		"funkysnakes/client/entities/effect",
        "funkysnakes/client/entities/ui/container",
        "funkysnakes/client/entities/ui/button",
        "funkysnakes/client/entities/ui/label"
	],
	function(
		arena,
		cloud,
		coloredRectangle,
		head,
		invincibilityPowerup,
		shieldPowerup,
		player,
		scoreDisplay,
		speedPowerup,
		background,
		widget,
		widgetThatFades,
		game,
		effect,
        container,
        button,
        label
	) {
		"use strict"


		return {
			"arena"               : arena,
			"cloud"               : cloud,
			"coloredRectangle"    : coloredRectangle,
			"head"                : head,
			"invincibilityPowerup": invincibilityPowerup,
			"shieldPowerup"       : shieldPowerup,
			"player"              : player,
			"scoreDisplay"        : scoreDisplay,
			"speedPowerup"        : speedPowerup,
			"background"          : background,
			"widget"              : widget,
			"widgetThatFades"     : widgetThatFades,

			"game"                : game,
			"effect"              : effect,
            "container"           : container,
            "button"              : button,
            "label"               : label
		}
	}
)
