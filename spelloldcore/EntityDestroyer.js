
define(
	[
		"spell/util/common/dialect"
	],
	function(
		dialect
	) {
		"use strict";
		
		
		function EntityDestroyer( entities ) {
			this.entities          = entities
			this.entitiesToDestroy = []
		}
		
		EntityDestroyer.addToPrototype( {
			destroyEntity: function( entity ) {
				this.entitiesToDestroy.push( entity )
			},
			
			commit: function() {
				var self = this
				
				self.entitiesToDestroy.forEach( function( entity ) {
					self.entities.remove( entity.id )
				} )
			}
		} )
		
		
		return EntityDestroyer	
	}
)
