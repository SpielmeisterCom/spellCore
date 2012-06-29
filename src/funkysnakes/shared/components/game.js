define(
	"funkysnakes/shared/components/game",
	function() {
		"use strict"


		return function( args ) {
			this.id         = args.id
			this.hasChanged = true
			this.name       = args.name
			this.players    = []
			this.start      = false

			/*
			 * waitingForStart, running
			 * @type {String}
			 */
			this.state = 'waitingForStart'
		}
	}
)
