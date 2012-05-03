define(
	"spell/shared/util/entities/EntityManager",
	[
		"spell/shared/util/create"
	],
	function(
		create
	) {
		"use strict"

		var nextEntityId = 0

		var getNextEntityId = function() {
			return nextEntityId++
		}


		var EntityManager = function( blueprintManager ) {
			this.blueprintManager = blueprintManager

			this.nextId = 0
		}


		EntityManager.COMPONENT_TYPE_NOT_KNOWN = "The type of component you tried to add is not known. Component type: "
		EntityManager.ENTITY_TYPE_NOT_KNOWN    = "The type of entity you tried to create is not known. Entity type: "


		EntityManager.prototype = {
			createEntity: function( blueprintId, entityConfig ) {
				if( !this.blueprintManager.hasBlueprint( blueprintId ) ) throw 'Error: Unknown blueprint \'' + blueprintId + '\'. Could not create entity.'

				var entity = this.blueprintManager.createEntity( blueprintId, entityConfig )
				entity.id = getNextEntityId()

				return entity
			}//,

//			addComponent: function( entity, componentType, args ) {
//				var constructor = this.componentConstructors[ componentType ]
//
//				if ( constructor === undefined ) {
//					throw EntityManager.COMPONENT_TYPE_NOT_KNOWN + componentType
//				}
//
//				var component = create( constructor, args )
//				entity[ componentType ] = component
//
//				return component
//			},
//
//			removeComponent: function( entity, componentType ) {
//				var component = entity[ componentType ]
//
//				delete entity[ componentType ]
//
//				return component
//			}
		}


		return EntityManager
	}
)
