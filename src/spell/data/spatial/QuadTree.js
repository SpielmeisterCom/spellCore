define(
	'spell/data/spatial/QuadTree',
	function() {
		'use strict'


		var contains = function( boundA, boundB ) {
			return boundA[ 0 ] <= boundB[ 0 ] &&
				boundA[ 1 ] > boundB[ 1 ] &&
				boundA[ 2 ] <= boundB[ 2 ] &&
				boundA[ 3 ] > boundB[ 3 ]
		}

		var intersect = function( boundA, boundB ) {
			return boundA[ 0 ] <= boundB[ 1 ] &&
				boundB[ 0 ] < boundA[ 1 ] &&
				boundA[ 2 ] <= boundB[ 3 ] &&
				boundB[ 2 ] < boundA[ 3 ]
		}

		var split = function( node ) {
			var bound    = node.bound,
				left     = bound[ 0 ],
				right    = bound[ 1 ],
				bottom   = bound[ 2 ],
				top      = bound[ 3 ],
				centerX  = ( left + right ) * 0.5,
				centerY  = ( bottom + top ) * 0.5,
				children = node.children

			children[ 0 ] = createTreeNode( node, [ centerX, right, centerY, top ] )
			children[ 1 ] = createTreeNode( node, [ left, centerX, centerY, top ] )
			children[ 2 ] = createTreeNode( node, [ left, centerX, bottom, centerY ] )
			children[ 3 ] = createTreeNode( node, [ centerX, right, bottom, centerY ] )
		}

		var unite = function( node ) {
			var children = node.children

			children[ 0 ].parent = undefined
			children[ 0 ] = undefined

			children[ 1 ].parent = undefined
			children[ 1 ] = undefined

			children[ 2 ].parent = undefined
			children[ 2 ] = undefined

			children[ 3 ].parent = undefined
			children[ 3 ] = undefined
		}

		var insert = function( idToNode, root, item ) {
			var node = insertR( root, item, item.bound ),
				id   = item.id

			if( !node ) {
				throw 'Could not insert item ' + id ? ' with id "' + id + '" ' : '' + 'because it is not contained in the space covered by the tree.'
			}

			if( id ) {
				idToNode[ id ] = node
			}
		}

		var insertR = function( node, item, itemBound ) {
			if( !contains( node.bound, itemBound ) ) return

			var children = node.children

			if( !children[ 0 ] ) {
				split( node )
			}

			for( var i = 0, success; i < 4; i++ ) {
				success = insertR( children[ i ], item, itemBound )

				if( success ) {
					node.numDescendantItems++

					return success
				}
			}

			if( !success ) {
				node.items[ item.id ] = item

				return node
			}
		}

		var remove = function( node, id ) {
			delete node.items[ id ]

			var parent = node.parent

			while( parent ) {
				parent.numDescendantItems--

				if( parent.numDescendantItems === 0 ) {
					unite( parent )
				}

				parent = parent.parent
			}
		}

		var searchItems = function( node, searchBound, result ) {
			// check the nodes' items
			var items  = node.items

			for( var id in items ) {
				var item      = items[ id ],
					itemBound = item.bound

				if( contains( itemBound, searchBound ) ||
					contains( searchBound, itemBound ) ||
					intersect( searchBound, itemBound ) ) {

					result[ id ] = item.payload
				}
			}

			// check the nodes' children
			var children = node.children

			if( !children[ 0 ] ) return

			for( var i = 0; i < 4; i++ ) {
				var child      = children[ i ],
					childBound = child.bound

				if( contains( searchBound, childBound ) ) {
					// add all descendant items of branch to the result set
					getAllItems( child, result )

				} else if( contains( childBound, searchBound ) ) {
					// search further down this branch and skip the other branches
					searchItems( child, searchBound, result )

					break

				} else if( intersect( childBound, searchBound ) ) {
					// search further down this branch
					searchItems( child, searchBound, result )
				}
			}
		}

		var getAllItems = function( node, result ) {
			// add nodes' items
			var items = node.items

			for( var id in items ) {
				result[ id ] = items[ id ].payload
			}

			// add childrens' items
			var children = node.children
			if( !children[ 0 ] ) return

			for( var i = 0; i < 4; i++ ) {
				getAllItems( children[ i ], result )
			}
		}

		var createBound = function( position, dimensions ) {
			var halfWidth  = dimensions[ 0 ] * 0.5,
				halfHeight = dimensions[ 1 ] * 0.5

			return [
				position[ 0 ] - halfWidth,  // left
				position[ 0 ] + halfWidth,  // right
				position[ 1 ] - halfHeight, // bottom
				position[ 1 ] + halfHeight  // top
			]
		}

		var createTreeNode = function( parent, bound ) {
			return {
				parent : parent,
				children : new Array( 4 ),
				bound : bound,
				items : {},
				numDescendantItems : 0
			}
		}

		var createItem = function( size, position, dimensions, payload, id ) {
			// HACK: this is necessary in order to support entities which do not have a dimensions
			if( !dimensions ) {
				position = [ 0, 0 ]
				dimensions = [ size - 1, size - 1 ]
			}

			return {
				id : id,
				bound : createBound( position, dimensions ),
				payload : payload
			}
		}


		var QuadTree = function( size ) {
			this.idToNode = {}
			this.size = size
			this.root = createTreeNode(
				null,
				createBound( [ 0, 0 ], [ size, size ] )
			)
		}

		QuadTree.prototype = {
			insert : function( position, dimensions, payload, id ) {
				if( id &&
					this.idToNode[ id ] ) {

					throw 'The provided id "' + id + '" is already in use.'
				}

				insert(
					this.idToNode,
					this.root,
					createItem( this.size, position, dimensions, payload, id )
				)
			},
			remove : function( id ) {
				var node = this.idToNode[ id ]
				if( !node ) return

				remove( node, id )

				delete this.idToNode[ id ]
			},
			search : function( position, dimensions ) {
				var result = {}

				searchItems(
					this.root,
					createBound( position, dimensions ),
					result
				)

				return result
			}
		}

		return QuadTree
	}
)
