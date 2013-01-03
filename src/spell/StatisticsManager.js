define(
	'spell/StatisticsManager',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		/*
		 * private
		 */

		var NUM_VALUES   = 512,
			FLOAT_DIGITS = 1

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
				values : createBuffer( NUM_VALUES ),
				name   : name,
				unit   : unit
			}
		}


		/*
		 * public
		 */

		var StatisticsManager = function() {
			this.series = {}
			this.numRecordedValues = 0
		}

		StatisticsManager.prototype = {
			init : function() {
				this.addSeries( 'total', 'total time spent', 'ms' )
				this.addSeries( 'update', 'time spent in the update loop', 'ms' )
				this.addSeries( 'render', 'time spent in the render loop', 'ms' )
			},
			/*
			 * call this method to signal the beginning of a new measurement period
			 */
			startTick : function() {
				var series = this.series

				for( var id in series ) {
					var seriesIter = series[ id ]

					seriesIter.values.push( 0 )
					seriesIter.values.shift()
				}

				this.numRecordedValues = Math.min( this.numRecordedValues + 1, NUM_VALUES )
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

				series.values[ NUM_VALUES - 1 ] += value
			},
			getValues : function() {
				return this.series
			},
			getSeriesValues : function( id ) {
				return this.series[ id ]
			},
			getSeriesInfo : function( id, n ) {
				var series = this.series[ id ]
				if( !series ) return

				var numRecordedValues = Math.min( this.numRecordedValues, n ),
					min = Number.MAX_VALUE,
					max = 0

				for( var i = NUM_VALUES - 1, lowestIndex = NUM_VALUES - numRecordedValues, sum = 0, seriesValues = series.values; i >= lowestIndex; i-- ) {
					var value = seriesValues[ i ]

					if( value == 0 ) continue

					if( value < min ) min = value
					if( value > max ) max = value

					sum += 1 / value
				}

				var harmonicMean = sum == 0 ? 0 : numRecordedValues / sum

				return {
					avg : harmonicMean.toFixed( FLOAT_DIGITS ),
					min : min.toFixed( FLOAT_DIGITS ),
					max : max.toFixed( FLOAT_DIGITS )
				}
			}
		}

		return StatisticsManager
	}
)
