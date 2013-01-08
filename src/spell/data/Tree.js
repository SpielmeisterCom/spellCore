define(
	'spell/data/Tree',
	function() {
		'use strict'


		var getNode = function( currentNode, parentId ) {
			var children = currentNode.children

			if( currentNode.id === parentId ) {
				return currentNode

			} else {
				for( var i = 0, numChildren = children.length; i < numChildren; i++ ) {
					var node = getNode( children[ i ], parentId )

					if( node ) return node
				}
			}
		}

		var addNode = function( currentNode, parentId, newNode ) {
			var parentNode = getNode( currentNode, parentId )

			if( parentNode ) {
				parentNode.children.push( newNode )

				return true
			}

			return false
		}

		var eachNode = function( currentNode, iter, depth ) {
			if( !currentNode ) return
			if( !depth ) depth = 0

			iter( currentNode, depth )

			var children = currentNode.children

			for( var i = 0, numChildren = children.length, nextDepth = depth + 1; i < numChildren; i++ ) {
				eachNode( children[ i ], iter, nextDepth )
			}
		}

		return {
			addNode : addNode,
			getNode : getNode,
			eachNode : eachNode
		}
	}
)
