// =====================================================================
//
// Physics2D 1D (x) Sweep and Prune Broadphase
//
define(
	'spell/physics/2D/SweepAndPrune',
	[
		'spell/physics/2D/SweepAndPruneHandle'
	],
	function(
		Physics2DSweepAndPruneHandle
	) {

		var Physics2DSweepAndPrune = function() {
		}
		Physics2DSweepAndPrune.prototype.sample = function (rectangle, lambda, thisObject) {
			var minX = rectangle[0];
			var minY = rectangle[1];
			var maxX = rectangle[2];
			var maxY = rectangle[3];

			this._validate();

			var d1 = this._list;
			while (d1) {
				var aabb = d1._aabb;

				// Slip element preceeding rectangle.
				if (aabb[2] < minX) {
					d1 = d1._next;
					continue;
				}

				// Discard all list proceeding rectangle.
				if (aabb[0] > maxX) {
					break;
				}

				// Full AABB check (only y-check needed)
				if (aabb[1] <= maxY && minY <= aabb[3]) {
					lambda.call(thisObject, d1, rectangle);
				}
				d1 = d1._next;
			}
		};

		Physics2DSweepAndPrune.prototype.insert = function (data, aabb, isStatic) {
			var handle = Physics2DSweepAndPruneHandle.allocate();
			var ab = handle._aabb;
			ab[0] = aabb[0];
			ab[1] = aabb[1];
			ab[2] = aabb[2];
			ab[3] = aabb[3];

			handle.data = data;
			handle.isStatic = isStatic;

			// Insert at beginning, let broadphase update deal with it.
			var list = this._list;
			handle._next = list;
			if (list) {
				list._prev = handle;
			}
			this._list = handle;

			return handle;
		};

		Physics2DSweepAndPrune.prototype.update = function (handle, aabb, isStatic) {
			var ab = handle._aabb;
			ab[0] = aabb[0];
			ab[1] = aabb[1];
			ab[2] = aabb[2];
			ab[3] = aabb[3];

			// Not used in this broadphase, but must provide consistency
			if (isStatic !== undefined) {
				handle.isStatic = isStatic;
			}
		};

		Physics2DSweepAndPrune.prototype.remove = function (handle) {
			if (!handle._prev) {
				this._list = handle._next;
			} else {
				handle._prev._next = handle._next;
			}

			if (handle._next) {
				handle._next._prev = handle._prev;
			}

			Physics2DSweepAndPruneHandle.deallocate(handle);
		};

		Physics2DSweepAndPrune.prototype.clear = function (callback, thisObject) {
			var handle = this._list;
			while (handle) {
				var next = handle._next;
				if (callback) {
					callback.call(thisObject, handle);
				}
				Physics2DSweepAndPruneHandle.deallocate(handle);
				handle = next;
			}
			this._list = null;
		};

		Physics2DSweepAndPrune.prototype._validate = function () {
			if (!this._list) {
				return;
			}

			var a = this._list._next;
			while (a) {
				var next = a._next;
				var b = a._prev;

				var aMinX = a._aabb[0];
				if (aMinX > b._aabb[0]) {
					// Nothing to do.
					a = next;
					continue;
				}

				while (b._prev && b._prev._aabb[0] > aMinX) {
					b = b._prev;
				}

				// Remove a
				var prev = a._prev;
				prev._next = next;
				if (next) {
					next._prev = prev;
				}

				// Insert a before b
				if (!b._prev) {
					a._prev = null;
					this._list = a;
					a._next = b;
					b._prev = a;
				} else {
					a._prev = b._prev;
					b._prev = a;
					a._prev._next = a;
					a._next = b;
				}

				a = next;
			}
		};

		Physics2DSweepAndPrune.prototype.perform = function (lambda, thisObject) {
			this._validate();

			var d1 = this._list;
			while (d1) {
				var d2 = d1._next;
				var aabb1 = d1._aabb;
				var d1Static = d1.isStatic;

				var maxX = aabb1[2];
				while (d2) {
					var aabb2 = d2._aabb;
					if (aabb2[0] > maxX) {
						break;
					}

					if (d1Static && d2.isStatic) {
						d2 = d2._next;
						continue;
					}

					// Check AABB's fully. (test y-axis, x-axis already checked)
					if (aabb1[1] > aabb2[3] || aabb2[1] > aabb1[3]) {
						d2 = d2._next;
						continue;
					}

					lambda.call(thisObject, d1, d2);
					d2 = d2._next;
				}

				d1 = d1._next;
			}
		};

		Physics2DSweepAndPrune.create = function () {
			var b = new Physics2DSweepAndPrune();
			b._list = null;
			return b;
		};
		Physics2DSweepAndPrune.version = 1;

		return Physics2DSweepAndPrune;
})