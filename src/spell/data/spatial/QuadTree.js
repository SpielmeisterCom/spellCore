define(
	'spell/data/spatial/QuadTree',
	function() {
		'use strict'


		var createTreeNode = function( parent, position, bound ) {
			return {
				parent : parent,
				children : new Array( 4 ),
				position : position,
				bound : bound,
				items : {}
			}
		}

		var createItem = function( position, bound, payload, id ) {
			return {
				id : id,
				position : position,
				bound : bound,
				payload : payload
			}
		}


		var QuadTree = function( size ) {
			this.root = createTreeNode( null, [ 0, 0 ], [ size, size ] )
			var idToItem = {}
		}

		QuadTree.prototype = {
			insert : function( position, bound, payload, id ) {

			},
			remove : function( id ) {

			},
			searchRegion : function( position, bound ) {

			}
		}

		return QuadTree
	}
)
