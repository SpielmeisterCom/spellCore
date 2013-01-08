define(
	'spell/data/CircularBuffer',
	function() {
		'use strict'


		function CircularBuffer( length, defaultValue ) {
			if( !length ) throw 'Argument "length" is missing'

			this.length = length
			this.index = 0
			this.array = new Array()

			if( !defaultValue ) return

			for( var i = 0; i < length; i++ ) {
				this.array[ i ] = defaultValue
			}
		}

		CircularBuffer.prototype = {
			push: function( value ) {
				this.array[ this.index ] = value
				this.index = ( this.index + 1 ) % this.length
			},
			toArray: function() {
				return this.array.slice()
			}
		}

		return CircularBuffer
	}
)
