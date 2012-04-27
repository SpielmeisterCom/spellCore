define(
	"spell/shared/util/platform/Types",
	[
		"spell/shared/util/platform/private/createNativeFloatArray",
		"spell/shared/util/platform/private/Time"
	],
	function(
		createNativeFloatArray,
		Time
	) {
		"use strict"

		return {
			createNativeFloatArray : createNativeFloatArray,
			Time                   : Time
		}
	}
)
