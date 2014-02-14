define(
	'spell/physics/2D/Shape',
	[
		'spell/physics/2D/Material',
		'spell/shared/util/platform/Types'
	],
	function(
		Physics2DMaterial,
	    Types
	) {
		var Physics2DShape = function () {
		}

		// _validate()
		// {
		//     debug.abort("abstract method");
		// }
		// Abstract methods (have to have a body unfortunately)
		Physics2DShape.prototype.computeArea = function () {
			debug.abort("abstract method");
			return 0;
		};
		Physics2DShape.prototype.computeMasslessInertia = function () {
			debug.abort("abstract method");
			return 0;
		};
		Physics2DShape.prototype.computeCenterOfMass = function (dst /*v2*/ ) {
			debug.abort("abstract method");
			return null;
		};

		// {
		//     debug.abort("abstract method"); return 0;
		// }
		Physics2DShape.prototype.translate = function (translation, skip) {
			debug.abort("abstract method");
		};
		Physics2DShape.prototype._update = function (posX, posY, cos, sin, skipAABB) {
			debug.abort("abstract method");
		};
		Physics2DShape.prototype.clone = function () {
			debug.abort("abstract method");
			return undefined;
		};

		// Methods
		Physics2DShape.prototype.getGroup = function () {
			return this._group;
		};

		Physics2DShape.prototype.setGroup = function (group) {
			this._group = group;
			if (this.body) {
				this.body.wake(true);
			}
		};

		Physics2DShape.prototype.getMask = function () {
			return this._mask;
		};

		Physics2DShape.prototype.setMask = function (mask) {
			this._mask = mask;
			if (this.body) {
				this.body.wake(true);
			}
		};

		Physics2DShape.prototype.getMaterial = function () {
			return this._material;
		};

		Physics2DShape.prototype.setMaterial = function (material) {
			if (this._material !== material) {
				this._material = material;
				if (this.body) {
					this.body._invalidate();
				}

				var arbiters = this.arbiters;
				var limit2 = arbiters.length;
				var j;
				for (j = 0; j < limit2; j += 1) {
					arbiters[j]._invalidate();
				}
			}
		};

		Physics2DShape.prototype.copyCommon = function (from, to) {
			to._type = from._type;

			to._material = from._material;
			to._group = from._group;
			to._mask = from._mask;
			to.sensor = from.sensor;

			to.id = Physics2DShape.uniqueId;
			Physics2DShape.uniqueId += 1;

			to.arbiters = [];
			to._bphaseHandle = null;

			to.userData = from.userData;

			var fromData = from._data;
			var limit = from._data.length;
			var toData = to._data = Types.createFloatArray(limit);
			var i;
			for (i = 0; i < limit; i += 1) {
				toData[i] = fromData[i];
			}

			to._onPreSolve = [];
			to._events = []; // onBegin, onEnd, onProgress combined.
		};

		Physics2DShape.prototype.init = function (shape, params) {
			shape._material = params.material || Physics2DMaterial.create();
			shape._group = (params.group !== undefined) ? params.group : 1;
			shape._mask = (params.mask !== undefined) ? params.mask : 0xffffffff;
			shape.sensor = (params.sensor !== undefined) ? params.sensor : false;

			shape.arbiters = [];
			shape._bphaseHandle = null;
			shape.userData = (params.userData !== undefined) ? params.userData : null;

			shape.id = Physics2DShape.uniqueId;
			Physics2DShape.uniqueId += 1;

			shape._onPreSolve = [];
			shape._events = []; // onBegin, onEnd, onProgress combined.
		};

		// =============================================================================
		Physics2DShape.eventIndex = function (events, type, callback, callbackMask) {
			var limit = events.length;
			var i;
			for (i = 0; i < limit; i += 1) {
				var eventObject = events[i];
				if (eventObject.callback === callback && eventObject.mask === callbackMask && eventObject.type === type) {
					return i;
				}
			}

			return -1;
		};

		Physics2DShape.prototype.addEventListener = function (eventType, callback, callbackMask, deterministic) {
			var events, type;
			if (eventType === 'preSolve') {
				events = this._onPreSolve;
				type = (/*EVENT_PRESOLVE*/ 6);
			} else {
				events = this._events;
				type = (eventType === 'begin' ? (/*EVENT_BEGIN*/ 1) : eventType === 'progress' ? (/*EVENT_PROGRESS*/ 2) : eventType === 'end' ? (/*EVENT_END*/ 3) : null);
			}

			if (type === null) {
				return false;
			}

			if (eventType !== 'preSolve') {
				deterministic = undefined;
			} else if (deterministic === undefined) {
				deterministic = false;
			}

			var index = Physics2DShape.eventIndex(events, type, callback, callbackMask);
			if (index !== -1) {
				return false;
			}

			events.push({
				callback: callback,
				mask: callbackMask,
				type: type,
				deterministic: deterministic
			});

			if (this.body) {
				this.body.wake(true);
			}

			return true;
		};

		Physics2DShape.prototype.removeEventListener = function (eventType, callback, callbackMask) {
			var events, type;
			if (eventType === 'preSolve') {
				events = this._onPreSolve;
				type = (/*EVENT_PRESOLVE*/ 6);
			} else {
				events = this._events;
				type = (eventType === 'begin' ? (/*EVENT_BEGIN*/ 1) : eventType === 'progress' ? (/*EVENT_PROGRESS*/ 2) : eventType === 'end' ? (/*EVENT_END*/ 3) : null);
			}

			if (type === null) {
				return false;
			}

			var index = Physics2DShape.eventIndex(events, type, callback, callbackMask);
			if (index === -1) {
				return false;
			}

			// Need to keep order, cannot use swap-pop
			events.splice(index, 1);

			if (this.body) {
				this.body.wake(true);
			}

			return true;
		};

		Physics2DShape.uniqueId = 0;
		return Physics2DShape;
})
