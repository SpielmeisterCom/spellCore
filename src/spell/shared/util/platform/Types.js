/**
 * @class spell.shared.util.platform.Types
 */
define(
	'spell/shared/util/platform/Types',
	[
		'spell/shared/util/platform/private/nativeType/createFloatArray',
		'spell/shared/util/platform/private/nativeType/hasFloatArraySupport',
		'spell/shared/util/platform/private/nativeType/Int8Array',
		'spell/shared/util/platform/private/nativeType/Int32Array',
		'spell/shared/util/platform/private/Time'
	],
	function(
		createFloatArray,
		hasFloatArraySupport,
		Int8Array,
		Int32Array,
		Time
	) {
		'use strict'


		return {
			createFloatArray     : createFloatArray,
			hasFloatArraySupport : hasFloatArraySupport,
			Int8Array            : Int8Array,
			Int32Array           : Int32Array,
			Time                 : Time
		}
	}
)
