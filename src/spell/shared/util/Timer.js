define(
	'spell/shared/util/Timer',
	[
		'spell/shared/util/Events',
		'spell/shared/util/platform/Types',

		'spell/functions'
	],
	function(
		Events,
		Types,

		_
	) {
		'use strict'


		/*
		 * private
		 */

//		var checkTimeWarp = function( newRemoteTime, updatedRemoteTime ) {
//			if( updatedRemoteTime > newRemoteTime ) return
//
//			var tmp = newRemoteTime - updatedRemoteTime
//			console.log( 'WARNING: clock reset into past by ' + tmp + ' ms' )
//		}


		/*
		 * public
		 */

		var Timer = function( eventManager, statisticsManager, initialTime ) {
			this.newRemoteTime        = initialTime
			this.remoteTime           = initialTime
			this.newRemoteTimPending  = false
			this.localTime            = initialTime
			this.previousSystemTime   = Types.Time.getCurrentInMs()
			this.elapsedTime          = 0
			this.deltaLocalRemoteTime = 0
			this.statisticsManager    = statisticsManager

			eventManager.subscribe(
				[ 'clockSyncUpdate' ],
				_.bind(
					function( updatedRemoteTime ) {
//						checkTimeWarp( newRemoteTime, updatedRemoteTime )

						this.newRemoteTime = updatedRemoteTime
						this.newRemoteTimPending = true
					},
					this
				)
			)

			eventManager.subscribe(
				Events.CLOCK_SYNC_ESTABLISHED,
				_.bind(
					function( initialRemoteGameTimeInMs ) {
						this.newRemoteTime = this.remoteTime = this.localTime = initialRemoteGameTimeInMs
						this.newRemoteTimPending = false
					},
					this
				)
			)

			// setting up statistics
			statisticsManager.addSeries( 'remoteTime', '' )
			statisticsManager.addSeries( 'localTime', '' )
			statisticsManager.addSeries( 'deltaLocalRemoteTime', '' )
			statisticsManager.addSeries( 'relativeClockSkew', '' )
			statisticsManager.addSeries( 'newRemoteTimeTransfered', '' )
		}

		Timer.prototype = {
			update : function() {
				// TODO: think about incorporating the new value 'softly' instead of directly replacing the old one
				if( this.newRemoteTimPending ) {
					this.remoteTime          = this.newRemoteTime
					this.newRemoteTimPending = false
				}

				// measuring time
				var systemTime            = Types.Time.getCurrentInMs()
				this.elapsedTime          = Math.max( systemTime - this.previousSystemTime, 0 ) // it must never be smaller than 0
				this.previousSystemTime   = systemTime

				this.localTime            += this.elapsedTime
				this.remoteTime           += this.elapsedTime
				this.deltaLocalRemoteTime = this.localTime - this.remoteTime

				// relative clock skew
				var factor = 1000000000
				this.relativeClockSkew = ( ( this.localTime / this.remoteTime * factor ) - factor ) * 2 + 1

				// updating statistics
				this.statisticsManager.updateSeries( 'remoteTime', this.remoteTime % 2000 )
				this.statisticsManager.updateSeries( 'localTime', this.localTime % 2000 )
				this.statisticsManager.updateSeries( 'deltaLocalRemoteTime', this.deltaLocalRemoteTime + 250 )
				this.statisticsManager.updateSeries( 'relativeClockSkew', this.relativeClockSkew )
			},
			getLocalTime : function() {
				return this.localTime
			},
			getElapsedTime : function() {
				return this.elapsedTime
			},
			getRemoteTime : function() {
				return this.remoteTime
			}//,
//			getDeltaLocalRemoteTime : function() {
//				return deltaRemoteLocalTime
//			},
//			getRelativeClockSkew : function() {
//				return relativeClockSkew
//			}
		}

		return Timer
	}
)
