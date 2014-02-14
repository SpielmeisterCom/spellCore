define(
	'spell/data/spatial/BoxTreeNode',
	function() {
		'use strict'
		// Copyright (c) 2012 Turbulenz Limited

		var BoxTreeNode = (function () {
			function BoxTreeNode(extents, escapeNodeOffset, externalNode) {
				this.escapeNodeOffset = escapeNodeOffset;
				this.externalNode = externalNode;
				this.extents = extents;
			}
			BoxTreeNode.prototype.isLeaf = function () {
				return !!this.externalNode;
			};

			BoxTreeNode.prototype.reset = function (minX, minY, maxX, maxY, escapeNodeOffset, externalNode) {
				this.escapeNodeOffset = escapeNodeOffset;
				this.externalNode = externalNode;
				var oldExtents = this.extents;
				oldExtents[0] = minX;
				oldExtents[1] = minY;
				oldExtents[2] = maxX;
				oldExtents[3] = maxY;
			};

			BoxTreeNode.prototype.clear = function () {
				this.escapeNodeOffset = 1;
				this.externalNode = undefined;
				var oldExtents = this.extents;
				var maxNumber = Number.MAX_VALUE;
				oldExtents[0] = maxNumber;
				oldExtents[1] = maxNumber;
				oldExtents[2] = -maxNumber;
				oldExtents[3] = -maxNumber;
			};

			// Constructor function
			BoxTreeNode.create = function (extents, escapeNodeOffset, externalNode) {
				return new BoxTreeNode(extents, escapeNodeOffset, externalNode);
			};
			BoxTreeNode.version = 1;
			return BoxTreeNode;
		})();

		return BoxTreeNode;
	}
)
