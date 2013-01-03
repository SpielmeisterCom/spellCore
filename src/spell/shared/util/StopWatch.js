define(
	'spell/shared/util/StopWatch',
	[
		'spell/shared/util/platform/Types'
	],
	function(
		Types
	) {
		'use strict'


		var getCurrentTimeInMs = Types.Time.getCurrentInMs

		var StopWatch = function() {
			this.value = 0
		}

		StopWatch.prototype = {
			start : function() {
				this.value = getCurrentTimeInMs()
			},
			stop : function() {
				return getCurrentTimeInMs() - this.value
			}
		}

		return StopWatch
	}
)
