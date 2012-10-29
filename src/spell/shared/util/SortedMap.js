define(
	'spell/shared/util/SortedMap',
	[
		'spell/shared/util/arrayRemove'
	],
	function(
		arrayRemove
	) {
		'use strict'


		var OrderedMap = function() {
		    this.keys = []
		    this.values = []
		}

		OrderedMap.prototype = {
		    add : function( key, value ) {
				var keys   = this.keys,
					values = this.values,
					index  = keys.indexOf( key )

				if( index === -1 ) {
					keys.push( key )
					values.push( value )

				} else {
					values[ index ] = value
				}

				return this
		    },
		    insert : function( key, value, index ) {
		        this.keys.splice( index, 0, key )
		        this.values.splice( index, 0, value )

				return this
		    },
			getByIndex : function( index ) {
				return this.values[ index ]
			},
			getByKey : function( key ) {
				return this.getByIndex( this.keys.indexOf( key ) )
			},
			hasKey : function( key ) {
				return this.keys.indexOf( key ) !== -1
			},
		    removeByIndex : function( index ) {
		        arrayRemove( this.keys, index )
				arrayRemove( this.values, index )

				return this
		    },
		    removeByKey : function( key ) {
		        this.removeByIndex( this.keys.indexOf( key ) )

				return this
		    },
		    each : function( iter ) {
		        var keys   = this.keys,
		            values = this.values

		        for( var i = 0, numKeys = keys.length; i < numKeys; i++ ) {
		            var key   = keys[ i ],
						value = values[ i ]

		            iter( value, key )
		        }

				return this
		    },
			clear : function() {
				this.keys.length = 0
				this.values.length = 0

				return this
			},
		    size : function() {
		        return this.keys.length
		    }
		}

		return OrderedMap
	}
)
