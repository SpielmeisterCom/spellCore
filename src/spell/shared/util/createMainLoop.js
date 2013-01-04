define(
	'spell/shared/util/createMainLoop',
	[
		'spell/Events',
		'spell/shared/util/StopWatch',
		'spell/shared/util/Timer',
		'spell/shared/util/platform/Types',
		'spell/shared/util/platform/PlatformKit',

		'spell/functions'
	],
	function(
		Events,
		StopWatch,
		Timer,
		Types,
		PlatformKit,

		_
	) {
		'use strict'


		var UPDATE_INTERVAL_IN_MS  = 16,
			MAX_ELAPSED_TIME_IN_MS = 100,
			PERFORMANCE_PRINT_INTERVAL_IN_MS = 1000

		var printSeriesInfo = function( seriesId, seriesInfo ) {
			if( !seriesInfo ) return

			console.log( seriesId + ': ' + seriesInfo.avg + '/' + seriesInfo.min + '/' + seriesInfo.max + '/' + seriesInfo.deviation )
//			trace( seriesId + ': ' + seriesInfo.avg + '/' + seriesInfo.min + '/' + seriesInfo.max + '/' + seriesInfo.deviation )
		}


		var MainLoop = function( eventManager, statisticsManager, updateIntervalInMs ) {
			this.updateIntervalInMs  = updateIntervalInMs || UPDATE_INTERVAL_IN_MS
			this.render              = null
			this.update              = null
			this.preNextFrame        = null
			this.accumulatedTimeInMs = this.updateIntervalInMs

			// Until the proper remote game time is computed local time will have to do.
			var initialLocalGameTimeInMs = Types.Time.getCurrentInMs()
			this.timer = new Timer( eventManager, statisticsManager, initialLocalGameTimeInMs )

			this.timeSinceLastPerfPrintInMs = 0
			this.statisticsManager = statisticsManager
			this.stopWatch         = new StopWatch()
			this.totalStopWatch    = new StopWatch()
		}

		MainLoop.prototype = {
			setRenderCallback : function( f ) {
				this.render = f
			},
			setUpdateCallback : function( f ) {
				this.update = f
			},
			setPreNextFrame: function( f ) {
				this.preNextFrame = f
			},
			callEveryFrame : function( currentTimeInMs ) {
				if( this.preNextFrame ) {
					this.preNextFrame()
					this.preNextFrame = null
				}

				var statisticsManager = this.statisticsManager

				this.totalStopWatch.start()
				statisticsManager.startTick()

				var timer = this.timer
				timer.update()

				var updateIntervalInMs = this.updateIntervalInMs,
					localTimeInMs      = timer.getLocalTime(),
					elapsedTimeInMs    = Math.min( timer.getElapsedTime(), MAX_ELAPSED_TIME_IN_MS )

				if( this.update ) {
					this.stopWatch.start()

					var accumulatedTimeInMs = this.accumulatedTimeInMs + elapsedTimeInMs

					while( accumulatedTimeInMs >= updateIntervalInMs ) {
						this.update( localTimeInMs, updateIntervalInMs )

						accumulatedTimeInMs -= updateIntervalInMs
					}

					this.accumulatedTimeInMs = accumulatedTimeInMs

					statisticsManager.updateSeries( 'update', this.stopWatch.stop() )
				}

				if( this.render ) {
					this.stopWatch.start()

					this.render( localTimeInMs, elapsedTimeInMs )

					statisticsManager.updateSeries( 'render', this.stopWatch.stop() )
				}

				statisticsManager.updateSeries( 'total', this.totalStopWatch.stop() )


				// print performance statistics
				if( this.timeSinceLastPerfPrintInMs > PERFORMANCE_PRINT_INTERVAL_IN_MS ) {
					this.timeSinceLastPerfPrintInMs -= PERFORMANCE_PRINT_INTERVAL_IN_MS

					printSeriesInfo( 'update', statisticsManager.getSeriesInfo( 'update', 60 ) )
					printSeriesInfo( 'superkumba.system.physics', statisticsManager.getSeriesInfo( 'superkumba.system.physics', 60 ) )
					printSeriesInfo( 'render', statisticsManager.getSeriesInfo( 'render', 60 ) )
					printSeriesInfo( 'total', statisticsManager.getSeriesInfo( 'total', 60 ) )
					console.log( '' )
//					trace( '' )
				}

				this.timeSinceLastPerfPrintInMs += elapsedTimeInMs


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
