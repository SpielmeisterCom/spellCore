
// =====================================================================
//
// Physics2D Contact
//
//
// CONTACT DATA CONSTANTS
// !! Must use regexp to change these globally (in all files) !!
//
///*CON_POS*/0         // World position of contact (x, y)
///*CON_DIST*/2        // Penetration distance of contact
///*CON_BOUNCE*/3      // Per-contact bounce error.
///*CON_FRICTION*/4    // Per-contact friction (based on arbiter and rel. velocity)
///*CON_NMASS*/5       // Normal effective mass
///*CON_TMASS*/6       // Tangent effective mass
///*CON_REL1*/7        // Contact relative to object 1 (x, y)
///*CON_REL2*/9        // Contact relative to object 2 (x, y)
///*CON_JNACC*/11      // Normal accumulated impulse
///*CON_JTACC*/12      // Tangent accumulated impulse
///*CON_LREL1*/13      // Local contact point on object 1 (position iteration) (x, y)
///*CON_LREL2*/15      // Local contact point on object 2 (position iteration) (x, y)
//
///*CON_DATA_SIZE*/17
define(
	'spell/physics/2D/Contact',
	[
		'spell/shared/util/platform/Types'
	],
	function(Types) {
		var Physics2DContact = function() {
			this._data = Types.createFloatArray((/*CON_DATA_SIZE*/ 17));
			this.fresh = false;
			this._hash = 0;
			this._timeStamp = 0;
			this._next = null;
			this.active = false;
			this.virtual = false;
		}
		Physics2DContact.allocate = function () {
			if (!this.pool) {
				return new Physics2DContact();
			} else {
				var ret = this.pool;
				this.pool = ret._next;
				ret._next = null;
				return ret;
			}
		};
		Physics2DContact.deallocate = function (contact) {
			contact._next = this.pool;
			this.pool = contact;
		};

		Physics2DContact.prototype.getPosition = function (dst /*v2*/ ) {
			if (dst === undefined) {
				dst = Types.createFloatArray(2);
			}
			var data = this._data;
			dst[0] = data[(/*CON_POS*/ 0)];
			dst[1] = data[(/*CON_POS*/ 0) + 1];
			return dst;
		};

		Physics2DContact.prototype.getPenetration = function () {
			return (-this._data[(/*CON_DIST*/ 2)]);
		};

		Physics2DContact.prototype.getNormalImpulse = function () {
			return (this.virtual ? 0 : this._data[(/*CON_JNACC*/ 11)]);
		};

		Physics2DContact.prototype.getTangentImpulse = function () {
			return (this.virtual ? 0 : this._data[(/*CON_JTACC*/ 12)]);
		};
		Physics2DContact.version = 1;

		Physics2DContact.pool = null;
		return Physics2DContact;
})
