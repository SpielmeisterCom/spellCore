define(
	'spell/shared/util/createMainLoop',
	[
		'spell/shared/util/Events',
		'spell/shared/util/Timer',
		'spell/shared/util/platform/Types',
		'spell/shared/util/platform/PlatformKit',

		'spell/shared/util/platform/underscore'
	],
	function(
		Events,
		Timer,
		Types,
		PlatformKit,

		_
	) {
		'use strict'


		/**
		 * private
		 */

		var allowedDeltaInMs = 20,
			DEFAULT_UPDATE_INTERVAL_IN_MS = 20


		var MainLoop = function( eventManager, statisticsManager, updateIntervalInMs ) {
			this.updateIntervalInMs  = updateIntervalInMs || DEFAULT_UPDATE_INTERVAL_IN_MS
			this.renderCallback      = null
			this.updateCallback      = null
			this.accumulatedTimeInMs = 0

			// Until the proper remote game time is computed local time will have to do.
			var initialLocalGameTimeInMs = Types.Time.getCurrentInMs()
			this.timer = new Timer( eventManager, statisticsManager, initialLocalGameTimeInMs )
		}

		MainLoop.prototype = {
			setRenderCallback : function( f ) {
				this.renderCallback = f
			},
			setUpdateCallback : function( f ) {
				this.updateCallback = f
			},
			run : function() {
				var timer = this.timer
				timer.update()

				var clockSpeedFactor    = 1.0,
					localTimeInMs       = timer.getLocalTime(),
					elapsedTimeInMs     = timer.getElapsedTime(),
					accumulatedTimeInMs = this.accumulatedTimeInMs + elapsedTimeInMs * clockSpeedFactor,
					updateIntervalInMs  = this.updateIntervalInMs

				if( this.updateCallback ) {
					/**
					 * Only simulate, if not too much time has accumulated to prevent CPU overload. This can happen when the browser tab has been in the
					 * background for a while and requestAnimationFrame is used.
					 */
					while( accumulatedTimeInMs > updateIntervalInMs ) {
						if( accumulatedTimeInMs <= 5 * updateIntervalInMs ) {
							this.updateCallback( localTimeInMs, updateIntervalInMs )
						}

						accumulatedTimeInMs -= updateIntervalInMs
						localTimeInMs += updateIntervalInMs
					}
				}

				if( this.renderCallback ) {
					this.renderCallback( localTimeInMs, elapsedTimeInMs )
				}

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

				PlatformKit.callNextFrame(
					_.bind( this.run, this )
				)
			}
		}


		/**
		 * public
		 */

		return function( eventManager, statisticsManager, updateInterval ) {
			return new MainLoop( eventManager, statisticsManager, updateInterval )
		}
	}
)
