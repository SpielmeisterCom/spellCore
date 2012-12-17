define(
	'spell/shared/util/platform/private/storage/decodeValue',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'

		var decodeValue = function( value ){
			// a -> Array
			// n -> Number
			// b -> Boolean
			// s -> String
			// o -> Object
			// -> Empty (null)

			var	re = /^(a|n|b|s|o|e)\:(.*)$/,
				matches = re.exec(unescape(value)),
				all,
				type,
				keyValue,
				values,
				vLen,
				v;

			if(!matches || !matches[1]){
				return; // non state
			}

			type = matches[1];
			value = matches[2];
			switch (type) {
				case 'e':
					return null;
				case 'n':
					return parseFloat(value);
				case 'b':
					return (value == '1');
				case 'a':
					all = [];
					if(value != ''){
						values = value.split('^');
						vLen   = values.length;

						for (v = 0; v < vLen; v++) {
							value = values[v];
							all.push(decodeValue(value));
						}
					}
					return all;
				case 'o':
					all = {};
					if(value != ''){
						values = value.split('^');
						vLen   = values.length;

						for (v = 0; v < vLen; v++) {
							value = values[v];
							keyValue         = value.split('=');
							all[keyValue[0]] = decodeValue(keyValue[1]);
						}
					}
					return all;
				default:
					return value;
			}
		}

		return decodeValue
	}
)
