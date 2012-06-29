define(
	"spell/shared/util/platform/private/registerTimer",
	function() {
		"use strict";


		/*
		 * callback - the callback to call
		 * timeInMs - the number of milliseconds that the callback is delayed by
		 */
		return function( callback, timeInMs ) {
			setTimeout( callback, timeInMs )
		}
	}
)
