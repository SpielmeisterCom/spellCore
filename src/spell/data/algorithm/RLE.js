define(
	'spell/data/algorithm/RLE',
	function() {
		'use strict'


		return {
			encode : function( data ) {
				var count     = 0,
					lastValue = data[ 0 ],
					result    = []

				for( var i = 0, value, n = data.length; i < n; i++ ) {
					value = data[ i ]

					if( value != lastValue ) {
						result.push( count )
						result.push( lastValue )

						lastValue = value
						count = 1

					} else {
						count++
					}
				}

				if( count > 0 ) {
					result.push( count )
					result.push( lastValue )
				}

				return result
			},
			decode : function( data ) {
				var result = []

				for( var i = 0, count, value, n = data.length; i < n; i += 2 ) {
					count = data[ i ]
					value = data[ i + 1 ]

					for( var j = 0; j < count; j++ ) {
						result.push( value )
					}
				}

				return result
			}
		}
	}
)
