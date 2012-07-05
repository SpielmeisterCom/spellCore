define(
	"funkysnakes/client/systems/debugRenderer",
	[
		"funkysnakes/shared/config/constants",
		"spell/shared/util/color",

		'spell/functions'
	],
	function(
		constants,
		color,

		_
	) {
		"use strict"


		var magicPink = color.createRgb( 1, 0, 1 )
		var green     = color.createRgb( 0, 1, 0 )


		function render(
			timeInMs,
			deltaTimeInMs,
			context,
			entities
		) {
			_.each( entities, function( entity ) {
				context.setFillStyleColor( magicPink )

				context.save()
				{
					context.translate( entity.position )
					context.fillRect( -2, -2, 4, 4 )
				}
				context.restore()

//				// client
//				var pastPositions = entity.body.pastPositions
//
//				_.each( pastPositions, function( position ) {
//					context.save()
//					{
//						context.translate( position )
//						context.fillRect( -2, -2, 4, 4 )
//					}
//					context.restore()
//				} )


//				// server
//				context.setFillStyleColor( green )
//
//				var pastPositions = entity.synchronizationSlave.snapshots[ 1 ].data.entity.body.pastPositions
//
//				_.each( pastPositions, function( position ) {
//					context.save()
//					{
//						context.translate( position )
//						context.fillRect( -2, -2, 4, 4 )
//					}
//					context.restore()
//				} )


//				if( entity.collisionCircle === undefined ) return
//
//
//				var position = entity.position
//				var collisionCircleRadius = entity.collisionCircle.radius
//
//				context.save()
//				{
//					context.beginPath()
//					context.arc( position[0], position[1], collisionCircleRadius, 0, Math.PI * 2, true )
//					context.stroke()
//				}
//				context.restore()
			} )
		}


		return render
	}
)
