define(
	"funkysnakes/client/entities/player",
	[
		"spell/shared/components/input/inputDefinition",
		"spell/shared/components/actor"
	],
	function(
		inputDefinition,
		actor
	) {
		"use strict"


		return function( playerId, leftKey, rightKey, spaceKey ) {
			var keyCodeToActionMapping = [
				{
					keyCode  : leftKey,
					actionId : "left"
				},
				{
					keyCode  : rightKey,
					actionId : "right"
				},
				{
					keyCode  : spaceKey,
					actionId : "useItem"
				}
			]

			this.inputDefinition = new inputDefinition( playerId, keyCodeToActionMapping )
			this.actor = new actor( playerId, [ "left", "right", "useItem" ] )
			this.player = {}
		}
	}
)
