define(
	"funkysnakes/shared/config/players",
	[
		"funkysnakes/shared/config/constants",

		"spell/shared/util/input/keyCodes"
	],
	function(
		constants,

		keyCodes
	) {
		"use strict"


		return [
			{
				headTextureId          : "vehicles/ship_player1.png",
				bodyTextureId          : "items/player1_container.png",
				speedTextureId         : "vehicles/ship_player1_speed.png",
				invincibilityTextureId : "vehicles/ship_player1_invincible.png",

				scoreColor: "rgb( 0, 0, 255 )",

				leftKey : keyCodes[ "left arrow" ],
				rightKey: keyCodes[ "right arrow" ],
				useKey  : keyCodes[ "space" ],

				scoreDisplayPosition: [ 5, 20, 0 ],

				startX          : constants.xSize / 4,
				startY          : constants.ySize / 4 * 3,
				startOrientation: Math.PI / 2
			},

			{
				headTextureId          : "vehicles/ship_player2.png",
				bodyTextureId          : "items/player2_container.png",
				speedTextureId         : "vehicles/ship_player2_speed.png",
				invincibilityTextureId : "vehicles/ship_player2_invincible.png",

				scoreColor: "rgb( 0, 255, 0 )",

				leftKey : keyCodes[ "y" ],
				rightKey: keyCodes[ "x" ],

				scoreDisplayPosition: [ 155, 20, 0 ],

				startX          : constants.xSize / 4 * 3,
				startY          : constants.ySize / 4,
				startOrientation: -Math.PI / 2
			},

			{
				headTextureId          : "vehicles/ship_player3.png",
				bodyTextureId          : "items/player3_container.png",
				speedTextureId         : "vehicles/ship_player3_speed.png",
				invincibilityTextureId : "vehicles/ship_player3_invincible.png",

				scoreColor: "rgb( 255, 0, 0 )",

				leftKey : keyCodes[ "n" ],
				rightKey: keyCodes[ "m" ],

				scoreDisplayPosition: [ 305, 20, 0 ],

				startX          : constants.xSize / 4,
				startY          : constants.ySize / 4,
				startOrientation: 0
			},

			{
				headTextureId          : "vehicles/ship_player4.png",
				bodyTextureId          : "items/player4_container.png",
				speedTextureId         : "vehicles/ship_player4_speed.png",
				invincibilityTextureId : "vehicles/ship_player4_invincible.png",

				scoreColor: "rgb( 236, 187, 93 )",

				leftKey : keyCodes[ "1" ],
				rightKey: keyCodes[ "q" ],

				scoreDisplayPosition: [ 455, 20, 0 ],

				startX          : constants.xSize / 4 * 3,
				startY          : constants.ySize / 4 * 3,
				startOrientation: Math.PI
			}
		]
	}
)
