define(
	'spell/physics/2D/Callback',
	[
	],
	function() {
		var Physics2DCallback = function() {
			// All events
			this.thisObject = null;
			this.callback = null;

			// Used to ensure time ordering of deferred events.
			// -1 if event corresponds to action performed before step()
			// 0  if event is a standard event during step()
			// 1  if event is result of a continuous collision during step()
			this.time = 0;

			// Interaction events
			this.index = 0;
			this.arbiter = null;

			this.next = null;
		}
		Physics2DCallback.allocate = function () {
			if (Physics2DCallback.pool) {
				var ret = Physics2DCallback.pool;
				Physics2DCallback.pool = ret.next;
				ret.next = null;
				return ret;
			} else {
				return (new Physics2DCallback());
			}
		};

		Physics2DCallback.deallocate = function (callback) {
			callback.next = Physics2DCallback.pool;
			Physics2DCallback.pool = callback;

			callback.thisObject = null;
			callback.callback = null;
			callback.arbiter = null;
		};
		Physics2DCallback.pool = null;
		return Physics2DCallback;
})
