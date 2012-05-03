define(
	'funkysnakes/client/entities/coloredRectangle',
	[
		'funkysnakes/client/components/appearance',
		'funkysnakes/shared/components/position',
		'funkysnakes/client/components/renderData'
	],
	function(
		appearance,
		position,
		renderData
	) {
		'use strict'


		return function( args ) {
			this.appearance = new appearance( args.appearance )
			this.position   = new position( args.position )
			this.renderData = new renderData( {} )
		}
	}
)
