define(
	"spell/shared/util/entity/datastructures/multiMap",
	[
		'spell/shared/util/platform/underscore'
	],
	function(
		_
	) {
		"use strict"


		/*
		 * A multimap that uses an arbitrary property of an entity as its key.
		 * This data structure should be used, if you need to efficiently access groups of entities based on a specific
		 * property.
		 *
		 * Let's say, for example, that you have entities representing persons with a personalData component and want
		 * list those, grouping persons by their age.
		 *
		 * First, initialize the data structure for your specific use case:
		 * var ageMultiMap = multiMap( function( entity ) { return entity.personalData.age } )
		 *
		 * When the multi map is passed into your system later, you can access persons by their age:
		 * var arrayOfElevenYearOlds = entities[ 11 ]
		 *
		 * Attention: Changing the key property afterwards is not supported and will lead to unexpected results! A
		 * workaround for this is to remove the component from the entity and re-add it with the changed key property.
		 */

		return function( keyAccessor ) {
			return {
				onCreate: function( map ) {
					map.multiMap = {}
				},

				onAdd: function( map, key, entity ) {
					var entityKey = keyAccessor( entity )

					if ( !map.multiMap.hasOwnProperty( entityKey ) ) {
						map.multiMap[ entityKey ] = []
					}

					map.multiMap[ entityKey ].push( entity )
				},

				onUpdate: function( map, key, originalEntity, updatedEntity ) {
					this.onRemove( map, key, originalEntity )
					this.onAdd( map, key, updatedEntity )
				},

				onRemove: function( map, key, entityToRemove ) {
					var entityKey = keyAccessor( entityToRemove )

					if ( entityKey === undefined ) {
						_.each( map.multiMap, function( entities, theEntityKey ) {
							_.each( entities, function( entity ) {
								if ( entity === entityToRemove ) {
									entityKey = theEntityKey
								}
							} )
						} )
					}

					map.multiMap[ entityKey ] = map.multiMap[ entityKey ].filter( function( entityInMap ) {
						return entityInMap !== entityToRemove
					} )

					if ( map.multiMap[ entityKey ].length === 0 ) {
						delete map.multiMap[ entityKey ]
					}
				}
			}
		}
	}
)
