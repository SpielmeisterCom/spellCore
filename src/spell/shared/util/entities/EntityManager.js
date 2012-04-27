define(
	"spell/shared/util/entities/EntityManager",
	[
		"spell/shared/util/create"
	],
	function(
		create
	) {
		"use strict"


		var EntityManager = function( entityConstructors, componentConstructors ) {
			this.entityConstructors    = entityConstructors
			this.componentConstructors = componentConstructors

			this.nextId = 0
		}


		EntityManager.COMPONENT_TYPE_NOT_KNOWN = "The type of component you tried to add is not known. Component type: "
		EntityManager.ENTITY_TYPE_NOT_KNOWN    = "The type of entity you tried to create is not known. Entity type: "


		EntityManager.prototype = {
			createEntity: function( entityType, args ) {
				var constructor = this.entityConstructors[ entityType ]

				if ( constructor === undefined ) {
					throw EntityManager.ENTITY_TYPE_NOT_KNOWN + entityType
				}

				var entityId = getNextId( this )
				var entity   = create( constructor, args )
				entity.id    = entityId

				// WORKAROUND: until the state synchronization gets refactored entity type and creation arguments must be saved
				entity.type  = entityType
				entity.args  = args

				return entity
			},

			addComponent: function( entity, componentType, args ) {
				var constructor = this.componentConstructors[ componentType ]

				if ( constructor === undefined ) {
					throw EntityManager.COMPONENT_TYPE_NOT_KNOWN + componentType
				}

				var component = create( constructor, args )
				entity[ componentType ] = component

				return component
			},

			removeComponent: function( entity, componentType ) {
				var component = entity[ componentType ]

				delete entity[ componentType ]

				return component
			}
		}


		function getNextId( self ) {
			var id = self.nextId

			self.nextId += 1

			return id
		}


		return EntityManager
	}
)
