define(
	'spell/shared/util/createMainLoop',
	[
		'spell/data/Tree',
		'spell/shared/util/StopWatch',
		'spell/shared/util/Timer',
		'spell/shared/util/platform/Types',
		'spell/shared/util/platform/PlatformKit',

		'spell/functions'
	],
	function(
		Tree,
		StopWatch,
		Timer,
		Types,
		PlatformKit,

		_
	) {
		'use strict'


		var UPDATE_INTERVAL_IN_MS  = 32,
			MAX_ELAPSED_TIME_IN_MS = 100,
			PERFORMANCE_PRINT_INTERVAL_IN_MS = 10000

		var eachNode = Tree.eachNode

		var indent = function( n ) {
			var result = ''

			while( n-- ) {
				result += ' '
			}

			return result
		}

		var createMetricsMessage = function( tree ) {
			var message = ''

			eachNode(
				tree,
				function( node, depth ) {
					var metrics = node.metrics

					message += indent( depth ) + node.id + ': ' + metrics[ 0 ] + '/' + metrics[ 1 ] + '/' + metrics[ 2 ] + '/' + metrics[ 3 ] + '\n'
				}
			)

			return message
		}

		var callEveryFrameRelease = function( currentTimeInMs ) {
			if( this.preNextFrame.length > 0 ) {
				this.preNextFrame.pop()()
			}

			var timer = this.timer

			timer.update()

			var updateIntervalInMs = this.updateIntervalInMs,
				localTimeInMs      = timer.getLocalTime(),
				elapsedTimeInMs    = Math.min( timer.getElapsedTime(), MAX_ELAPSED_TIME_IN_MS )

			if( this.update ) {
				var accumulatedTimeInMs = this.accumulatedTimeInMs + elapsedTimeInMs

				while( accumulatedTimeInMs >= updateIntervalInMs ) {
					this.update( localTimeInMs, updateIntervalInMs )

					accumulatedTimeInMs -= updateIntervalInMs
				}

				this.accumulatedTimeInMs = accumulatedTimeInMs
			}

			if( this.render ) {
				this.render( localTimeInMs, elapsedTimeInMs )
			}

			PlatformKit.callNextFrame( this.callEveryFramePartial )
		}

		var callEveryFrameDebug = function( currentTimeInMs ) {
			if( this.preNextFrame.length > 0 ) {
				this.preNextFrame.pop()()
			}

			var statisticsManager = this.statisticsManager,
				timer             = this.timer

			timer.update()

			var updateIntervalInMs = this.updateIntervalInMs,
				localTimeInMs      = timer.getLocalTime(),
				elapsedTimeInMs    = Math.min( timer.getElapsedTime(), MAX_ELAPSED_TIME_IN_MS )

			this.totalStopWatch.start()
			statisticsManager.startTick( localTimeInMs, elapsedTimeInMs )

			if( this.update ) {
				this.stopWatch.start()

				var accumulatedTimeInMs = this.accumulatedTimeInMs + elapsedTimeInMs

				while( accumulatedTimeInMs >= updateIntervalInMs ) {
					this.update( localTimeInMs, updateIntervalInMs )

					accumulatedTimeInMs -= updateIntervalInMs
				}

				this.accumulatedTimeInMs = accumulatedTimeInMs

				statisticsManager.updateNode( 'update', this.stopWatch.stop() )
			}

			if( this.render ) {
				this.stopWatch.start()

				this.render( localTimeInMs, elapsedTimeInMs )

				statisticsManager.updateNode( 'render', this.stopWatch.stop() )
			}

			statisticsManager.updateNode( 'total', this.totalStopWatch.stop() )

			// print performance statistics
			if( this.timeSinceLastPerfPrintInMs > PERFORMANCE_PRINT_INTERVAL_IN_MS ) {
				this.timeSinceLastPerfPrintInMs -= PERFORMANCE_PRINT_INTERVAL_IN_MS

//				console.log(
//					createMetricsMessage( statisticsManager.getMetrics( PERFORMANCE_PRINT_INTERVAL_IN_MS ) )
//				)
			}

			this.timeSinceLastPerfPrintInMs += elapsedTimeInMs

			PlatformKit.callNextFrame( this.callEveryFramePartial )
		}


		var MainLoop = function( eventManager, statisticsManager, isDebug, updateIntervalInMs ) {
			this.isDebug             = isDebug
			this.updateIntervalInMs  = updateIntervalInMs || UPDATE_INTERVAL_IN_MS
			this.render              = null
			this.update              = null
			this.preNextFrame        = []
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
				this.preNextFrame.push( f )
			},
			run : function() {
				this.callEveryFramePartial = _.bind( this.isDebug ? callEveryFrameDebug : callEveryFrameRelease, this )
				this.callEveryFramePartial( Types.Time.getCurrentInMs() )
			}
		}

		return function( eventManager, statisticsManager, isDebug, updateInterval ) {
			return new MainLoop( eventManager, statisticsManager, isDebug, updateInterval )
		}
	}
)
