define(
	'spell/shared/util/platform/private/storage/encodeValue',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'

		var encodeValue = function( value ){
			var flat = '',
				i = 0,
				enc,
				len,
				key;

			if (value == null) {
				return 'e:1';
			} else if(typeof value == 'number') {
				enc = 'n:' + value;
			} else if(typeof value == 'boolean') {
				enc = 'b:' + (value ? '1' : '0');
			} else if(_.isArray(value)) {
				for (len = value.length; i < len; i++) {
					flat += encodeValue(value[i]);
					if (i != len - 1) {
						flat += '^';
					}
				}
				enc = 'a:' + flat;
			} else if (typeof value == 'object') {
				for (key in value) {
					if (typeof value[key] != 'function' && value[key] !== undefined) {
						flat += key + '=' + encodeValue(value[key]) + '^';
					}
				}
				enc = 'o:' + flat.substring(0, flat.length-1);
			} else {
				enc = 's:' + value;
			}
			return escape(enc);
		}

		return encodeValue
	}
)
