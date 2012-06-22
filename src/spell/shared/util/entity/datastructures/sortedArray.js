define(
	"spell/shared/util/entity/datastructures/sortedArray",
	[
		'spell/shared/util/platform/underscore'
	],
	function(
		_
	) {
		"use strict"


		/**
		 * An array of entities that are sorted by a specific criteria.
		 * This data structure should be used, if a system expects entities sorted according to a specific criteria.
		 *
		 * Let's say, for example, you need to draw entities, those with the lowest z-index first.
		 *
		 * First, initialize the data structure for your specific use case:
		 * var sortedZIndexArray = sortedArray( function( entityA, entityB ) {
		 *     return entityA.renderData.zIndex - entityB.renderData.zIndex
		 * } )
		 * The sorting function works exactly like the one taken by Array.prototype.sort.
		 *
		 * Attention: Changing the sorting criteria afterwards is not supported and will lead to unexpected results! A
		 * workaround for this is to remove the component from the entity and re-add it with the changed sorting
		 * criteria.
		 */

		return function( compareFunction ) {
			return {
				onCreate: function( map ) {
					map.sortedArray = []
				},

				onAdd: function( map, key, value  ) {
					map.sortedArray.push( value )
					map.sortedArray.sort( compareFunction )
				},

				onUpdate: function( map, key, originalValue, updatedValue ) {
					this.onRemove( map, key, originalValue )
					this.onAdd( map, key, updatedValue )
				},

				onRemove: function( map, key, value ) {
					var indexOfValue = _.indexOf( map.sortedArray, value )
					map.sortedArray.splice( indexOfValue, 1 )
				}
			}
		}
	}
)
