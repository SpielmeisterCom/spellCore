/**
 * @class spell.shared.util.platform.Types
 */
define(
	'spell/shared/util/platform/Types',
	[
		'spell/shared/util/platform/private/nativeType/createFloatArray',
		'spell/shared/util/platform/private/nativeType/createIntegerArray',
		'spell/shared/util/platform/private/nativeType/hasFloatArraySupport',
		'spell/shared/util/platform/private/nativeType/hasIntegerArraySupport',
		'spell/shared/util/platform/private/Time'
	],
	function(
		createFloatArray,
		createIntegerArray,
		hasFloatArraySupport,
		hasIntegerArraySupport,
		Time
	) {
		'use strict'

		return {
			createFloatArray       : createFloatArray,
			createIntegerArray     : createIntegerArray,
			hasFloatArraySupport   : hasFloatArraySupport,
			hasIntegerArraySupport : hasIntegerArraySupport,
			Time                   : Time
		}
	}
)
