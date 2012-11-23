define(
	'spell/shared/util/createMainLoop',
	[
		'spell/shared/util/Events',
		'spell/shared/util/Timer',
		'spell/shared/util/platform/Types',
		'spell/shared/util/platform/PlatformKit',

		'spell/functions'
	],
	function(
		Events,
		Timer,
		Types,
		PlatformKit,

		_
	) {
		'use strict'


		var UPDATE_INTERVAL_IN_MS  = 33,
			MAX_ELAPSED_TIME_IN_MS = 100

		var MainLoop = function( eventManager, statisticsManager, updateIntervalInMs ) {
			this.updateIntervalInMs  = updateIntervalInMs || UPDATE_INTERVAL_IN_MS
			this.renderCallback      = null
			this.updateCallback      = null
			this.accumulatedTimeInMs = this.updateIntervalInMs

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
			callEveryFrame : function( currentTimeInMs ) {
				var timer = this.timer

				timer.update()

				var updateIntervalInMs  = this.updateIntervalInMs,
					localTimeInMs       = timer.getLocalTime(),
					elapsedTimeInMs     = Math.min( timer.getElapsedTime(), MAX_ELAPSED_TIME_IN_MS )

				if( this.updateCallback ) {
					var accumulatedTimeInMs = this.accumulatedTimeInMs + elapsedTimeInMs

					while( accumulatedTimeInMs >= updateIntervalInMs ) {
						this.updateCallback( localTimeInMs, updateIntervalInMs )

						accumulatedTimeInMs -= updateIntervalInMs
					}

					this.accumulatedTimeInMs = accumulatedTimeInMs
				}

				if( this.renderCallback ) {
					this.renderCallback( localTimeInMs, elapsedTimeInMs )
				}

				PlatformKit.callNextFrame( this.callEveryFramePartial )
			},
			run : function() {
				this.callEveryFramePartial = _.bind( this.callEveryFrame, this )
				this.callEveryFramePartial( Types.Time.getCurrentInMs() )
			}
		}


		/*
		 * public
		 */

		return function( eventManager, statisticsManager, updateInterval ) {
			return new MainLoop( eventManager, statisticsManager, updateInterval )
		}
	}
)
