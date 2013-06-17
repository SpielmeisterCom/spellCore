define(
	'spell/shared/util/platform/private/sound/createSoundId',
	function() {
		'use strict'


		var nextSoundId  = 0

		return function() {
			return nextSoundId++
		}
	}
)
