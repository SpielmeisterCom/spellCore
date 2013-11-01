define(
	'spell/data/LinkedList',
	function() {
		'use strict'


		var Node = function() {
			this.data = undefined
			this.previous = undefined
			this.next = undefined
		}

		var Iterator = function( linkedList ) {
			this.linkedList = linkedList
			this.currentNode = linkedList.firstNode
		}

		Iterator.prototype = {
			next : function() {
				var node = this.currentNode
				if( !node ) return

				this.currentNode = node.next

				return node
			},
			remove : function() {
				var linkedList  = this.linkedList,
					currentNode = this.currentNode,
					removeNode

				if( !currentNode ) {
					removeNode = linkedList.lastNode
					if( !removeNode ) return

				} else {
					removeNode = currentNode.previous
				}

				if( !removeNode ) return

				var previousNode = removeNode.previous,
					nextNode     = removeNode.next

				if( previousNode ) {
					previousNode.next = nextNode

				} else {
					linkedList.firstNode = nextNode
				}

				if( nextNode ) {
					nextNode.previous = previousNode

				} else {
					linkedList.lastNode = previousNode
				}

				this.currentNode = currentNode ?
					previousNode || nextNode :
					undefined

				linkedList.size--
			}
		}

		var LinkedList = function() {
			this.firstNode = undefined
			this.lastNode = undefined
			this.size = 0
		}

		LinkedList.prototype = {
			append : function( x ) {
				var node = new Node()

				node.data = x

				if( !this.firstNode ) {
					this.firstNode = node

				} else {
					this.lastNode.next = node
					node.previous = this.lastNode
				}

				this.lastNode = node
				this.size++
			},
			clear : function() {
				this.firstNode = undefined
				this.lastNode = undefined
				this.size = 0
			},
			createIterator : function() {
				return new Iterator( this )
			}
		}

		return LinkedList
	}
)
