define(
	"spell/shared/util/map",
	[
		"underscore"
	],
	function(
		_
	) {
		"use strict"
		
		
		return {
			create: function( initialElements, listener ) {
				var map = {
					elements: {}
				}
				
				_.each( initialElements, function( element ) {
					var key   = element[ 0 ]
					var value = element[ 1 ]
					
					map.elements[ key ] = value
				} )
				
				if ( listener !== undefined ) {
					listener.onCreate( map )
				}
				
				return map
			},
			
			add: function( map, key, value, listener ) {
				var oldValue = map.elements[ key ]
				
				map.elements[ key ] = value
				
				if ( oldValue === undefined ) {
					if ( listener !== undefined ) {
						listener.onAdd( map, key, value )
					}
				}
				else {
					if ( listener !== undefined ) {
						listener.onUpdate( map, key, oldValue, value )
					}
				}
			},
			
			remove: function( map, key, listener ) {
				var entity = map.elements[ key ]
				if ( listener !== undefined && entity !== undefined ) {
					listener.onRemove( map, key, entity )
				}
				
				delete map.elements[ key ]				
			}
		}
	}
)
