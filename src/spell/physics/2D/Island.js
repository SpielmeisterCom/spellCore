define(
	'spell/physics/2D/Island',
	[
	],
	function() {
		var Physics2DIsland = function() {
			this.components = [];
			this.sleeping = false;
			this.wakeTime = 0;
			this.next = null;
		}
		Physics2DIsland.allocate = function () {
			if (Physics2DIsland.pool) {
				var ret = Physics2DIsland.pool;
				Physics2DIsland.pool = ret.next;
				ret.next = null;
				return ret;
			} else {
				return (new Physics2DIsland());
			}
		};

		Physics2DIsland.deallocate = function (island) {
			island.next = Physics2DIsland.pool;
			Physics2DIsland.pool = island;
			island.wakeTime = 0;
		};
		Physics2DIsland.pool = null;

		return Physics2DIsland;
})

