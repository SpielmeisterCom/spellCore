
// =====================================================================
//
// Physics2D TOI Event
//
// TOI DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*TOI_AXIS*/0       - seperating/MTV axis (x, y)
///*TOI_WITNESS_A*/2  - witness on shape A (x, y)
///*TOI_WITNESS_B*/4  - witness on shape B (x, y)
///*TOI_TOI_ALPHA*/6  - time of impact.
//
///*TOI_DATA_SIZE*/7
define(
	'spell/physics/2D/TOIEvent',
	[
		'spell/shared/util/platform/Types'
	],
	function( Types ) {

		var Physics2DTOIEvent = function() {
			this.next = null;
			this.shapeA = null;
			this.shapeB = null;
			this.frozenA = this.frozenB = false;
			this.arbiter = null;
			this.failed = false;
			this.slipped = false;
			this._data = Types.createFloatArray((/*TOI_DATA_SIZE*/ 7));
		}

		Physics2DTOIEvent.allocate = function () {
			if (Physics2DTOIEvent.pool) {
				var ret = Physics2DTOIEvent.pool;
				Physics2DTOIEvent.pool = ret.next;
				ret.next = null;
				return ret;
			} else {
				return (new Physics2DTOIEvent());
			}
		};

		Physics2DTOIEvent.deallocate = function (toi) {
			toi.next = Physics2DTOIEvent.pool;
			Physics2DTOIEvent.pool = toi;

			toi.shapeA = toi.shapeB = null;
			toi.failed = false;
			toi.slipped = false;
			toi.arbiter = null;
		};
		Physics2DTOIEvent.pool = null;
		return Physics2DTOIEvent;
});
