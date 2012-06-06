define(
	'spell/shared/util/zones/ZoneEntityManager',
	[
		'spell/shared/util/platform/underscore'
	],
	function(
		_
	) {
		'use strict'


		function ZoneEntityManager( globalEntityManager, zoneEntities, listeners ) {
			this.globalEntityManager = globalEntityManager
			this.zoneEntities        = zoneEntities
			this.listeners           = listeners || []
		}


		ZoneEntityManager.prototype = {
			createEntity: function( entityType, args ) {
				var entity = this.globalEntityManager.createEntity.apply( this.globalEntityManager, arguments )
				this.zoneEntities.add( entity )
				this.listeners.forEach( function( listener ) { listener.onCreateEntity( entityType, args, entity ) } )
				return entity
			},

			createEntities: function( entityConfigs ) {
				var self = this

				_.each(
					entityConfigs,
					function( entityConfig ) {
						self.createEntity( entityConfig.blueprintId, entityConfig.config )
					}
				)
			},

			destroyEntity: function( entity ) {
				this.zoneEntities.remove( entity )
				this.listeners.forEach( function( listener ) { listener.onDestroyEntity( entity ) } )
			},

			addComponent: function( entity, componentType ) {
				var doesNotHaveComponent = !entity.hasOwnProperty( componentType )

				this.globalEntityManager.addComponent.apply( this.globalEntityManager, arguments )

				if ( doesNotHaveComponent ) {
					this.zoneEntities.update( entity )
				}
			},

			removeComponent: function( entity, componentType ) {
				var doesHaveComponent = entity.hasOwnProperty( componentType )

				this.globalEntityManager.removeComponent.apply( this.globalEntityManager, arguments )

				if ( doesHaveComponent ) {
					this.zoneEntities.update( entity )
				}
			}
		}


		return ZoneEntityManager
	}
)
