define(
	'spell/shared/util/OrderedMap',
	[
		'spell/shared/util/arrayRemove'
	],
	function(
		arrayRemove
	) {
		'use strict'


		var OrderedMap = function() {
		    this.sortedKeys = []
		    this.map = {}
		};

		OrderedMap.prototype = {
		    add : function( key, value ) {
		        var map = this.map

		        if( !map[ key ] ) {
		            this.sortedKeys.push( key )
		        }

				map[ key ] = value

				return this
		    },
		    insert : function( key, value, index ) {
		        this.sortedKeys.splice( index, 0, key )
		        this.map[ key ] = value

				return this
		    },
			getByIndex : function( index ) {
				var sortedKeys = this.sortedKeys

    			var key = sortedKeys[ index ]

				if( !key ) return

				return this.map[ key ]
			},
			getByKey : function( key ) {
				return this.map[ key ]
			},
		    removeByIndex : function( index ) {
		        var sortedKeys = this.sortedKeys

		        var key = sortedKeys[ index ]

		        if( !key ) return

		        arrayRemove( sortedKeys, index )
		        delete this.map[ key ]

				return this
		    },
		    removeByKey : function( key ) {
		        this.removeByIndex( this.sortedKeys.indexOf( key ) )

				return this
		    },
		    each : function( iter ) {
		        var map        = this.map,
		            sortedKeys = this.sortedKeys

		        for( var i = 0, numSortedKeys = sortedKeys.length; i < numSortedKeys; i++ ) {
		            var key = sortedKeys[ i ]

		            iter( map[ key ], key )
		        }

				return this
		    },
			clear : function() {
				this.map = {}
				this.sortedKeys.length = 0

				return this
			},
		    size : function() {
		        return this.sortedKeys.length
		    }
		}

		return OrderedMap
	}
)
