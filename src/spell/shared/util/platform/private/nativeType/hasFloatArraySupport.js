define(
	'spell/shared/util/platform/private/nativeType/hasFloatArraySupport',
	function() {
		'use strict'


		return function() {
			return typeof( Float32Array ) !== 'undefined'
		}
	}
)
