define(
	'spell/physics/2D/BoxTreeBroadphase',
	[
		'spell/data/spatial/BoxTree',
		'spell/physics/2D/BoxTreeBroadphaseHandle'
	],
	function( BoxTree, Physics2DBoxTreeBroadphaseHandle ) {

		var Physics2DBoxTreeBroadphase = function() {
			this.staticTree = BoxTree.create(true);
			this.dynamicTree = BoxTree.create(false);
			this.overlappingNodes = [];
		}
		Physics2DBoxTreeBroadphase.prototype.sample = function (box /*v4*/ , lambda, thisObject) {
			var overlappingNodes = this.overlappingNodes;

			var numOverlappingNodes = this.staticTree.getOverlappingNodes(box, overlappingNodes, 0);
			numOverlappingNodes += this.dynamicTree.getOverlappingNodes(box, overlappingNodes, numOverlappingNodes);

			var n;
			for (n = 0; n < numOverlappingNodes; n += 1) {
				lambda.call(thisObject, overlappingNodes[n], box);
			}
		};

		Physics2DBoxTreeBroadphase.prototype.insert = function (data, box /*v4*/ , isStatic) {
			var handle = Physics2DBoxTreeBroadphaseHandle.allocate();
			handle.data = data;
			handle.isStatic = isStatic;

			if (isStatic) {
				this.staticTree.add(handle, box);
			} else {
				this.dynamicTree.add(handle, box);
			}

			return handle;
		};

		Physics2DBoxTreeBroadphase.prototype.update = function (handle, box /*v4*/ , isStatic) {
			if (isStatic !== undefined && handle.isStatic !== isStatic) {
				if (handle.isStatic) {
					this.staticTree.remove(handle);
					this.dynamicTree.add(handle, box);
				} else {
					this.dynamicTree.remove(handle);
					this.staticTree.add(handle, box);
				}
				handle.isStatic = isStatic;
			} else {
				if (isStatic) {
					this.staticTree.update(handle, box);
				} else {
					this.dynamicTree.update(handle, box);
				}
			}
		};

		Physics2DBoxTreeBroadphase.prototype.remove = function (handle) {
			if (handle.isStatic) {
				this.staticTree.remove(handle);
			} else {
				this.dynamicTree.remove(handle);
			}

			Physics2DBoxTreeBroadphaseHandle.deallocate(handle);
		};

		Physics2DBoxTreeBroadphase.prototype.clear = function (callback, thisObject) {
			this._clearTree(this.staticTree, callback, thisObject);
			this._clearTree(this.dynamicTree, callback, thisObject);
		};

		Physics2DBoxTreeBroadphase.prototype._clearTree = function (tree, callback, thisObject) {
			var nodes = tree.getNodes();
			var numNodes = nodes.length;
			var n;
			for (n = 0; n < numNodes; n += 1) {
				var handle = nodes[n].externalNode;
				if (handle) {
					if (callback) {
						callback.call(thisObject, handle);
					}
					Physics2DBoxTreeBroadphaseHandle.deallocate(handle);
				}
			}
			tree.clear();
		};

		Physics2DBoxTreeBroadphase.prototype._validate = function () {
			this.staticTree.finalize();
			this.dynamicTree.finalize();
		};

		Physics2DBoxTreeBroadphase.prototype.perform = function (lambda, thisObject) {
			this._validate();

			var overlappingNodes = this.overlappingNodes;

			var staticTree = this.staticTree;
			var dynamicTree = this.dynamicTree;

			var dynamicNodes = dynamicTree.getNodes();
			var numDynamicNodes = dynamicNodes.length;
			var n;
			for (n = 0; n < numDynamicNodes; n += 1) {
				var dynamicNode = dynamicNodes[n];
				var handle = dynamicNode.externalNode;
				if (handle) {
					var numOverlappingNodes = staticTree.getOverlappingNodes(dynamicNode.extents, overlappingNodes, 0);
					var i;
					for (i = 0; i < numOverlappingNodes; i += 1) {
						lambda.call(thisObject, handle, overlappingNodes[i]);
					}
				}
			}

			var numPairs = dynamicTree.getOverlappingPairs(overlappingNodes, 0);
			for (n = 0; n < numPairs; n += 2) {
				lambda.call(thisObject, overlappingNodes[n], overlappingNodes[n + 1]);
			}
		};

		Physics2DBoxTreeBroadphase.create = function () {
			return new Physics2DBoxTreeBroadphase();
		};

		Physics2DBoxTreeBroadphase.version = 1;

		return Physics2DBoxTreeBroadphase;
})