define(
	"spell/client/util/network/initializeClockSync",
	[
		"spell/shared/util/Events",
		"spell/shared/util/platform/Types",
		"spell/shared/util/platform/PlatformKit",
		"spell/shared/util/CircularBuffer",

		'spell/functions'
	],
	function(
		Events,
		Types,
		PlatformKit,
		CircularBuffer,

		_
	) {
		"use strict"


		var HIGH_SYNC_FREQUENCY = 4
		var MEDIUM_SYNC_FREQUENCY = 2
		var LOW_SYNC_FREQUENCY = 1

		/*
		 * the minimum number of performed clock synchronization round trips until clock synchronization is established
		 */
		var minNumberOfClockSyncRoundTrips = 5

		/*
		 * the frequency at which clock synchronization is performed
		 */
		var synchronizationFrequency = HIGH_SYNC_FREQUENCY

		/*
		 * the number of measurements the computation is based on
		 */
		var numberOfOneWayLatencyMeasurements = 5

		var initialSynchronization = true


		function initializeClockSync( eventManager, statisticsManager, connection ) {
			statisticsManager.addSeries( 'ping', 'ms' )
			statisticsManager.addSeries( 'currentTime', 'ms' )
			statisticsManager.addSeries( 'sendTimeInMs', 'ms' )

			var currentUpdateNumber = 1
			var oneWayLatenciesInMs = new CircularBuffer( numberOfOneWayLatencyMeasurements )

			connection.handlers[ "clockSync" ] = function( messageType, messageData ) {
				var currentTimeInMs            = Types.Time.getCurrentInMs()
				var sendTimeInMs               = messageData.clientTime
				var roundTripLatencyInMs       = currentTimeInMs - sendTimeInMs
				var estimatedOneWayLatencyInMs = roundTripLatencyInMs / 2

				statisticsManager.updateSeries( "ping", roundTripLatencyInMs )
				statisticsManager.updateSeries( "currentTime", currentTimeInMs % 2000 )
				statisticsManager.updateSeries( "sendTimeInMs", sendTimeInMs % 2000 )


				oneWayLatenciesInMs.push( estimatedOneWayLatencyInMs )
				var computedServerTimeInMs = computeServerTimeInMs( oneWayLatenciesInMs.toArray(), messageData.serverTime )


				if( currentUpdateNumber === minNumberOfClockSyncRoundTrips ) {
					eventManager.publish( Events.CLOCK_SYNC_ESTABLISHED, [ computedServerTimeInMs ] )

					initialSynchronization = false

				} else {
//					eventManager.publish( "clockSyncUpdate", [ computedServerTimeInMs ] )
				}

				currentUpdateNumber++
			}

			var sendClockSyncMessage = function() {
				// TODO: figure out how to perform continuous clock synchronization that is not harmful
				if( !initialSynchronization ) return

				connection.send(
					"clockSync",
					{
						clientTime: Types.Time.getCurrentInMs()
					}
				)

				PlatformKit.registerTimer( sendClockSyncMessage, 1000 / synchronizationFrequency )
			}

			sendClockSyncMessage()
		}


		function computeSynchronizationFrequency( standardDeviationInMs ) {
			if( initialSynchronization ) {
				return HIGH_SYNC_FREQUENCY
			}

			if( standardDeviationInMs > 25 ) {
				return HIGH_SYNC_FREQUENCY

			} else if( standardDeviationInMs > 10 ) {
				return MEDIUM_SYNC_FREQUENCY

			} else {
				return LOW_SYNC_FREQUENCY
			}
		}


		function computeServerTimeInMs( oneWayLatenciesInMs, serverTimeInMs ) {
			oneWayLatenciesInMs.sort( function( a, b ) {
				return a - b
			} )

			var medianLatencyInMs
			if( oneWayLatenciesInMs.length % 2 === 0 ) {
				var a = oneWayLatenciesInMs[ oneWayLatenciesInMs.length / 2 - 1 ]
				var b = oneWayLatenciesInMs[ oneWayLatenciesInMs.length / 2     ]

				medianLatencyInMs = ( a + b ) / 2

			} else {
				medianLatencyInMs = oneWayLatenciesInMs[ Math.floor( oneWayLatenciesInMs.length / 2 ) ]
			}

			var meanLatencyInMs = _.reduce(
				oneWayLatenciesInMs,
				function( a, b ) {
					return a + b
				},
				0
			) / oneWayLatenciesInMs.length

			var varianceInMsSquared = _.reduce(
				oneWayLatenciesInMs,
				function( memo, latencyInMs ) {
					return memo + Math.pow( latencyInMs - meanLatencyInMs, 2 )
				},
				0
			)

			var standardDeviationInMs = Math.sqrt( varianceInMsSquared )

			synchronizationFrequency = computeSynchronizationFrequency( standardDeviationInMs )

			var significantOneWayLatenciesInMs = _.filter(
				oneWayLatenciesInMs,
				function( latencyInMs ) {
					return latencyInMs <= medianLatencyInMs + standardDeviationInMs
				}
			)

			var meanSignificantOneWayLatencyInMs = _.reduce(
				significantOneWayLatenciesInMs,
				function( a, b ) {
					return a + b
				},
				0
			) / significantOneWayLatenciesInMs.length

			return Math.floor( serverTimeInMs + meanSignificantOneWayLatencyInMs )
		}


		return initializeClockSync
	}
)
