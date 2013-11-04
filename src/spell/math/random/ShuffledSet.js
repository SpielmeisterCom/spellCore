define(
	'spell/math/random/ShuffledSet',
	function() {
		'use strict'


		var swap = function( values, i, j ) {
		    var x = values[ j ]

		    values[ j ] = values[ i ]
		    values[ i ] = x
		}

		/**
		 * Shuffles the supplied values. Uses the Fisher-Yates shuffling algorithm.
		 *
		 * @param prng the pseudo random number generator to use
		 * @param values the values to shuffle
		 * @constructor
		 */
		var ShuffledSet = function( prng, values ) {
		    this.prng = prng
		    this.values = values.slice()
		    this.lastNotYetChosenIndex = this.values.length - 1
		}

		ShuffledSet.prototype = {
		    next : function() {
		        var lastNotYetChosenIndex = this.lastNotYetChosenIndex
		        if( lastNotYetChosenIndex < 0 ) return

		        var values = this.values,
		            index  = Math.floor( this.prng.nextBetween( 0, lastNotYetChosenIndex ) ),
		            x      = values[ index ]

		        swap( values, index, lastNotYetChosenIndex )

		        this.lastNotYetChosenIndex--

		        return x
		    }
		}

		return ShuffledSet
	}
)
