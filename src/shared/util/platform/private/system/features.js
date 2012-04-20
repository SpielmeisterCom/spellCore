define(
	"spell/shared/util/platform/private/system/features",
	[
		"modernizr"
	],
	function(
		modernizr
	) {
		"use strict";


		return {
			touch : !!modernizr.touch
		}
	}
)
