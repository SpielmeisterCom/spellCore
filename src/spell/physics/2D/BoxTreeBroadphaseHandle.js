define(
	'spell/physics/2D/BoxTreeBroadphaseHandle',
	[
	],
	function() {
		var Physics2DBoxTreeBroadphaseHandle = function() {
			this.boxTreeIndex = -1;

			this.data = null;
			this.isStatic = false;
		}

		Physics2DBoxTreeBroadphaseHandle.allocate = function () {
			if (0 < this.pool.length) {
				return this.pool.pop();
			} else {
				return new Physics2DBoxTreeBroadphaseHandle();
			}
		};

		Physics2DBoxTreeBroadphaseHandle.deallocate = function (handle) {
			this.pool.push(handle);

			handle.data = null;
		};

		Physics2DBoxTreeBroadphaseHandle.pool = [];
		return Physics2DBoxTreeBroadphaseHandle;
})
