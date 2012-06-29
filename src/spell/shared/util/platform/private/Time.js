define(
	"spell/shared/util/platform/private/Time",
	function() {
		"use strict"

		return {
			/*
			 * Returns the number of milliseconds since midnight January 1, 1970, UTC.
			 */
			getCurrentInMs: function() {
				return Date.now()
			}
		}
	}
)
