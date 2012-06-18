define(
	'spell/shared/util/platform/private/nativeType/hasIntegerArraySupport',
	function() {
		'use strict'


		return function() {
			return typeof( Int32Array ) !== 'undefined'
		}
	}
)
