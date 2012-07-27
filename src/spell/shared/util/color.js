define(
	'spell/shared/util/color',
	[
		'spell/math/util',

		'spell/math/vec3',
		'spell/functions'
	],
	function(
		mathUtil,

		vec3
	) {
		'use strict'


		var toRange = function( value ) {
			return Math.round( mathUtil.clamp( value, 0, 1 ) * 255 )
		}


		var createRgb = function( r, g, b ) {
			return [ r, g, b ]
		}


		var createRgba = function( vec ) {
			return ( vec.length === 4 ?
				[ vec[ 0 ], vec[ 1 ], vec[ 2 ], vec[ 3 ] ] :
				[ vec[ 0 ], vec[ 1 ], vec[ 2 ], 1.0 ] )
		}


		var createRandom = function() {
			var primaryColorIndex = Math.round( Math.random() * 3 )
			var colorVec = vec3.create( [ 0.8, 0.8, 0.8 ] )

			for( var i = 0; i < colorVec.length; i++ ) {
				if ( i === primaryColorIndex ) {
					colorVec[ i ] = 0.95

				} else {
					colorVec[ i ] *= Math.random()
				}
			}

			return colorVec
		}


		var formatCanvas = function( vec ) {
			if( vec.length === 4 ) {
				return 'rgba('
					+ toRange( vec[ 0 ] ) + ', '
					+ toRange( vec[ 1 ] ) + ', '
					+ toRange( vec[ 2 ] ) + ', '
					+ Math.max( 0, Math.min( vec[ 3 ], 1 ) ) + ')'
			}

			return 'rgb('
				+ toRange( vec[ 0 ] ) + ', '
				+ toRange( vec[ 1 ] ) + ', '
				+ toRange( vec[ 2 ] ) + ')'
		}


		return {
			createRgb    : createRgb,
			createRgba   : createRgba,
			createRandom : createRandom,
			formatCanvas : formatCanvas
		}
	}
)
