define(
	'spell/server/util/createMainLoop',
	[
		'spell/Events',
		'spell/Console',
		'spell/shared/util/platform/Types',
		'spell/shared/util/platform/PlatformKit',

		'spell/functions'
	],
	function(
		Events,
		Console,
		Types,
		PlatformKit,

		_
	) {
		'use strict'


		var maxAllowedTimeDifferenceInMs = 20,
			heartBeatIntervalInMs        = 5000,
			lastHeartBeatTimeInMs        = 0,
			console                      = new Console()


		var logHeartbeat = function( localTimeInMs ) {
			if( localTimeInMs - lastHeartBeatTimeInMs < heartBeatIntervalInMs ) return

			lastHeartBeatTimeInMs = localTimeInMs
			console.info( '.' )
		}

		return function(
			eventManager,
			initialRemoteGameTimeInMs
		) {
			var remoteGameTimeInMs   = initialRemoteGameTimeInMs
			var localTimeInMs        = initialRemoteGameTimeInMs
			var previousRealTimeInMs = Types.Time.getCurrentInMs()


			// Since the main loop supports arbitrary update intervals but can't publish events for every possible
			// update interval, we need to maintain a set of all update intervals that subscribers are interested in.
			var updateIntervals = {}

			eventManager.subscribe( Events.SUBSCRIBE, function( scope, subscriber ) {
				if ( scope[ 0 ] === Events.LOGIC_UPDATE ) {
					var interval = scope[ 1 ]
					if ( !updateIntervals.hasOwnProperty( interval ) ) {
						updateIntervals[ interval ] = {
							accumulatedTimeInMs: 0,
							localGameTimeInMs  : localTimeInMs
						}
					}
				}
			} )

			eventManager.subscribe(
				Events.CLOCK_SYNC_ESTABLISHED,
				function( timeInMs ) {
					remoteGameTimeInMs = timeInMs
				}
			)


//			eventManager.subscribe( [ 'clockSyncUpdate' ], function( timeOfUpdate, updatedGameTimeInMs ) {
//				var ageOfUpdate = Types.Time.getCurrentInMs() - timeOfUpdate
//				remoteGameTimeInMs = updatedGameTimeInMs + ageOfUpdate
//			} )

			var timeSpeedFactor = 1.0

			var mainLoop = function() {
				var currentRealTimeInMs = Types.Time.getCurrentInMs()

				var passedTimeInMs = currentRealTimeInMs - previousRealTimeInMs

				previousRealTimeInMs  = currentRealTimeInMs
				remoteGameTimeInMs   += passedTimeInMs
				localTimeInMs        += passedTimeInMs * timeSpeedFactor

				_.each( updateIntervals, function( updateInterval, deltaTimeInMsAsString ) {
					var deltaTimeInMs = parseInt( deltaTimeInMsAsString )

					updateInterval.accumulatedTimeInMs += passedTimeInMs * timeSpeedFactor

					while ( updateInterval.accumulatedTimeInMs > deltaTimeInMs ) {
						// Only simulate, if not too much time has accumulated to prevent CPU overload. This can happen, if
						// the browser tab has been in the background for a while and requestAnimationFrame is used.
						if ( updateInterval.accumulatedTimeInMs <= 5 * deltaTimeInMs ) {
							eventManager.publish(
								[ Events.LOGIC_UPDATE, deltaTimeInMsAsString ],
								[
									updateInterval.localGameTimeInMs,
									deltaTimeInMs / 1000
								]
							)
						}

						updateInterval.accumulatedTimeInMs -= deltaTimeInMs
						updateInterval.localGameTimeInMs   += deltaTimeInMs
					}
				} )


				eventManager.publish( Events.RENDER_UPDATE, [ localTimeInMs, passedTimeInMs ] )


				var localGameTimeDifferenceInMs = remoteGameTimeInMs - localTimeInMs
				if( Math.abs( localGameTimeDifferenceInMs ) > maxAllowedTimeDifferenceInMs ) {
					if( localGameTimeDifferenceInMs > 0 ) {
						timeSpeedFactor = 2
					} else {
						timeSpeedFactor = 0.5
					}

				} else {
					timeSpeedFactor = 1.0
				}


				logHeartbeat( localTimeInMs )

				PlatformKit.callNextFrame( mainLoop )
			}

			return mainLoop
		}
	}
)
