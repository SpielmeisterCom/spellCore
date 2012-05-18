define(
	"funkysnakes/shared/util/createMainLoop",
	[
		"spell/shared/util/Events",
		"spell/shared/util/Timer",
		"spell/shared/util/platform/Types",
		"spell/shared/util/platform/PlatformKit",

		'spell/shared/util/platform/underscore'
	],
	function(
		Events,
		Timer,
		Types,
		PlatformKit,

		_
	) {
		"use strict"


		var allowedDeltaInMs = 20


		return function(
			eventManager,
			statisticsManager
		) {
			// Until the proper remote game time is computed local time will have to do.
			var initialLocalGameTimeInMs = Types.Time.getCurrentInMs(),
				timer                    = new Timer( eventManager, statisticsManager, initialLocalGameTimeInMs ),
				localTimeInMs            = initialLocalGameTimeInMs

			// Since the main loop supports arbitrary update intervals but can't publish events for every possible
			// update interval, we need to maintain a set of all update intervals that subscribers are interested in.
			var updateIntervals = {}

			eventManager.subscribe(
				Events.SUBSCRIBE,
				function( scope, subscriber ) {
					if( scope[ 0 ] !== Events.LOGIC_UPDATE ) return

					var interval = scope[ 1 ]

					if( updateIntervals.hasOwnProperty( interval ) ) return

					updateIntervals[ interval ] = {
						accumulatedTimeInMs : 0,
						localTimeInMs       : localTimeInMs
					}
				}
			)

			var clockSpeedFactor, elapsedTimeInMs
			clockSpeedFactor = 1.0

			var mainLoop = function() {
				timer.update()
				localTimeInMs   = timer.getLocalTime()
				elapsedTimeInMs = timer.getElapsedTime()

				_.each(
					updateIntervals,
					function( updateInterval, deltaTimeInMsAsString ) {
						var deltaTimeInMs = parseInt( deltaTimeInMsAsString )

						updateInterval.accumulatedTimeInMs += elapsedTimeInMs * clockSpeedFactor

						while( updateInterval.accumulatedTimeInMs > deltaTimeInMs ) {
							// Only simulate, if not too much time has accumulated to prevent CPU overload. This can happen, if
							// the browser tab has been in the background for a while and requestAnimationFrame is used.
							if( updateInterval.accumulatedTimeInMs <= 5 * deltaTimeInMs ) {
								eventManager.publish(
									[ Events.LOGIC_UPDATE, deltaTimeInMsAsString ],
									[ updateInterval.localTimeInMs, deltaTimeInMs / 1000 ]
								)
							}

							updateInterval.accumulatedTimeInMs -= deltaTimeInMs
							updateInterval.localTimeInMs   += deltaTimeInMs
						}
					}
				)


				eventManager.publish( Events.RENDER_UPDATE, [ localTimeInMs, elapsedTimeInMs ] )


//				var localGameTimeDeltaInMs = timer.getRemoteTime() - localTimeInMs
//
//				if( Math.abs( localGameTimeDeltaInMs ) > allowedDeltaInMs ) {
//					if( localGameTimeDeltaInMs > 0 ) {
//						clockSpeedFactor = 1.25
//
//					} else {
//						clockSpeedFactor = 0.25
//					}
//
//				} else {
//					clockSpeedFactor = 1.0
//				}

				PlatformKit.callNextFrame( mainLoop )
			}

			return mainLoop
		}
	}
)
