
define(
	function() {
		"use strict";
		
		
		function Entity( id, components ) {
			var self = this
			
			self.id = id
			
			components.forEach( function( component ) {
				self[ component.name ] = component.value
			} )
		}
		
		
		return Entity
	}
)
