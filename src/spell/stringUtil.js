/**
 * @class spell.stringUtil
 * @singleton
 */
define(
	'spell/stringUtil',
	function() {
		'use strict'


		var stringUtil = {}

		stringUtil.startsWith = function( x, prefix ) {
			if( prefix === '' ) return true
			if( !x || !prefix ) return false

			return String( x ).lastIndexOf( String( prefix ), 0 ) === 0
		}

		return stringUtil
	}
)
