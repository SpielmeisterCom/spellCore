// =====================================================================
//
// Physics2D 1D (x) Sweep and Prune Broadphase
//
define(
	'spell/physics/2D/SweepAndPruneHandle',
	[
		'spell/shared/util/platform/Types'
	],
	function(
		Types
	) {
		var Physics2DSweepAndPruneHandle = function() {
			this._next = null;
			this._prev = null;
			this._aabb = Types.createFloatArray(4);

			this.data = null;
			this.isStatic = false;
		}
		Physics2DSweepAndPruneHandle.allocate = function () {
			if (!this.pool) {
				return new Physics2DSweepAndPruneHandle();
			} else {
				var ret = this.pool;
				this.pool = ret._next;
				ret._next = null;
				return ret;
			}
		};

		Physics2DSweepAndPruneHandle.deallocate = function (handle) {
			handle._prev = null;
			handle._next = this.pool;
			this.pool = handle;

			handle.data = null;
		};
		Physics2DSweepAndPruneHandle.pool = null;

		return Physics2DSweepAndPruneHandle;
})