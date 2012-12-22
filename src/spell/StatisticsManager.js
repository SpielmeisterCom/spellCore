define(
	"spell/StatisticsManager",
	[
		'spell/functions'
	],
	function(
		_
	) {
		"use strict"


		/*
		 * private
		 */

		var numberOfValues = 512

		var createBuffer = function( bufferSize ) {
			var buffer = []

			while( bufferSize > 0 ) {
				buffer.push( 0 )
				bufferSize--
			}

			return buffer
		}

		var createSeries = function( id, name, unit ) {
			return {
				values : createBuffer( numberOfValues ),
				name   : name,
				unit   : unit
			}
		}


		/*
		 * public
		 */

		var StatisticsManager = function() {
			this.series = {}
		}

		StatisticsManager.prototype = {
			init : function() {
				this.addSeries( 'fps', 'frames per second', 'fps' )
				this.addSeries( 'totalTimeSpent', 'total time spent', 'ms' )
				this.addSeries( 'timeSpentRendering', 'time spent rendering', 'ms' )
			},
			/*
			 * call this method to signal the beginning of a new measurement period
			 */
			startTick: function() {
				_.each(
					this.series,
					function( iter ) {
						iter.values.push( 0 )
						iter.values.shift()
					}
				)
			},
			addSeries : function( id, name, unit ) {
				if( !id ) return

				if( _.has( this.series, id ) ) throw 'Series with id "' + id + '" already exists'

				this.series[ id ] = createSeries( id, name, unit )
			},
			updateSeries : function( id, value ) {
				if( !id ) return

				var series = this.series[ id ]

				if( !series ) return

				series.values[ numberOfValues - 1 ] += value
			},
			getValues : function() {
				return this.series
			},
			getSeriesValues : function( id ) {
				return this.series[ id ]
			}
		}

		return StatisticsManager
	}
)
