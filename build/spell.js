var need = {
	modules: {}
}


var resolveDependencies = function( moduleName, config ) {
	if( moduleName === undefined ||
		moduleName === "" ) {

		throw "No module name was provided."
	}


	var module = need.modules[ moduleName ]

	if( module === undefined ||
		module.definition === undefined ) {

		throw "Unable to find module definition for module '" + moduleName + "'."
	}


	var dependencies = module.definition[ 0 ]
	var callback     = module.definition[ 1 ]

	var args = []

	for( var i = 0; i < dependencies.length; i++ ) {
		var name = dependencies[ i ]

		if( need.modules[ name ] === undefined ) {
			throw 'Could not find module definition for dependency "' + name + '" of module "' + moduleName + '" . Is it included and registered via define?'
		}

		if( need.modules[ name ].instance === undefined ) {
			need.modules[ name ].instance = resolveDependencies( dependencies[ i ] )
		}

		args.push(
			need.modules[ name ].instance
		)
	}

	if( config ) {
		args.push( config )
	}

	return callback.apply( null, args )
}


var define = function( name, dependencies, callback ) {
	if( arguments.length < 2 ||
		arguments.length > 3 ) {

		throw "Definition is invalid."
	}


	if( arguments.length === 2 ) {
		// No dependencies were provided. Thus arguments looks like this [ name, constructor ].

		callback = dependencies
		dependencies = []
	}

	var module = {
		definition: [ dependencies, callback ]
	}

	need.modules[ name ] = module
}


var require = function( dependencies, callback ) {
	if( dependencies === undefined ||
		callback === undefined ) {

		throw "The provided arguments do not match."
	}


	var args = []

	for( var i = 0; i < dependencies.length; i++ ) {
		args.push(
			resolveDependencies( dependencies[ i ] )
		)
	}


	callback.apply( null, args )
}


var enterMain = function( mainModuleName, args ) {
	resolveDependencies( mainModuleName, args )

//	var wrapper = function() {
//		resolveDependencies( mainModuleName, args )
//	}
//
//	// the web client must wait until the dom construction is finished
//	var isBrowser = !!( typeof window !== "undefined" && navigator && document )
//
//	if( !isBrowser ) {
//		wrapper()
//		return
//	}
//
//	if( document.addEventListener ) {
//		document.addEventListener(
//			"DOMContentLoaded",
//			wrapper,
//			false
//		)
//
//	} else if( document.attachEvent ) {
//		// this is for IE
//		document.attachEvent(
//			"onreadystatechange",
//			wrapper
//		)
//	}
}

define('spell/shared/util/create',[],
	function() {
		"use strict"


		var create = function( constructor, args ) {
			if ( constructor.prototype === undefined ) {
				throw create.NO_CONSTRUCTOR_ERROR + constructor
			}

			var object = {}
			object.prototype = constructor.prototype
			var returnedObject = constructor.apply( object, args )
			return returnedObject || object
		}


		create.NO_CONSTRUCTOR_ERROR = "The first argument for create must be a constructor. You passed in "


		return create
	}
)
;
define(
	"spell/shared/util/entities/EntityManager",
	[
		"spell/shared/util/create"
	],
	function(
		create
	) {
		"use strict"

		var nextEntityId = 0

		var getNextEntityId = function() {
			return nextEntityId++
		}


		var EntityManager = function( blueprintManager ) {
			this.blueprintManager = blueprintManager

			this.nextId = 0
		}


		EntityManager.COMPONENT_TYPE_NOT_KNOWN = "The type of component you tried to add is not known. Component type: "
		EntityManager.ENTITY_TYPE_NOT_KNOWN    = "The type of entity you tried to create is not known. Entity type: "


		EntityManager.prototype = {
			createEntity: function( blueprintId, entityConfig ) {
				if( !this.blueprintManager.hasBlueprint( blueprintId ) ) throw 'Error: Unknown blueprint \'' + blueprintId + '\'. Could not create entity.'

				var entity = this.blueprintManager.createEntity( blueprintId, entityConfig )
				entity.id = getNextEntityId()

				return entity
			}//,

//			addComponent: function( entity, componentType, args ) {
//				var constructor = this.componentConstructors[ componentType ]
//
//				if ( constructor === undefined ) {
//					throw EntityManager.COMPONENT_TYPE_NOT_KNOWN + componentType
//				}
//
//				var component = create( constructor, args )
//				entity[ componentType ] = component
//
//				return component
//			},
//
//			removeComponent: function( entity, componentType ) {
//				var component = entity[ componentType ]
//
//				delete entity[ componentType ]
//
//				return component
//			}
		}


		return EntityManager
	}
)
;
define('jsonPath',[],
	function() {
		/* JSONPath 0.8.0 - XPath for JSON
		 *
		 * Copyright (c) 2007 Stefan Goessner (goessner.net)
		 * Licensed under the MIT (MIT-LICENSE.txt) licence.
		 */

		return function (obj, expr, arg) {
			var P = {
				resultType: arg && arg.resultType || "VALUE",
				result: [],
				normalize: function(expr) {
					var subx = [];
					return expr.replace(/[\['](\??\(.*?\))[\]']/g, function($0,$1){return "[#"+(subx.push($1)-1)+"]";})
							.replace(/'?\.'?|\['?/g, ";")
							.replace(/;;;|;;/g, ";..;")
							.replace(/;$|'?\]|'$/g, "")
							.replace(/#([0-9]+)/g, function($0,$1){return subx[$1];});
				},
				asPath: function(path) {
					var x = path.split(";"), p = "$";
					for (var i=1,n=x.length; i<n; i++)
						p += /^[0-9*]+$/.test(x[i]) ? ("["+x[i]+"]") : ("['"+x[i]+"']");
					return p;
				},
				store: function(p, v) {
					if (p) P.result[P.result.length] = P.resultType == "PATH" ? P.asPath(p) : v;
					return !!p;
				},
				trace: function(expr, val, path) {
					if (expr) {
						var x = expr.split(";"), loc = x.shift();
						x = x.join(";");
						if (val && val.hasOwnProperty(loc))
							P.trace(x, val[loc], path + ";" + loc);
						else if (loc === "*")
							P.walk(loc, x, val, path, function(m,l,x,v,p) { P.trace(m+";"+x,v,p); });
						else if (loc === "..") {
							P.trace(x, val, path);
							P.walk(loc, x, val, path, function(m,l,x,v,p) { typeof v[m] === "object" && P.trace("..;"+x,v[m],p+";"+m); });
						}
						else if (/,/.test(loc)) { // [name1,name2,...]
							for (var s=loc.split(/'?,'?/),i=0,n=s.length; i<n; i++)
								P.trace(s[i]+";"+x, val, path);
						}
						else if (/^\(.*?\)$/.test(loc)) // [(expr)]
							P.trace(P.eval(loc, val, path.substr(path.lastIndexOf(";")+1))+";"+x, val, path);
						else if (/^\?\(.*?\)$/.test(loc)) // [?(expr)]
							P.walk(loc, x, val, path, function(m,l,x,v,p) { if (P.eval(l.replace(/^\?\((.*?)\)$/,"$1"),v[m],m)) P.trace(m+";"+x,v,p); });
						else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(loc)) // [start:end:step]  phyton slice syntax
							P.slice(loc, x, val, path);
					}
					else
						P.store(path, val);
				},
				walk: function(loc, expr, val, path, f) {
					if (val instanceof Array) {
						for (var i=0,n=val.length; i<n; i++)
							if (i in val)
								f(i,loc,expr,val,path);
					}
					else if (typeof val === "object") {
						for (var m in val)
							if (val.hasOwnProperty(m))
								f(m,loc,expr,val,path);
					}
				},
				slice: function(loc, expr, val, path) {
					if (val instanceof Array) {
						var len=val.length, start=0, end=len, step=1;
						loc.replace(/^(-?[0-9]*):(-?[0-9]*):?(-?[0-9]*)$/g, function($0,$1,$2,$3){start=parseInt($1||start);end=parseInt($2||end);step=parseInt($3||step);});
						start = (start < 0) ? Math.max(0,start+len) : Math.min(len,start);
						end   = (end < 0)   ? Math.max(0,end+len)   : Math.min(len,end);
						for (var i=start; i<end; i+=step)
							P.trace(i+";"+expr, val, path);
					}
				},
				eval: function(x, _v, _vname) {
					try { return $ && _v && eval(x.replace(/@/g, "_v")); }
					catch(e) { throw new SyntaxError("jsonPath: " + e.message + ": " + x.replace(/@/g, "_v").replace(/\^/g, "_a")); }
				}
			};

			var $ = obj;
			if (expr && obj && (P.resultType == "VALUE" || P.resultType == "PATH")) {
				P.trace(P.normalize(expr).replace(/^\$;/,""), obj, "$");
				return P.result.length ? P.result : false;
			}
		}
	}
)
;
define('spell/shared/util/input/keyCodes',[],
	function() {
		return {
			"backspace": 8,
			"tab"      : 9,
			"enter"    : 13,
			"shift"    : 16,
			"ctrl"     : 17,
			"alt"      : 18,
			"pause"    : 19,
			"caps lock": 20,
			"escape"   : 27,
			"space"    : 32,
			"page up"  : 33,
			"page down": 34,
			"end"      : 35,
			"home"     : 36,
			"left arrow": 37,
			"up arrow"  : 38,
			"right arrow": 39,
			"down arrow" : 40,
			"insert"     : 45,
			"delete"     : 46,
			"0"          : 48,
			"1"          : 49,
			"2"          : 50,
			"3"          : 51,
			"4"          : 52,
			"5"          : 53,
			"6"          : 54,
			"7"          : 55,
			"8"          : 56,
			"9"          : 57,
			"a"          : 65,
			"b"          : 66,
			"c"          : 67,
			"d"          : 68,
			"e"          : 69,
			"f"          : 70,
			"g"          : 71,
			"h"          : 72,
			"i"          : 73,
			"j"          : 74,
			"k"          : 75,
			"l"          : 76,
			"m"          : 77,
			"n"          : 78,
			"o"          : 79,
			"p"          : 80,
			"q"          : 81,
			"r"          : 82,
			"s"          : 83,
			"t"          : 84,
			"u"          : 85,
			"v"          : 86,
			"w"          : 87,
			"x"          : 88,
			"y"          : 89,
			"z"          : 90,
			"left window key": 91,
			"right window key": 92,
			"select key"      : 93,
			"numpad 0"        : 96,
			"numpad 1"        : 97,
			"numpad 2"        : 98,
			"numpad 3"        : 99,
			"numpad 4"        : 100,
			"numpad 5"        : 101,
			"numpad 6"        : 102,
			"numpad 7"        : 103,
			"numpad 8"        : 104,
			"numpad 9"        : 105,
			"multiply"        : 106,
			"add"             : 107,
			"subtract"        : 109,
			"decimal point"   : 110,
			"divide"          : 111,
			"f1"              : 112,
			"f2"              : 113,
			"f3"              : 114,
			"f4"              : 115,
			"f5"              : 116,
			"f6"              : 117,
			"f7"              : 118,
			"f8"              : 119,
			"f9"              : 120,
			"f10"             : 121,
			"f11"             : 122,
			"f12"             : 123,
			"num lock"        : 144,
			"scroll lock"     : 145,
			"semi-colon"      : 186,
			"equal sign"      : 187,
			"comma"           : 188,
			"dash"            : 189,
			"period"          : 190,
			"forward slash"   : 191,
			"grave accent"    : 192,
			"open bracket"    : 219,
			"back slash"      : 220,
			"close bracket"   : 221,
			"single quote"    : 222
		}
	}
)
;
define('spell/shared/util/math',[],
	function(
	) {
		"use strict"


		var clamp = function( value, lowerBound, upperBound ) {
			if ( value < lowerBound) return lowerBound;
			if ( value > upperBound) return upperBound;

			return value;
		}

		var isInInterval = function( value, lowerBound, upperBound ) {
			return ( value >= lowerBound && value <= upperBound )
		}


		return {
			clamp : clamp,
			isInInterval : isInInterval
		}
	}
)
;
define('spell/shared/util/platform/log',[],
	function() {
		'use strict'


		var log = function( message ) {
			if( console === undefined ) return


			var now = new Date()

			console.log( '[' + now.toDateString() + ' ' + now.toLocaleTimeString() + '] ' +  message )
		}

		return log
	}
)
;
define(
	'spell/shared/util/Logger',
	[
		'spell/shared/util/platform/log'
	],
	function(
		log
	) {
		'use strict'


		/**
		 * private
		 */

		var LOG_LEVEL_DEBUG = 0
		var LOG_LEVEL_INFO  = 1
		var LOG_LEVEL_WARN  = 2
		var LOG_LEVEL_ERROR = 3

		var logLevels = [
			'DEBUG',
			'INFO',
			'WARN',
			'ERROR'
		]

		var currentLogLevel = LOG_LEVEL_INFO


		var setLogLevel = function( level ) {
			currentLogLevel = level
		}

		var logWrapper = function( level, message ) {
			if( level < 0 ||
				level > 3 ) {

				throw 'Log level ' + logLevels[ level ] + ' is not supported.'
			}

			if( level < currentLogLevel ) return


			log( logLevels[ level ] + ' - ' + message )
		}

		var debug = function( message ) {
			logWrapper( LOG_LEVEL_DEBUG, message )
		}

		var info = function( message ) {
			logWrapper( LOG_LEVEL_INFO, message )
		}

		var warn = function( message ) {
			logWrapper( LOG_LEVEL_WARN, message )
		}

		var error = function( message ) {
			logWrapper( LOG_LEVEL_ERROR, message )
		}


		/**
		 * public
		 */

		return {
			LOG_LEVEL_DEBUG : LOG_LEVEL_DEBUG,
			LOG_LEVEL_INFO  : LOG_LEVEL_INFO,
			LOG_LEVEL_WARN  : LOG_LEVEL_WARN,
			LOG_LEVEL_ERROR : LOG_LEVEL_ERROR,
			setLogLevel     : setLogLevel,
			log             : logWrapper,
			debug           : debug,
			info            : info,
			warn            : warn,
			error           : error
		}
	}
)
;
define('spell/shared/util/platform/private/createSocket',[],
	function() {
		"use strict"

		return function( host ) {
			var WebSocket = window.MozWebSocket || window.WebSocket
			var socket = new WebSocket( "ws://" + host + "/", 'socketrocket-0.1');

			return {
				send: function( message ) {
					socket.send( message )
				},
				setOnMessage: function( callback ) {
					socket.onmessage = function( event ) {
						callback( event.data )
					}
				},
				setOnConnected: function( callback ) {
					socket.onopen = function( event ) {
						callback( event.data )
					}
				}
			}
		}
	}
)
;
define('spell/shared/util/platform/private/createNativeFloatArray',[],
	function() {
		"use strict"


		var arrayType = ( ( typeof Float32Array !== 'undefined' ) ? Float32Array : Array )

		return function( length ) {
			return new arrayType( length )
		}
	}
)
;
define('spell/shared/util/platform/private/Time',[],
	function() {
		"use strict"

		return {
			/**
			 * Returns the number of milliseconds since midnight January 1, 1970, UTC.
			 */
			getCurrentInMs: function() {
				return Date.now()
			}
		}
	}
)
;
define(
	"spell/shared/util/platform/Types",
	[
		"spell/shared/util/platform/private/createNativeFloatArray",
		"spell/shared/util/platform/private/Time"
	],
	function(
		createNativeFloatArray,
		Time
	) {
		"use strict"

		return {
			createNativeFloatArray : createNativeFloatArray,
			Time                   : Time
		}
	}
)
;
define(
	"glmatrix/glmatrix",
	[
		"spell/shared/util/platform/Types"
	],
	function(
		Types
	) {
		/**
		 * @fileOverview gl-matrix - High performance matrix and vector operations for WebGL
		 * @author Brandon Jones
		 * @version 1.2.3
		 */

		/*
		 * Copyright (c) 2011 Brandon Jones
		 *
		 * This software is provided 'as-is', without any express or implied
		 * warranty. In no event will the authors be held liable for any damages
		 * arising from the use of this software.
		 *
		 * Permission is granted to anyone to use this software for any purpose,
		 * including commercial applications, and to alter it and redistribute it
		 * freely, subject to the following restrictions:
		 *
		 *    1. The origin of this software must not be misrepresented; you must not
		 *    claim that you wrote the original software. If you use this software
		 *    in a product, an acknowledgment in the product documentation would be
		 *    appreciated but is not required.
		 *
		 *    2. Altered source versions must be plainly marked as such, and must not
		 *    be misrepresented as being the original software.
		 *
		 *    3. This notice may not be removed or altered from any source
		 *    distribution.
		 */

		

		// Type declarations
		// account for CommonJS environments

		/**
		 * @class 3 Dimensional Vector
		 * @name vec3
		 */
		var vec3 = {};

		/**
		 * @class 3x3 Matrix
		 * @name mat3
		 */
		var mat3 = {};

		/**
		 * @class 4x4 Matrix
		 * @name mat4
		 */
		var mat4 = {};

		/**
		 * @class Quaternion
		 * @name quat4
		 */
		var quat4 = {};


		var createArray = Types.createNativeFloatArray;


		/*
		 * vec3
		 */

		/**
		 * Creates a new instance of a vec3 using the default array type
		 * Any javascript array-like objects containing at least 3 numeric elements can serve as a vec3
		 *
		 * @param {vec3} [vec] vec3 containing values to initialize with
		 *
		 * @returns {vec3} New vec3
		 */
		vec3.create = function (vec) {
			var dest = createArray(3);

			if (vec) {
				dest[0] = vec[0];
				dest[1] = vec[1];
				dest[2] = vec[2];
			} else {
				dest[0] = dest[1] = dest[2] = 0;
			}

			return dest;
		};

		/**
		 * Copies the values of one vec3 to another
		 *
		 * @param {vec3} vec vec3 containing values to copy
		 * @param {vec3} dest vec3 receiving copied values
		 *
		 * @returns {vec3} dest
		 */
		vec3.set = function (vec, dest) {
			dest[0] = vec[0];
			dest[1] = vec[1];
			dest[2] = vec[2];

			return dest;
		};

		/**
		 * Performs a vector addition
		 *
		 * @param {vec3} vec First operand
		 * @param {vec3} vec2 Second operand
		 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {vec3} dest if specified, vec otherwise
		 */
		vec3.add = function (vec, vec2, dest) {
			if (!dest || vec === dest) {
				vec[0] += vec2[0];
				vec[1] += vec2[1];
				vec[2] += vec2[2];
				return vec;
			}

			dest[0] = vec[0] + vec2[0];
			dest[1] = vec[1] + vec2[1];
			dest[2] = vec[2] + vec2[2];
			return dest;
		};

		/**
		 * Performs a vector subtraction
		 *
		 * @param {vec3} vec First operand
		 * @param {vec3} vec2 Second operand
		 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {vec3} dest if specified, vec otherwise
		 */
		vec3.subtract = function (vec, vec2, dest) {
			if (!dest || vec === dest) {
				vec[0] -= vec2[0];
				vec[1] -= vec2[1];
				vec[2] -= vec2[2];
				return vec;
			}

			dest[0] = vec[0] - vec2[0];
			dest[1] = vec[1] - vec2[1];
			dest[2] = vec[2] - vec2[2];
			return dest;
		};

		/**
		 * Performs a vector multiplication
		 *
		 * @param {vec3} vec First operand
		 * @param {vec3} vec2 Second operand
		 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {vec3} dest if specified, vec otherwise
		 */
		vec3.multiply = function (vec, vec2, dest) {
			if (!dest || vec === dest) {
				vec[0] *= vec2[0];
				vec[1] *= vec2[1];
				vec[2] *= vec2[2];
				return vec;
			}

			dest[0] = vec[0] * vec2[0];
			dest[1] = vec[1] * vec2[1];
			dest[2] = vec[2] * vec2[2];
			return dest;
		};

		/**
		 * Negates the components of a vec3
		 *
		 * @param {vec3} vec vec3 to negate
		 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {vec3} dest if specified, vec otherwise
		 */
		vec3.negate = function (vec, dest) {
			if (!dest) { dest = vec; }

			dest[0] = -vec[0];
			dest[1] = -vec[1];
			dest[2] = -vec[2];
			return dest;
		};

		/**
		 * Multiplies the components of a vec3 by a scalar value
		 *
		 * @param {vec3} vec vec3 to scale
		 * @param {number} val Value to scale by
		 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {vec3} dest if specified, vec otherwise
		 */
		vec3.scale = function (vec, val, dest) {
			if (!dest || vec === dest) {
				vec[0] *= val;
				vec[1] *= val;
				vec[2] *= val;
				return vec;
			}

			dest[0] = vec[0] * val;
			dest[1] = vec[1] * val;
			dest[2] = vec[2] * val;
			return dest;
		};

		/**
		 * Generates a unit vector of the same direction as the provided vec3
		 * If vector length is 0, returns [0, 0, 0]
		 *
		 * @param {vec3} vec vec3 to normalize
		 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {vec3} dest if specified, vec otherwise
		 */
		vec3.normalize = function (vec, dest) {
			if (!dest) { dest = vec; }

			var x = vec[0], y = vec[1], z = vec[2],
				len = Math.sqrt(x * x + y * y + z * z);

			if (!len) {
				dest[0] = 0;
				dest[1] = 0;
				dest[2] = 0;
				return dest;
			} else if (len === 1) {
				dest[0] = x;
				dest[1] = y;
				dest[2] = z;
				return dest;
			}

			len = 1 / len;
			dest[0] = x * len;
			dest[1] = y * len;
			dest[2] = z * len;
			return dest;
		};

		/**
		 * Generates the cross product of two vec3s
		 *
		 * @param {vec3} vec First operand
		 * @param {vec3} vec2 Second operand
		 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {vec3} dest if specified, vec otherwise
		 */
		vec3.cross = function (vec, vec2, dest) {
			if (!dest) { dest = vec; }

			var x = vec[0], y = vec[1], z = vec[2],
				x2 = vec2[0], y2 = vec2[1], z2 = vec2[2];

			dest[0] = y * z2 - z * y2;
			dest[1] = z * x2 - x * z2;
			dest[2] = x * y2 - y * x2;
			return dest;
		};

		/**
		 * Caclulates the length of a vec3
		 *
		 * @param {vec3} vec vec3 to calculate length of
		 *
		 * @returns {number} Length of vec
		 */
		vec3.length = function (vec) {
			var x = vec[0], y = vec[1], z = vec[2];
			return Math.sqrt(x * x + y * y + z * z);
		};

		/**
		 * Caclulates the dot product of two vec3s
		 *
		 * @param {vec3} vec First operand
		 * @param {vec3} vec2 Second operand
		 *
		 * @returns {number} Dot product of vec and vec2
		 */
		vec3.dot = function (vec, vec2) {
			return vec[0] * vec2[0] + vec[1] * vec2[1] + vec[2] * vec2[2];
		};

		/**
		 * Generates a unit vector pointing from one vector to another
		 *
		 * @param {vec3} vec Origin vec3
		 * @param {vec3} vec2 vec3 to point to
		 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {vec3} dest if specified, vec otherwise
		 */
		vec3.direction = function (vec, vec2, dest) {
			if (!dest) { dest = vec; }

			var x = vec[0] - vec2[0],
				y = vec[1] - vec2[1],
				z = vec[2] - vec2[2],
				len = Math.sqrt(x * x + y * y + z * z);

			if (!len) {
				dest[0] = 0;
				dest[1] = 0;
				dest[2] = 0;
				return dest;
			}

			len = 1 / len;
			dest[0] = x * len;
			dest[1] = y * len;
			dest[2] = z * len;
			return dest;
		};

		/**
		 * Performs a linear interpolation between two vec3
		 *
		 * @param {vec3} vec First vector
		 * @param {vec3} vec2 Second vector
		 * @param {number} lerp Interpolation amount between the two inputs
		 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {vec3} dest if specified, vec otherwise
		 */
		vec3.lerp = function (vec, vec2, lerp, dest) {
			if (!dest) { dest = vec; }

			dest[0] = vec[0] + lerp * (vec2[0] - vec[0]);
			dest[1] = vec[1] + lerp * (vec2[1] - vec[1]);
			dest[2] = vec[2] + lerp * (vec2[2] - vec[2]);

			return dest;
		};

		/**
		 * Calculates the euclidian distance between two vec3
		 *
		 * Params:
		 * @param {vec3} vec First vector
		 * @param {vec3} vec2 Second vector
		 *
		 * @returns {number} Distance between vec and vec2
		 */
		vec3.dist = function (vec, vec2) {
			var x = vec2[0] - vec[0],
				y = vec2[1] - vec[1],
				z = vec2[2] - vec[2];

			return Math.sqrt(x*x + y*y + z*z);
		};

		/**
		 * Projects the specified vec3 from screen space into object space
		 * Based on the <a href="http://webcvs.freedesktop.org/mesa/Mesa/src/glu/mesa/project.c?revision=1.4&view=markup">Mesa gluUnProject implementation</a>
		 *
		 * @param {vec3} vec Screen-space vector to project
		 * @param {mat4} view View matrix
		 * @param {mat4} proj Projection matrix
		 * @param {vec4} viewport Viewport as given to gl.viewport [x, y, width, height]
		 * @param {vec3} [dest] vec3 receiving unprojected result. If not specified result is written to vec
		 *
		 * @returns {vec3} dest if specified, vec otherwise
		 */
		vec3.unproject = function (vec, view, proj, viewport, dest) {
			if (!dest) { dest = vec; }

			var m = mat4.create();
			var v = createArray(4);

			v[0] = (vec[0] - viewport[0]) * 2.0 / viewport[2] - 1.0;
			v[1] = (vec[1] - viewport[1]) * 2.0 / viewport[3] - 1.0;
			v[2] = 2.0 * vec[2] - 1.0;
			v[3] = 1.0;

			mat4.multiply(proj, view, m);
			if(!mat4.inverse(m)) { return null; }

			mat4.multiplyVec4(m, v);
			if(v[3] === 0.0) { return null; }

			dest[0] = v[0] / v[3];
			dest[1] = v[1] / v[3];
			dest[2] = v[2] / v[3];

			return dest;
		};

		/**
		 * Returns a string representation of a vector
		 *
		 * @param {vec3} vec Vector to represent as a string
		 *
		 * @returns {string} String representation of vec
		 */
		vec3.str = function (vec) {
			return '[' + vec[0] + ', ' + vec[1] + ', ' + vec[2] + ']';
		};

		/*
		 * vec3.reflect
		 * Reflects a vector on a normal
		 *
		 * Params:
		 * vec - vec3, vector to reflect
		 * normal - vec3, the normal to reflect by
		 *
		 * Returns:
		 * vec
		 */
		vec3.reflect = function(vec, normal) {
			var tmp = vec3.create(normal);
			vec3.normalize(tmp);
			var normal_dot_vec = vec3.dot(tmp, vec);
			vec3.scale(tmp, -2 * normal_dot_vec);
			vec3.add(vec, tmp);

			return vec;
		};

		vec3.reset = function(vec) {
			vec[0] = vec[1] = vec[2] = 0
		}

		/*
		 * mat3
		 */

		/**
		 * Creates a new instance of a mat3 using the default array type
		 * Any javascript array-like object containing at least 9 numeric elements can serve as a mat3
		 *
		 * @param {mat3} [mat] mat3 containing values to initialize with
		 *
		 * @returns {mat3} New mat3
		 */
		mat3.create = function (mat) {
			var dest = createArray(9);

			if (mat) {
				dest[0] = mat[0];
				dest[1] = mat[1];
				dest[2] = mat[2];
				dest[3] = mat[3];
				dest[4] = mat[4];
				dest[5] = mat[5];
				dest[6] = mat[6];
				dest[7] = mat[7];
				dest[8] = mat[8];
			}

			return dest;
		};

		/**
		 * Copies the values of one mat3 to another
		 *
		 * @param {mat3} mat mat3 containing values to copy
		 * @param {mat3} dest mat3 receiving copied values
		 *
		 * @returns {mat3} dest
		 */
		mat3.set = function (mat, dest) {
			dest[0] = mat[0];
			dest[1] = mat[1];
			dest[2] = mat[2];
			dest[3] = mat[3];
			dest[4] = mat[4];
			dest[5] = mat[5];
			dest[6] = mat[6];
			dest[7] = mat[7];
			dest[8] = mat[8];
			return dest;
		};

		/**
		 * Sets a mat3 to an identity matrix
		 *
		 * @param {mat3} dest mat3 to set
		 *
		 * @returns dest if specified, otherwise a new mat3
		 */
		mat3.identity = function (dest) {
			if (!dest) { dest = mat3.create(); }
			dest[0] = 1;
			dest[1] = 0;
			dest[2] = 0;
			dest[3] = 0;
			dest[4] = 1;
			dest[5] = 0;
			dest[6] = 0;
			dest[7] = 0;
			dest[8] = 1;
			return dest;
		};

		/**
		 * Transposes a mat3 (flips the values over the diagonal)
		 *
		 * Params:
		 * @param {mat3} mat mat3 to transpose
		 * @param {mat3} [dest] mat3 receiving transposed values. If not specified result is written to mat
		 *
		 * @returns {mat3} dest is specified, mat otherwise
		 */
		mat3.transpose = function (mat, dest) {
			// If we are transposing ourselves we can skip a few steps but have to cache some values
			if (!dest || mat === dest) {
				var a01 = mat[1], a02 = mat[2],
					a12 = mat[5];

				mat[1] = mat[3];
				mat[2] = mat[6];
				mat[3] = a01;
				mat[5] = mat[7];
				mat[6] = a02;
				mat[7] = a12;
				return mat;
			}

			dest[0] = mat[0];
			dest[1] = mat[3];
			dest[2] = mat[6];
			dest[3] = mat[1];
			dest[4] = mat[4];
			dest[5] = mat[7];
			dest[6] = mat[2];
			dest[7] = mat[5];
			dest[8] = mat[8];
			return dest;
		};

		/**
		 * Copies the elements of a mat3 into the upper 3x3 elements of a mat4
		 *
		 * @param {mat3} mat mat3 containing values to copy
		 * @param {mat4} [dest] mat4 receiving copied values
		 *
		 * @returns {mat4} dest if specified, a new mat4 otherwise
		 */
		mat3.toMat4 = function (mat, dest) {
			if (!dest) { dest = mat4.create(); }

			dest[15] = 1;
			dest[14] = 0;
			dest[13] = 0;
			dest[12] = 0;

			dest[11] = 0;
			dest[10] = mat[8];
			dest[9] = mat[7];
			dest[8] = mat[6];

			dest[7] = 0;
			dest[6] = mat[5];
			dest[5] = mat[4];
			dest[4] = mat[3];

			dest[3] = 0;
			dest[2] = mat[2];
			dest[1] = mat[1];
			dest[0] = mat[0];

			return dest;
		};

		/**
		 * Returns a string representation of a mat3
		 *
		 * @param {mat3} mat mat3 to represent as a string
		 *
		 * @param {string} String representation of mat
		 */
		mat3.str = function (mat) {
			return '[' + mat[0] + ', ' + mat[1] + ', ' + mat[2] +
				', ' + mat[3] + ', ' + mat[4] + ', ' + mat[5] +
				', ' + mat[6] + ', ' + mat[7] + ', ' + mat[8] + ']';
		};

		/*
		 * mat4
		 */

		/**
		 * Creates a new instance of a mat4 using the default array type
		 * Any javascript array-like object containing at least 16 numeric elements can serve as a mat4
		 *
		 * @param {mat4} [mat] mat4 containing values to initialize with
		 *
		 * @returns {mat4} New mat4
		 */
		mat4.create = function (mat) {
			var dest = createArray(16);

			if (mat) {
				dest[0] = mat[0];
				dest[1] = mat[1];
				dest[2] = mat[2];
				dest[3] = mat[3];
				dest[4] = mat[4];
				dest[5] = mat[5];
				dest[6] = mat[6];
				dest[7] = mat[7];
				dest[8] = mat[8];
				dest[9] = mat[9];
				dest[10] = mat[10];
				dest[11] = mat[11];
				dest[12] = mat[12];
				dest[13] = mat[13];
				dest[14] = mat[14];
				dest[15] = mat[15];
			}

			return dest;
		};

		/**
		 * Copies the values of one mat4 to another
		 *
		 * @param {mat4} mat mat4 containing values to copy
		 * @param {mat4} dest mat4 receiving copied values
		 *
		 * @returns {mat4} dest
		 */
		mat4.set = function (mat, dest) {
			dest[0] = mat[0];
			dest[1] = mat[1];
			dest[2] = mat[2];
			dest[3] = mat[3];
			dest[4] = mat[4];
			dest[5] = mat[5];
			dest[6] = mat[6];
			dest[7] = mat[7];
			dest[8] = mat[8];
			dest[9] = mat[9];
			dest[10] = mat[10];
			dest[11] = mat[11];
			dest[12] = mat[12];
			dest[13] = mat[13];
			dest[14] = mat[14];
			dest[15] = mat[15];
			return dest;
		};

		/**
		 * Sets a mat4 to an identity matrix
		 *
		 * @param {mat4} dest mat4 to set
		 *
		 * @returns {mat4} dest
		 */
		mat4.identity = function (dest) {
			if (!dest) { dest = mat4.create(); }
			dest[0] = 1;
			dest[1] = 0;
			dest[2] = 0;
			dest[3] = 0;
			dest[4] = 0;
			dest[5] = 1;
			dest[6] = 0;
			dest[7] = 0;
			dest[8] = 0;
			dest[9] = 0;
			dest[10] = 1;
			dest[11] = 0;
			dest[12] = 0;
			dest[13] = 0;
			dest[14] = 0;
			dest[15] = 1;
			return dest;
		};

		/**
		 * Transposes a mat4 (flips the values over the diagonal)
		 *
		 * @param {mat4} mat mat4 to transpose
		 * @param {mat4} [dest] mat4 receiving transposed values. If not specified result is written to mat
		 *
		 * @param {mat4} dest is specified, mat otherwise
		 */
		mat4.transpose = function (mat, dest) {
			// If we are transposing ourselves we can skip a few steps but have to cache some values
			if (!dest || mat === dest) {
				var a01 = mat[1], a02 = mat[2], a03 = mat[3],
					a12 = mat[6], a13 = mat[7],
					a23 = mat[11];

				mat[1] = mat[4];
				mat[2] = mat[8];
				mat[3] = mat[12];
				mat[4] = a01;
				mat[6] = mat[9];
				mat[7] = mat[13];
				mat[8] = a02;
				mat[9] = a12;
				mat[11] = mat[14];
				mat[12] = a03;
				mat[13] = a13;
				mat[14] = a23;
				return mat;
			}

			dest[0] = mat[0];
			dest[1] = mat[4];
			dest[2] = mat[8];
			dest[3] = mat[12];
			dest[4] = mat[1];
			dest[5] = mat[5];
			dest[6] = mat[9];
			dest[7] = mat[13];
			dest[8] = mat[2];
			dest[9] = mat[6];
			dest[10] = mat[10];
			dest[11] = mat[14];
			dest[12] = mat[3];
			dest[13] = mat[7];
			dest[14] = mat[11];
			dest[15] = mat[15];
			return dest;
		};

		/**
		 * Calculates the determinant of a mat4
		 *
		 * @param {mat4} mat mat4 to calculate determinant of
		 *
		 * @returns {number} determinant of mat
		 */
		mat4.determinant = function (mat) {
			// Cache the matrix values (makes for huge speed increases!)
			var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3],
				a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7],
				a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11],
				a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];

			return (a30 * a21 * a12 * a03 - a20 * a31 * a12 * a03 - a30 * a11 * a22 * a03 + a10 * a31 * a22 * a03 +
					a20 * a11 * a32 * a03 - a10 * a21 * a32 * a03 - a30 * a21 * a02 * a13 + a20 * a31 * a02 * a13 +
					a30 * a01 * a22 * a13 - a00 * a31 * a22 * a13 - a20 * a01 * a32 * a13 + a00 * a21 * a32 * a13 +
					a30 * a11 * a02 * a23 - a10 * a31 * a02 * a23 - a30 * a01 * a12 * a23 + a00 * a31 * a12 * a23 +
					a10 * a01 * a32 * a23 - a00 * a11 * a32 * a23 - a20 * a11 * a02 * a33 + a10 * a21 * a02 * a33 +
					a20 * a01 * a12 * a33 - a00 * a21 * a12 * a33 - a10 * a01 * a22 * a33 + a00 * a11 * a22 * a33);
		};

		/**
		 * Calculates the inverse matrix of a mat4
		 *
		 * @param {mat4} mat mat4 to calculate inverse of
		 * @param {mat4} [dest] mat4 receiving inverse matrix. If not specified result is written to mat
		 *
		 * @param {mat4} dest is specified, mat otherwise, null if matrix cannot be inverted
		 */
		mat4.inverse = function (mat, dest) {
			if (!dest) { dest = mat; }

			// Cache the matrix values (makes for huge speed increases!)
			var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3],
				a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7],
				a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11],
				a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15],

				b00 = a00 * a11 - a01 * a10,
				b01 = a00 * a12 - a02 * a10,
				b02 = a00 * a13 - a03 * a10,
				b03 = a01 * a12 - a02 * a11,
				b04 = a01 * a13 - a03 * a11,
				b05 = a02 * a13 - a03 * a12,
				b06 = a20 * a31 - a21 * a30,
				b07 = a20 * a32 - a22 * a30,
				b08 = a20 * a33 - a23 * a30,
				b09 = a21 * a32 - a22 * a31,
				b10 = a21 * a33 - a23 * a31,
				b11 = a22 * a33 - a23 * a32,

				d = (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06),
				invDet;

				// Calculate the determinant
				if (!d) { return null; }
				invDet = 1 / d;

			dest[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
			dest[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
			dest[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
			dest[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
			dest[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
			dest[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
			dest[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
			dest[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
			dest[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
			dest[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
			dest[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
			dest[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
			dest[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
			dest[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
			dest[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
			dest[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;

			return dest;
		};

		/**
		 * Copies the upper 3x3 elements of a mat4 into another mat4
		 *
		 * @param {mat4} mat mat4 containing values to copy
		 * @param {mat4} [dest] mat4 receiving copied values
		 *
		 * @returns {mat4} dest is specified, a new mat4 otherwise
		 */
		mat4.toRotationMat = function (mat, dest) {
			if (!dest) { dest = mat4.create(); }

			dest[0] = mat[0];
			dest[1] = mat[1];
			dest[2] = mat[2];
			dest[3] = mat[3];
			dest[4] = mat[4];
			dest[5] = mat[5];
			dest[6] = mat[6];
			dest[7] = mat[7];
			dest[8] = mat[8];
			dest[9] = mat[9];
			dest[10] = mat[10];
			dest[11] = mat[11];
			dest[12] = 0;
			dest[13] = 0;
			dest[14] = 0;
			dest[15] = 1;

			return dest;
		};

		/**
		 * Copies the upper 3x3 elements of a mat4 into a mat3
		 *
		 * @param {mat4} mat mat4 containing values to copy
		 * @param {mat3} [dest] mat3 receiving copied values
		 *
		 * @returns {mat3} dest is specified, a new mat3 otherwise
		 */
		mat4.toMat3 = function (mat, dest) {
			if (!dest) { dest = mat3.create(); }

			dest[0] = mat[0];
			dest[1] = mat[1];
			dest[2] = mat[2];
			dest[3] = mat[4];
			dest[4] = mat[5];
			dest[5] = mat[6];
			dest[6] = mat[8];
			dest[7] = mat[9];
			dest[8] = mat[10];

			return dest;
		};

		/**
		 * Calculates the inverse of the upper 3x3 elements of a mat4 and copies the result into a mat3
		 * The resulting matrix is useful for calculating transformed normals
		 *
		 * Params:
		 * @param {mat4} mat mat4 containing values to invert and copy
		 * @param {mat3} [dest] mat3 receiving values
		 *
		 * @returns {mat3} dest is specified, a new mat3 otherwise, null if the matrix cannot be inverted
		 */
		mat4.toInverseMat3 = function (mat, dest) {
			// Cache the matrix values (makes for huge speed increases!)
			var a00 = mat[0], a01 = mat[1], a02 = mat[2],
				a10 = mat[4], a11 = mat[5], a12 = mat[6],
				a20 = mat[8], a21 = mat[9], a22 = mat[10],

				b01 = a22 * a11 - a12 * a21,
				b11 = -a22 * a10 + a12 * a20,
				b21 = a21 * a10 - a11 * a20,

				d = a00 * b01 + a01 * b11 + a02 * b21,
				id;

			if (!d) { return null; }
			id = 1 / d;

			if (!dest) { dest = mat3.create(); }

			dest[0] = b01 * id;
			dest[1] = (-a22 * a01 + a02 * a21) * id;
			dest[2] = (a12 * a01 - a02 * a11) * id;
			dest[3] = b11 * id;
			dest[4] = (a22 * a00 - a02 * a20) * id;
			dest[5] = (-a12 * a00 + a02 * a10) * id;
			dest[6] = b21 * id;
			dest[7] = (-a21 * a00 + a01 * a20) * id;
			dest[8] = (a11 * a00 - a01 * a10) * id;

			return dest;
		};

		/**
		 * Performs a matrix multiplication
		 *
		 * @param {mat4} mat First operand
		 * @param {mat4} mat2 Second operand
		 * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
		 *
		 * @returns {mat4} dest if specified, mat otherwise
		 */
		mat4.multiply = function (mat, mat2, dest) {
			if (!dest) { dest = mat; }

			// Cache the matrix values (makes for huge speed increases!)
			var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3],
				a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7],
				a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11],
				a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15],

				b00 = mat2[0], b01 = mat2[1], b02 = mat2[2], b03 = mat2[3],
				b10 = mat2[4], b11 = mat2[5], b12 = mat2[6], b13 = mat2[7],
				b20 = mat2[8], b21 = mat2[9], b22 = mat2[10], b23 = mat2[11],
				b30 = mat2[12], b31 = mat2[13], b32 = mat2[14], b33 = mat2[15];

			dest[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
			dest[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
			dest[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
			dest[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
			dest[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
			dest[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
			dest[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
			dest[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
			dest[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
			dest[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
			dest[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
			dest[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
			dest[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
			dest[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
			dest[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
			dest[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;

			return dest;
		};

		/**
		 * Transforms a vec3 with the given matrix
		 * 4th vector component is implicitly '1'
		 *
		 * @param {mat4} mat mat4 to transform the vector with
		 * @param {vec3} vec vec3 to transform
		 * @paran {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {vec3} dest if specified, vec otherwise
		 */
		mat4.multiplyVec3 = function (mat, vec, dest) {
			if (!dest) { dest = vec; }

			var x = vec[0], y = vec[1], z = vec[2];

			dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
			dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
			dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];

			return dest;
		};

		/**
		 * Transforms a vec4 with the given matrix
		 *
		 * @param {mat4} mat mat4 to transform the vector with
		 * @param {vec4} vec vec4 to transform
		 * @param {vec4} [dest] vec4 receiving operation result. If not specified result is written to vec
		 *
		 * @returns {vec4} dest if specified, vec otherwise
		 */
		mat4.multiplyVec4 = function (mat, vec, dest) {
			if (!dest) { dest = vec; }

			var x = vec[0], y = vec[1], z = vec[2], w = vec[3];

			dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12] * w;
			dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13] * w;
			dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14] * w;
			dest[3] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15] * w;

			return dest;
		};

		/**
		 * Translates a matrix by the given vector
		 *
		 * @param {mat4} mat mat4 to translate
		 * @param {vec3} vec vec3 specifying the translation
		 * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
		 *
		 * @returns {mat4} dest if specified, mat otherwise
		 */
		mat4.translate = function (mat, vec, dest) {
			var x = vec[0], y = vec[1], z = vec[2],
				a00, a01, a02, a03,
				a10, a11, a12, a13,
				a20, a21, a22, a23;

			if (!dest || mat === dest) {
				mat[12] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
				mat[13] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
				mat[14] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];
				mat[15] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15];
				return mat;
			}

			a00 = mat[0]; a01 = mat[1]; a02 = mat[2]; a03 = mat[3];
			a10 = mat[4]; a11 = mat[5]; a12 = mat[6]; a13 = mat[7];
			a20 = mat[8]; a21 = mat[9]; a22 = mat[10]; a23 = mat[11];

			dest[0] = a00; dest[1] = a01; dest[2] = a02; dest[3] = a03;
			dest[4] = a10; dest[5] = a11; dest[6] = a12; dest[7] = a13;
			dest[8] = a20; dest[9] = a21; dest[10] = a22; dest[11] = a23;

			dest[12] = a00 * x + a10 * y + a20 * z + mat[12];
			dest[13] = a01 * x + a11 * y + a21 * z + mat[13];
			dest[14] = a02 * x + a12 * y + a22 * z + mat[14];
			dest[15] = a03 * x + a13 * y + a23 * z + mat[15];
			return dest;
		};

		/**
		 * Scales a matrix by the given vector
		 *
		 * @param {mat4} mat mat4 to scale
		 * @param {vec3} vec vec3 specifying the scale for each axis
		 * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
		 *
		 * @param {mat4} dest if specified, mat otherwise
		 */
		mat4.scale = function (mat, vec, dest) {
			var x = vec[0], y = vec[1], z = vec[2];

			if (!dest || mat === dest) {
				mat[0] *= x;
				mat[1] *= x;
				mat[2] *= x;
				mat[3] *= x;
				mat[4] *= y;
				mat[5] *= y;
				mat[6] *= y;
				mat[7] *= y;
				mat[8] *= z;
				mat[9] *= z;
				mat[10] *= z;
				mat[11] *= z;
				return mat;
			}

			dest[0] = mat[0] * x;
			dest[1] = mat[1] * x;
			dest[2] = mat[2] * x;
			dest[3] = mat[3] * x;
			dest[4] = mat[4] * y;
			dest[5] = mat[5] * y;
			dest[6] = mat[6] * y;
			dest[7] = mat[7] * y;
			dest[8] = mat[8] * z;
			dest[9] = mat[9] * z;
			dest[10] = mat[10] * z;
			dest[11] = mat[11] * z;
			dest[12] = mat[12];
			dest[13] = mat[13];
			dest[14] = mat[14];
			dest[15] = mat[15];
			return dest;
		};

		/**
		 * Rotates a matrix by the given angle around the specified axis
		 * If rotating around a primary axis (X,Y,Z) one of the specialized rotation functions should be used instead for performance
		 *
		 * @param {mat4} mat mat4 to rotate
		 * @param {number} angle Angle (in radians) to rotate
		 * @param {vec3} axis vec3 representing the axis to rotate around
		 * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
		 *
		 * @returns {mat4} dest if specified, mat otherwise
		 */
		mat4.rotate = function (mat, angle, axis, dest) {
			var x = axis[0], y = axis[1], z = axis[2],
				len = Math.sqrt(x * x + y * y + z * z),
				s, c, t,
				a00, a01, a02, a03,
				a10, a11, a12, a13,
				a20, a21, a22, a23,
				b00, b01, b02,
				b10, b11, b12,
				b20, b21, b22;

			if (!len) { return null; }
			if (len !== 1) {
				len = 1 / len;
				x *= len;
				y *= len;
				z *= len;
			}

			s = Math.sin(angle);
			c = Math.cos(angle);
			t = 1 - c;

			a00 = mat[0]; a01 = mat[1]; a02 = mat[2]; a03 = mat[3];
			a10 = mat[4]; a11 = mat[5]; a12 = mat[6]; a13 = mat[7];
			a20 = mat[8]; a21 = mat[9]; a22 = mat[10]; a23 = mat[11];

			// Construct the elements of the rotation matrix
			b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
			b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
			b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

			if (!dest) {
				dest = mat;
			} else if (mat !== dest) { // If the source and destination differ, copy the unchanged last row
				dest[12] = mat[12];
				dest[13] = mat[13];
				dest[14] = mat[14];
				dest[15] = mat[15];
			}

			// Perform rotation-specific matrix multiplication
			dest[0] = a00 * b00 + a10 * b01 + a20 * b02;
			dest[1] = a01 * b00 + a11 * b01 + a21 * b02;
			dest[2] = a02 * b00 + a12 * b01 + a22 * b02;
			dest[3] = a03 * b00 + a13 * b01 + a23 * b02;

			dest[4] = a00 * b10 + a10 * b11 + a20 * b12;
			dest[5] = a01 * b10 + a11 * b11 + a21 * b12;
			dest[6] = a02 * b10 + a12 * b11 + a22 * b12;
			dest[7] = a03 * b10 + a13 * b11 + a23 * b12;

			dest[8] = a00 * b20 + a10 * b21 + a20 * b22;
			dest[9] = a01 * b20 + a11 * b21 + a21 * b22;
			dest[10] = a02 * b20 + a12 * b21 + a22 * b22;
			dest[11] = a03 * b20 + a13 * b21 + a23 * b22;
			return dest;
		};

		/**
		 * Rotates a matrix by the given angle around the X axis
		 *
		 * @param {mat4} mat mat4 to rotate
		 * @param {number} angle Angle (in radians) to rotate
		 * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
		 *
		 * @returns {mat4} dest if specified, mat otherwise
		 */
		mat4.rotateX = function (mat, angle, dest) {
			var s = Math.sin(angle),
				c = Math.cos(angle),
				a10 = mat[4],
				a11 = mat[5],
				a12 = mat[6],
				a13 = mat[7],
				a20 = mat[8],
				a21 = mat[9],
				a22 = mat[10],
				a23 = mat[11];

			if (!dest) {
				dest = mat;
			} else if (mat !== dest) { // If the source and destination differ, copy the unchanged rows
				dest[0] = mat[0];
				dest[1] = mat[1];
				dest[2] = mat[2];
				dest[3] = mat[3];

				dest[12] = mat[12];
				dest[13] = mat[13];
				dest[14] = mat[14];
				dest[15] = mat[15];
			}

			// Perform axis-specific matrix multiplication
			dest[4] = a10 * c + a20 * s;
			dest[5] = a11 * c + a21 * s;
			dest[6] = a12 * c + a22 * s;
			dest[7] = a13 * c + a23 * s;

			dest[8] = a10 * -s + a20 * c;
			dest[9] = a11 * -s + a21 * c;
			dest[10] = a12 * -s + a22 * c;
			dest[11] = a13 * -s + a23 * c;
			return dest;
		};

		/**
		 * Rotates a matrix by the given angle around the Y axis
		 *
		 * @param {mat4} mat mat4 to rotate
		 * @param {number} angle Angle (in radians) to rotate
		 * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
		 *
		 * @returns {mat4} dest if specified, mat otherwise
		 */
		mat4.rotateY = function (mat, angle, dest) {
			var s = Math.sin(angle),
				c = Math.cos(angle),
				a00 = mat[0],
				a01 = mat[1],
				a02 = mat[2],
				a03 = mat[3],
				a20 = mat[8],
				a21 = mat[9],
				a22 = mat[10],
				a23 = mat[11];

			if (!dest) {
				dest = mat;
			} else if (mat !== dest) { // If the source and destination differ, copy the unchanged rows
				dest[4] = mat[4];
				dest[5] = mat[5];
				dest[6] = mat[6];
				dest[7] = mat[7];

				dest[12] = mat[12];
				dest[13] = mat[13];
				dest[14] = mat[14];
				dest[15] = mat[15];
			}

			// Perform axis-specific matrix multiplication
			dest[0] = a00 * c + a20 * -s;
			dest[1] = a01 * c + a21 * -s;
			dest[2] = a02 * c + a22 * -s;
			dest[3] = a03 * c + a23 * -s;

			dest[8] = a00 * s + a20 * c;
			dest[9] = a01 * s + a21 * c;
			dest[10] = a02 * s + a22 * c;
			dest[11] = a03 * s + a23 * c;
			return dest;
		};

		/**
		 * Rotates a matrix by the given angle around the Z axis
		 *
		 * @param {mat4} mat mat4 to rotate
		 * @param {number} angle Angle (in radians) to rotate
		 * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
		 *
		 * @returns {mat4} dest if specified, mat otherwise
		 */
		mat4.rotateZ = function (mat, angle, dest) {
			var s = Math.sin(angle),
				c = Math.cos(angle),
				a00 = mat[0],
				a01 = mat[1],
				a02 = mat[2],
				a03 = mat[3],
				a10 = mat[4],
				a11 = mat[5],
				a12 = mat[6],
				a13 = mat[7];

			if (!dest) {
				dest = mat;
			} else if (mat !== dest) { // If the source and destination differ, copy the unchanged last row
				dest[8] = mat[8];
				dest[9] = mat[9];
				dest[10] = mat[10];
				dest[11] = mat[11];

				dest[12] = mat[12];
				dest[13] = mat[13];
				dest[14] = mat[14];
				dest[15] = mat[15];
			}

			// Perform axis-specific matrix multiplication
			dest[0] = a00 * c + a10 * s;
			dest[1] = a01 * c + a11 * s;
			dest[2] = a02 * c + a12 * s;
			dest[3] = a03 * c + a13 * s;

			dest[4] = a00 * -s + a10 * c;
			dest[5] = a01 * -s + a11 * c;
			dest[6] = a02 * -s + a12 * c;
			dest[7] = a03 * -s + a13 * c;

			return dest;
		};

		/**
		 * Generates a frustum matrix with the given bounds
		 *
		 * @param {number} left Left bound of the frustum
		 * @param {number} right Right bound of the frustum
		 * @param {number} bottom Bottom bound of the frustum
		 * @param {number} top Top bound of the frustum
		 * @param {number} near Near bound of the frustum
		 * @param {number} far Far bound of the frustum
		 * @param {mat4} [dest] mat4 frustum matrix will be written into
		 *
		 * @returns {mat4} dest if specified, a new mat4 otherwise
		 */
		mat4.frustum = function (left, right, bottom, top, near, far, dest) {
			if (!dest) { dest = mat4.create(); }
			var rl = (right - left),
				tb = (top - bottom),
				fn = (far - near);
			dest[0] = (near * 2) / rl;
			dest[1] = 0;
			dest[2] = 0;
			dest[3] = 0;
			dest[4] = 0;
			dest[5] = (near * 2) / tb;
			dest[6] = 0;
			dest[7] = 0;
			dest[8] = (right + left) / rl;
			dest[9] = (top + bottom) / tb;
			dest[10] = -(far + near) / fn;
			dest[11] = -1;
			dest[12] = 0;
			dest[13] = 0;
			dest[14] = -(far * near * 2) / fn;
			dest[15] = 0;
			return dest;
		};

		/**
		 * Generates a perspective projection matrix with the given bounds
		 *
		 * @param {number} fovy Vertical field of view
		 * @param {number} aspect Aspect ratio. typically viewport width/height
		 * @param {number} near Near bound of the frustum
		 * @param {number} far Far bound of the frustum
		 * @param {mat4} [dest] mat4 frustum matrix will be written into
		 *
		 * @returns {mat4} dest if specified, a new mat4 otherwise
		 */
		mat4.perspective = function (fovy, aspect, near, far, dest) {
			var top = near * Math.tan(fovy * Math.PI / 360.0),
				right = top * aspect;
			return mat4.frustum(-right, right, -top, top, near, far, dest);
		};

		/**
		 * Generates a orthogonal projection matrix with the given bounds
		 *
		 * @param {number} left Left bound of the frustum
		 * @param {number} right Right bound of the frustum
		 * @param {number} bottom Bottom bound of the frustum
		 * @param {number} top Top bound of the frustum
		 * @param {number} near Near bound of the frustum
		 * @param {number} far Far bound of the frustum
		 * @param {mat4} [dest] mat4 frustum matrix will be written into
		 *
		 * @returns {mat4} dest if specified, a new mat4 otherwise
		 */
		mat4.ortho = function (left, right, bottom, top, near, far, dest) {
			if (!dest) { dest = mat4.create(); }
			var rl = (right - left),
				tb = (top - bottom),
				fn = (far - near);
			dest[0] = 2 / rl;
			dest[1] = 0;
			dest[2] = 0;
			dest[3] = 0;
			dest[4] = 0;
			dest[5] = 2 / tb;
			dest[6] = 0;
			dest[7] = 0;
			dest[8] = 0;
			dest[9] = 0;
			dest[10] = -2 / fn;
			dest[11] = 0;
			dest[12] = -(left + right) / rl;
			dest[13] = -(top + bottom) / tb;
			dest[14] = -(far + near) / fn;
			dest[15] = 1;
			return dest;
		};

		/**
		 * Generates a look-at matrix with the given eye position, focal point, and up axis
		 *
		 * @param {vec3} eye Position of the viewer
		 * @param {vec3} center Point the viewer is looking at
		 * @param {vec3} up vec3 pointing "up"
		 * @param {mat4} [dest] mat4 frustum matrix will be written into
		 *
		 * @returns {mat4} dest if specified, a new mat4 otherwise
		 */
		mat4.lookAt = function (eye, center, up, dest) {
			if (!dest) { dest = mat4.create(); }

			var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
				eyex = eye[0],
				eyey = eye[1],
				eyez = eye[2],
				upx = up[0],
				upy = up[1],
				upz = up[2],
				centerx = center[0],
				centery = center[1],
				centerz = center[2];

			if (eyex === centerx && eyey === centery && eyez === centerz) {
				return mat4.identity(dest);
			}

			//vec3.direction(eye, center, z);
			z0 = eyex - centerx;
			z1 = eyey - centery;
			z2 = eyez - centerz;

			// normalize (no check needed for 0 because of early return)
			len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
			z0 *= len;
			z1 *= len;
			z2 *= len;

			//vec3.normalize(vec3.cross(up, z, x));
			x0 = upy * z2 - upz * z1;
			x1 = upz * z0 - upx * z2;
			x2 = upx * z1 - upy * z0;
			len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
			if (!len) {
				x0 = 0;
				x1 = 0;
				x2 = 0;
			} else {
				len = 1 / len;
				x0 *= len;
				x1 *= len;
				x2 *= len;
			}

			//vec3.normalize(vec3.cross(z, x, y));
			y0 = z1 * x2 - z2 * x1;
			y1 = z2 * x0 - z0 * x2;
			y2 = z0 * x1 - z1 * x0;

			len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
			if (!len) {
				y0 = 0;
				y1 = 0;
				y2 = 0;
			} else {
				len = 1 / len;
				y0 *= len;
				y1 *= len;
				y2 *= len;
			}

			dest[0] = x0;
			dest[1] = y0;
			dest[2] = z0;
			dest[3] = 0;
			dest[4] = x1;
			dest[5] = y1;
			dest[6] = z1;
			dest[7] = 0;
			dest[8] = x2;
			dest[9] = y2;
			dest[10] = z2;
			dest[11] = 0;
			dest[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
			dest[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
			dest[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
			dest[15] = 1;

			return dest;
		};

		/**
		 * Creates a matrix from a quaternion rotation and vector translation
		 * This is equivalent to (but much faster than):
		 *
		 *     mat4.identity(dest);
		 *     mat4.translate(dest, vec);
		 *     var quatMat = mat4.create();
		 *     quat4.toMat4(quat, quatMat);
		 *     mat4.multiply(dest, quatMat);
		 *
		 * @param {quat4} quat Rotation quaternion
		 * @param {vec3} vec Translation vector
		 * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to a new mat4
		 *
		 * @returns {mat4} dest if specified, a new mat4 otherwise
		 */
		mat4.fromRotationTranslation = function (quat, vec, dest) {
			if (!dest) { dest = mat4.create(); }

			// Quaternion math
			var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
				x2 = x + x,
				y2 = y + y,
				z2 = z + z,

				xx = x * x2,
				xy = x * y2,
				xz = x * z2,
				yy = y * y2,
				yz = y * z2,
				zz = z * z2,
				wx = w * x2,
				wy = w * y2,
				wz = w * z2;

			dest[0] = 1 - (yy + zz);
			dest[1] = xy + wz;
			dest[2] = xz - wy;
			dest[3] = 0;
			dest[4] = xy - wz;
			dest[5] = 1 - (xx + zz);
			dest[6] = yz + wx;
			dest[7] = 0;
			dest[8] = xz + wy;
			dest[9] = yz - wx;
			dest[10] = 1 - (xx + yy);
			dest[11] = 0;
			dest[12] = vec[0];
			dest[13] = vec[1];
			dest[14] = vec[2];
			dest[15] = 1;

			return dest;
		};

		/**
		 * Returns a string representation of a mat4
		 *
		 * @param {mat4} mat mat4 to represent as a string
		 *
		 * @returns {string} String representation of mat
		 */
		mat4.str = function (mat) {
			return '[' + mat[0] + ', ' + mat[1] + ', ' + mat[2] + ', ' + mat[3] +
				', ' + mat[4] + ', ' + mat[5] + ', ' + mat[6] + ', ' + mat[7] +
				', ' + mat[8] + ', ' + mat[9] + ', ' + mat[10] + ', ' + mat[11] +
				', ' + mat[12] + ', ' + mat[13] + ', ' + mat[14] + ', ' + mat[15] + ']';
		};

		/*
		 * quat4
		 */

		/**
		 * Creates a new instance of a quat4 using the default array type
		 * Any javascript array containing at least 4 numeric elements can serve as a quat4
		 *
		 * @param {quat4} [quat] quat4 containing values to initialize with
		 *
		 * @returns {quat4} New quat4
		 */
		quat4.create = function (quat) {
			var dest = createArray(4);

			if (quat) {
				dest[0] = quat[0];
				dest[1] = quat[1];
				dest[2] = quat[2];
				dest[3] = quat[3];
			}

			return dest;
		};

		/**
		 * Copies the values of one quat4 to another
		 *
		 * @param {quat4} quat quat4 containing values to copy
		 * @param {quat4} dest quat4 receiving copied values
		 *
		 * @returns {quat4} dest
		 */
		quat4.set = function (quat, dest) {
			dest[0] = quat[0];
			dest[1] = quat[1];
			dest[2] = quat[2];
			dest[3] = quat[3];

			return dest;
		};

		/**
		 * Calculates the W component of a quat4 from the X, Y, and Z components.
		 * Assumes that quaternion is 1 unit in length.
		 * Any existing W component will be ignored.
		 *
		 * @param {quat4} quat quat4 to calculate W component of
		 * @param {quat4} [dest] quat4 receiving calculated values. If not specified result is written to quat
		 *
		 * @returns {quat4} dest if specified, quat otherwise
		 */
		quat4.calculateW = function (quat, dest) {
			var x = quat[0], y = quat[1], z = quat[2];

			if (!dest || quat === dest) {
				quat[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
				return quat;
			}
			dest[0] = x;
			dest[1] = y;
			dest[2] = z;
			dest[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
			return dest;
		};

		/**
		 * Calculates the dot product of two quaternions
		 *
		 * @param {quat4} quat First operand
		 * @param {quat4} quat2 Second operand
		 *
		 * @return {number} Dot product of quat and quat2
		 */
		quat4.dot = function(quat, quat2){
			return quat[0]*quat2[0] + quat[1]*quat2[1] + quat[2]*quat2[2] + quat[3]*quat2[3];
		};

		/**
		 * Calculates the inverse of a quat4
		 *
		 * @param {quat4} quat quat4 to calculate inverse of
		 * @param {quat4} [dest] quat4 receiving inverse values. If not specified result is written to quat
		 *
		 * @returns {quat4} dest if specified, quat otherwise
		 */
		quat4.inverse = function(quat, dest) {
			var q0 = quat[0], q1 = quat[1], q2 = quat[2], q3 = quat[3],
				dot = q0*q0 + q1*q1 + q2*q2 + q3*q3,
				invDot = dot ? 1.0/dot : 0;

			// TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

			if(!dest || quat === dest) {
				quat[0] *= -invDot;
				quat[1] *= -invDot;
				quat[2] *= -invDot;
				quat[3] *= invDot;
				return quat;
			}
			dest[0] = -quat[0]*invDot;
			dest[1] = -quat[1]*invDot;
			dest[2] = -quat[2]*invDot;
			dest[3] = quat[3]*invDot;
			return dest;
		};


		/**
		 * Calculates the conjugate of a quat4
		 * If the quaternion is normalized, this function is faster than quat4.inverse and produces the same result.
		 *
		 * @param {quat4} quat quat4 to calculate conjugate of
		 * @param {quat4} [dest] quat4 receiving conjugate values. If not specified result is written to quat
		 *
		 * @returns {quat4} dest if specified, quat otherwise
		 */
		quat4.conjugate = function (quat, dest) {
			if (!dest || quat === dest) {
				quat[0] *= -1;
				quat[1] *= -1;
				quat[2] *= -1;
				return quat;
			}
			dest[0] = -quat[0];
			dest[1] = -quat[1];
			dest[2] = -quat[2];
			dest[3] = quat[3];
			return dest;
		};

		/**
		 * Calculates the length of a quat4
		 *
		 * Params:
		 * @param {quat4} quat quat4 to calculate length of
		 *
		 * @returns Length of quat
		 */
		quat4.length = function (quat) {
			var x = quat[0], y = quat[1], z = quat[2], w = quat[3];
			return Math.sqrt(x * x + y * y + z * z + w * w);
		};

		/**
		 * Generates a unit quaternion of the same direction as the provided quat4
		 * If quaternion length is 0, returns [0, 0, 0, 0]
		 *
		 * @param {quat4} quat quat4 to normalize
		 * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
		 *
		 * @returns {quat4} dest if specified, quat otherwise
		 */
		quat4.normalize = function (quat, dest) {
			if (!dest) { dest = quat; }

			var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
				len = Math.sqrt(x * x + y * y + z * z + w * w);
			if (len === 0) {
				dest[0] = 0;
				dest[1] = 0;
				dest[2] = 0;
				dest[3] = 0;
				return dest;
			}
			len = 1 / len;
			dest[0] = x * len;
			dest[1] = y * len;
			dest[2] = z * len;
			dest[3] = w * len;

			return dest;
		};

		/**
		 * Performs a quaternion multiplication
		 *
		 * @param {quat4} quat First operand
		 * @param {quat4} quat2 Second operand
		 * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
		 *
		 * @returns {quat4} dest if specified, quat otherwise
		 */
		quat4.multiply = function (quat, quat2, dest) {
			if (!dest) { dest = quat; }

			var qax = quat[0], qay = quat[1], qaz = quat[2], qaw = quat[3],
				qbx = quat2[0], qby = quat2[1], qbz = quat2[2], qbw = quat2[3];

			dest[0] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
			dest[1] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
			dest[2] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
			dest[3] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

			return dest;
		};

		/**
		 * Transforms a vec3 with the given quaternion
		 *
		 * @param {quat4} quat quat4 to transform the vector with
		 * @param {vec3} vec vec3 to transform
		 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
		 *
		 * @returns dest if specified, vec otherwise
		 */
		quat4.multiplyVec3 = function (quat, vec, dest) {
			if (!dest) { dest = vec; }

			var x = vec[0], y = vec[1], z = vec[2],
				qx = quat[0], qy = quat[1], qz = quat[2], qw = quat[3],

				// calculate quat * vec
				ix = qw * x + qy * z - qz * y,
				iy = qw * y + qz * x - qx * z,
				iz = qw * z + qx * y - qy * x,
				iw = -qx * x - qy * y - qz * z;

			// calculate result * inverse quat
			dest[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
			dest[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
			dest[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;

			return dest;
		};

		/**
		 * Calculates a 3x3 matrix from the given quat4
		 *
		 * @param {quat4} quat quat4 to create matrix from
		 * @param {mat3} [dest] mat3 receiving operation result
		 *
		 * @returns {mat3} dest if specified, a new mat3 otherwise
		 */
		quat4.toMat3 = function (quat, dest) {
			if (!dest) { dest = mat3.create(); }

			var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
				x2 = x + x,
				y2 = y + y,
				z2 = z + z,

				xx = x * x2,
				xy = x * y2,
				xz = x * z2,
				yy = y * y2,
				yz = y * z2,
				zz = z * z2,
				wx = w * x2,
				wy = w * y2,
				wz = w * z2;

			dest[0] = 1 - (yy + zz);
			dest[1] = xy + wz;
			dest[2] = xz - wy;

			dest[3] = xy - wz;
			dest[4] = 1 - (xx + zz);
			dest[5] = yz + wx;

			dest[6] = xz + wy;
			dest[7] = yz - wx;
			dest[8] = 1 - (xx + yy);

			return dest;
		};

		/**
		 * Calculates a 4x4 matrix from the given quat4
		 *
		 * @param {quat4} quat quat4 to create matrix from
		 * @param {mat4} [dest] mat4 receiving operation result
		 *
		 * @returns {mat4} dest if specified, a new mat4 otherwise
		 */
		quat4.toMat4 = function (quat, dest) {
			if (!dest) { dest = mat4.create(); }

			var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
				x2 = x + x,
				y2 = y + y,
				z2 = z + z,

				xx = x * x2,
				xy = x * y2,
				xz = x * z2,
				yy = y * y2,
				yz = y * z2,
				zz = z * z2,
				wx = w * x2,
				wy = w * y2,
				wz = w * z2;

			dest[0] = 1 - (yy + zz);
			dest[1] = xy + wz;
			dest[2] = xz - wy;
			dest[3] = 0;

			dest[4] = xy - wz;
			dest[5] = 1 - (xx + zz);
			dest[6] = yz + wx;
			dest[7] = 0;

			dest[8] = xz + wy;
			dest[9] = yz - wx;
			dest[10] = 1 - (xx + yy);
			dest[11] = 0;

			dest[12] = 0;
			dest[13] = 0;
			dest[14] = 0;
			dest[15] = 1;

			return dest;
		};

		/**
		 * Performs a spherical linear interpolation between two quat4
		 *
		 * @param {quat4} quat First quaternion
		 * @param {quat4} quat2 Second quaternion
		 * @param {number} slerp Interpolation amount between the two inputs
		 * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
		 *
		 * @returns {quat4} dest if specified, quat otherwise
		 */
		quat4.slerp = function (quat, quat2, slerp, dest) {
			if (!dest) { dest = quat; }

			var cosHalfTheta = quat[0] * quat2[0] + quat[1] * quat2[1] + quat[2] * quat2[2] + quat[3] * quat2[3],
				halfTheta,
				sinHalfTheta,
				ratioA,
				ratioB;

			if (Math.abs(cosHalfTheta) >= 1.0) {
				if (dest !== quat) {
					dest[0] = quat[0];
					dest[1] = quat[1];
					dest[2] = quat[2];
					dest[3] = quat[3];
				}
				return dest;
			}

			halfTheta = Math.acos(cosHalfTheta);
			sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

			if (Math.abs(sinHalfTheta) < 0.001) {
				dest[0] = (quat[0] * 0.5 + quat2[0] * 0.5);
				dest[1] = (quat[1] * 0.5 + quat2[1] * 0.5);
				dest[2] = (quat[2] * 0.5 + quat2[2] * 0.5);
				dest[3] = (quat[3] * 0.5 + quat2[3] * 0.5);
				return dest;
			}

			ratioA = Math.sin((1 - slerp) * halfTheta) / sinHalfTheta;
			ratioB = Math.sin(slerp * halfTheta) / sinHalfTheta;

			dest[0] = (quat[0] * ratioA + quat2[0] * ratioB);
			dest[1] = (quat[1] * ratioA + quat2[1] * ratioB);
			dest[2] = (quat[2] * ratioA + quat2[2] * ratioB);
			dest[3] = (quat[3] * ratioA + quat2[3] * ratioB);

			return dest;
		};

		/**
		 * Returns a string representation of a quaternion
		 *
		 * @param {quat4} quat quat4 to represent as a string
		 *
		 * @returns {string} String representation of quat
		 */
		quat4.str = function (quat) {
			return '[' + quat[0] + ', ' + quat[1] + ', ' + quat[2] + ', ' + quat[3] + ']';
		};


		return {
			vec3: vec3,
			mat3: mat3,
			mat4: mat4,
			quat4: quat4
		}
	}
)
;
define(
	"glmatrix/vec3",
	[
		"glmatrix/glmatrix"
	],
	function(
		glmatrix
	) {
		return glmatrix.vec3
	}
)
;
define(
	"glmatrix/mat4",
	[
		"glmatrix/glmatrix"
	],
	function(
		glmatrix
	) {
		return glmatrix.mat4
	}
)
;
define('spell/shared/util/platform/private/graphics/webgl/shaders',[],
	function() {
		return {
			vertex: [
				"attribute vec3 aVertexPosition;",
				"attribute vec2 aTextureCoord;",

				"uniform mat4 uScreenSpaceShimMatrix;",
				"uniform mat4 uModelViewMatrix;",
				"uniform mat3 uTextureMatrix;",

				"varying vec2 vTextureCoord;",


				"void main( void ) {",
					"vTextureCoord = ( uTextureMatrix * vec3( aTextureCoord, 1.0 ) ).st;",
					"gl_Position = uScreenSpaceShimMatrix * uModelViewMatrix * vec4( aVertexPosition, 1.0 );",
				"}"
			].join( "\n" ),

			fragment: [
				"precision mediump float;",

				"uniform sampler2D uTexture0;",
				"uniform vec4 uGlobalColor;",
				"uniform float uGlobalAlpha;",
				"uniform bool uFillRect;",

				"varying vec2 vTextureCoord;",


				"void main( void ) {",
					"if( !uFillRect ) {",
					"	vec4 color = texture2D( uTexture0, vTextureCoord );",
					"	gl_FragColor = color * uGlobalColor * vec4( 1.0, 1.0, 1.0, uGlobalAlpha );",

					"} else {",
					"	gl_FragColor = uGlobalColor * vec4( 1.0, 1.0, 1.0, uGlobalAlpha );",
					"}",
				"}"
			].join( "\n" )
		}
	}
)
;
define(
	"glmatrix/mat3",
	[
		"glmatrix/glmatrix"
	],
	function(
		glmatrix
	) {
		return glmatrix.mat3
	}
)
;
define('spell/shared/util/platform/private/graphics/createCanvasNode',[],
	function() {
		return function( width, height ) {
			var container = document.getElementById( 'spell' )

			if( !container ) throw 'Could not find a container with the id "spell" in the DOM tree.'


			var canvas = document.createElement( "canvas" )
				canvas.id     = 'spell-canvas'
				canvas.width  = width
				canvas.height = height

			container.appendChild( canvas )

			return canvas
		}
	}
)
;
define('spell/shared/util/platform/private/registerTimer',[],
	function() {
		


		/**
		 * callback - the callback to call
		 * timeInMs - the number of milliseconds that the callback is delayed by
		 */
		return function( callback, timeInMs ) {
			setTimeout( callback, timeInMs )
		}
	}
)
;
define(
	"spell/shared/util/platform/private/callNextFrame",
	[
		"spell/shared/util/platform/private/registerTimer"
	],
	function(
		registerTimer
	) {
		


		// running in node context
		if( typeof window === "undefined" ) {
			return function( callback ) {
				registerTimer( callback, 5 )
			}
		}


		// running in browser
		var browserCallback = (
			window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame
		)

		var hasBrowserSupport = !!browserCallback

		if( hasBrowserSupport ) {
			return function( callback ) {
				browserCallback.call( window, callback )
			}
		}


		// no browser support
		return function( callback ) {
			registerTimer(
				function() {
					callback( new Date() )
				},
				1000 / 60 // 60 Hz
			)
		}
	}
)
;
define('spell/shared/components/sound/soundEmitter',[],
	function() {
		"use strict"

		var soundEmitter = function( args ) {
			this.soundId    = args.soundId
			this.volume     = args.volume     || 1
			this.muted      = args.muted      || false
			this.onComplete = args.onComplete || ''
			this.start      = args.start      || false
			this.stop       = args.stop       || false
			this.background = args.background || false
		}

		soundEmitter.ON_COMPLETE_LOOP               = 1
		soundEmitter.ON_COMPLETE_REMOVE_COMPONENT   = 2
		soundEmitter.ON_COMPLETE_STOP               = 3

		return soundEmitter
	}
)
;
define(
	"spell/shared/util/platform/private/sound/createSound",
	[
		"spell/shared/components/sound/soundEmitter"
	],
	function(
		soundEmitterConstructor
	) {
		

		var create = function( config, soundManager ) {

			var pauseCallback = function () {
				if ( parseFloat(this.currentTime) >= parseFloat( this.stop ) && this.paused === false) {
					this.playing = false
                    this.pause()
				}
			}

			var playingCallback = function() {
				if( this.playing === false ) {
					this.playing = true
					this.currentTime = this.start
					this.addEventListener( 'timeupdate', pauseCallback, false )
				}
			}


			var loopCallback = function() {
                if( this.playing === false ) {
                    this.removeEventListener( 'timeupdate', pauseCallback, false )
                    this.play()
                }
			}

			var removeCallback = function() {
                this.removeEventListener( 'ended', removeCallback, false )
                this.removeEventListener( 'timeupdate', pauseCallback, false )
                this.removeEventListener( 'pause', removeCallback, false )
                this.removeEventListener( 'playing', playingCallback, false )

                soundManager.remove( this )
			}

			return {
				onComplete: soundEmitterConstructor.ON_COMPLETE_STOP,
				start: config.start || 0,
				stop: config.start + config.length || config.length,
				volume: 1,
				background: false,
				resource: config.resource,

				play: function() {

                    var freeAudioObject = soundManager.getFreeChannel(this.resource, this.isBackgroundSound() )

                    if( freeAudioObject === undefined ) {
                        return
                    }

                    freeAudioObject.stop = ( freeAudioObject.duration < parseFloat(this.stop) ) ? freeAudioObject.duration : parseFloat(this.stop)
                    freeAudioObject.start = freeAudioObject.currentTime = parseFloat(this.start)
                    freeAudioObject.volume = this.volume

                    if( !soundManager.context ) {

                        if( this.onComplete === soundEmitterConstructor.ON_COMPLETE_LOOP ) {
                            freeAudioObject.addEventListener( 'pause', loopCallback, false )

                        } else {

                            if( this.onComplete === soundEmitterConstructor.ON_COMPLETE_REMOVE_COMPONENT ) {

                            }

                            freeAudioObject.addEventListener( 'pause', removeCallback, false )
                        }

                        //This should never happen, but if, then free object
                        freeAudioObject.addEventListener( 'ended', removeCallback, false )
                        freeAudioObject.addEventListener( 'play', playingCallback, false )

                        freeAudioObject.play()

                    } else {

                        var gainNode = soundManager.context.createGainNode()
                        var source    = soundManager.context.createBufferSource()
                        source.buffer = freeAudioObject

                        if( this.onComplete === soundEmitterConstructor.ON_COMPLETE_LOOP ) {
                            source.loop = true
                        } else {
                            soundManager.remove( freeAudioObject )
                        }

                        source.connect(gainNode);
                        gainNode.connect(soundManager.context.destination)

                        gainNode.gain.value = this.volume
                        source.noteGrainOn( 0, this.start, config.length )
                    }


                },

				setVolume: function( volume ) {
					this.volume = volume || 1
				},

				setLoop: function() {
					this.onComplete = soundEmitterConstructor.ON_COMPLETE_LOOP
				},

				setOnCompleteRemove: function() {
					this.onComplete = soundEmitterConstructor.ON_COMPLETE_REMOVE_COMPONENT
				},

			  	setStart: function( start ) {
					this.start = start
				},

				setStop: function( stop ) {
					this.stop = stop
				},

				setBackground: function( background ) {
					this.background = ( background === false) ? false : true
				},

				isBackgroundSound: function( ) {
					return this.background
				}
			}
		}

		return create
	}
)
;
define('modernizr',[],
	function() {
		var isBrowser = !!( typeof window !== "undefined" && navigator && document )

		if( !isBrowser ) return {}


		/* Modernizr 2.5.3 (Custom Build) | MIT & BSD
		 * Build: http://www.modernizr.com/download/#-canvas-audio-websockets-touch-webgl-teststyles-prefixes-domprefixes
		 */
		;window.Modernizr=function(a,b,c){function y(a){i.cssText=a}function z(a,b){return y(l.join(a+";")+(b||""))}function A(a,b){return typeof a===b}function B(a,b){return!!~(""+a).indexOf(b)}function C(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:A(f,"function")?f.bind(d||b):f}return!1}var d="2.5.3",e={},f=b.documentElement,g="modernizr",h=b.createElement(g),i=h.style,j,k={}.toString,l=" -webkit- -moz- -o- -ms- ".split(" "),m="Webkit Moz O ms",n=m.split(" "),o=m.toLowerCase().split(" "),p={},q={},r={},s=[],t=s.slice,u,v=function(a,c,d,e){var h,i,j,k=b.createElement("div"),l=b.body,m=l?l:b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:g+(d+1),k.appendChild(j);return h=["&#173;","<style>",a,"</style>"].join(""),k.id=g,m.innerHTML+=h,m.appendChild(k),l||(m.style.background="",f.appendChild(m)),i=c(k,a),l?k.parentNode.removeChild(k):m.parentNode.removeChild(m),!!i},w={}.hasOwnProperty,x;!A(w,"undefined")&&!A(w.call,"undefined")?x=function(a,b){return w.call(a,b)}:x=function(a,b){return b in a&&A(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=t.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(t.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(t.call(arguments)))};return e});var D=function(c,d){var f=c.join(""),g=d.length;v(f,function(c,d){var f=b.styleSheets[b.styleSheets.length-1],h=f?f.cssRules&&f.cssRules[0]?f.cssRules[0].cssText:f.cssText||"":"",i=c.childNodes,j={};while(g--)j[i[g].id]=i[g];e.touch="ontouchstart"in a||a.DocumentTouch&&b instanceof DocumentTouch||(j.touch&&j.touch.offsetTop)===9},g,d)}([,["@media (",l.join("touch-enabled),("),g,")","{#touch{top:9px;position:absolute}}"].join("")],[,"touch"]);p.canvas=function(){var a=b.createElement("canvas");return!!a.getContext&&!!a.getContext("2d")},p.webgl=function(){try{var d=b.createElement("canvas"),e;e=!(!a.WebGLRenderingContext||!d.getContext("experimental-webgl")&&!d.getContext("webgl")),d=c}catch(f){e=!1}return e},p.touch=function(){return e.touch},p.websockets=function(){for(var b=-1,c=n.length;++b<c;)if(a[n[b]+"WebSocket"])return!0;return"WebSocket"in a},p.audio=function(){var a=b.createElement("audio"),c=!1;try{if(c=!!a.canPlayType)c=new Boolean(c),c.ogg=a.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),c.mp3=a.canPlayType("audio/mpeg;").replace(/^no$/,""),c.wav=a.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),c.m4a=(a.canPlayType("audio/x-m4a;")||a.canPlayType("audio/aac;")).replace(/^no$/,"")}catch(d){}return c};for(var E in p)x(p,E)&&(u=E.toLowerCase(),e[u]=p[E](),s.push((e[u]?"":"no-")+u));return y(""),h=j=null,e._version=d,e._prefixes=l,e._domPrefixes=o,e._cssomPrefixes=n,e.testStyles=v,e}(this,this.document);

		var modernizr = window.Modernizr

		return modernizr
	}
)


;
define(
	"spell/shared/util/platform/private/system/features",
	[
		"modernizr"
	],
	function(
		modernizr
	) {
		


		return {
			touch : !!modernizr.touch
		}
	}
)
;
define('spell/shared/util/platform/private/graphics/Viewporter',[],
	function () {
        "use strict"

		var viewporter   = {}

		viewporter.renderViewport = function ( onScreenResized ) {
			var createViewportMetaTag = function( initialScale ) {
				var meta = document.createElement( 'meta' )
				meta.name    = 'viewport'
				meta.content = 'width=device-width; initial-scale=' + initialScale + '; maximum-scale=' + initialScale + '; user-scalable=0;'

				return meta
			}

			var getOffset = function( element ) {
				var box = element.getBoundingClientRect()

				var body    = document.body
				var docElem = document.documentElement

				var scrollTop  = window.pageYOffset || docElem.scrollTop || body.scrollTop
				var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft

				var clientTop  = docElem.clientTop || body.clientTop || 0
				var clientLeft = docElem.clientLeft || body.clientLeft || 0

				var top  = box.top + scrollTop - clientTop
				var left = box.left + scrollLeft - clientLeft

				return [ Math.round( left ), Math.round( top ) ]
			}

			var publishScreenResizedEvent = function() {
				var offset = getOffset( document.getElementById( 'spell-canvas' ) )
				var width  = window.innerWidth - offset[ 0 ]
				var height = window.innerHeight - offset[ 1 ]

				onScreenResized( width, height )
			}


			if( navigator.userAgent.match( /iPhone/i ) ||
				navigator.userAgent.match( /iPod/i ) ) {

				document.getElementsByTagName( 'head' )[ 0 ].appendChild( createViewportMetaTag( '0.5' ) )

			} else if( navigator.userAgent.match( /iPad/i ) ) {

				document.getElementsByTagName( 'head' )[ 0 ].appendChild( createViewportMetaTag( '1.0' ) )
			}


			// initialize viewporter object
			viewporter = {

				// options
				forceDetection: false,

				// constants
				ACTIVE: (('ontouchstart' in window) || (/webos/i).test(navigator.userAgent)),
				READY: false,

				// methods
				isLandscape: function() {
					return window.orientation === 90 || window.orientation === -90
				},

				ready: function(callback) {
					window.addEventListener('viewportready', callback, false)
				}

			}

			// if we are on Desktop, no need to go further
			if (!viewporter.ACTIVE) {
				window.onresize = publishScreenResizedEvent
				publishScreenResizedEvent()

				return
			}

			// create private constructor with prototype..just looks cooler
			var _Viewporter = function() {

                var that = this

				this.IS_ANDROID = /Android/.test(navigator.userAgent)

				var _onReady = function() {

					// scroll the shit away and fix the viewport!
					that.prepareVisualViewport()

					// listen for orientation change
					var cachedOrientation = window.orientation;
					window.addEventListener('orientationchange', function() {
						if(window.orientation != cachedOrientation) {
							that.prepareVisualViewport()
							cachedOrientation = window.orientation
						}
					}, false)

				}


				// listen for document ready if not already loaded
				// then try to prepare the visual viewport and start firing custom events
				_onReady()

			}

			_Viewporter.prototype = {

				getProfile: function() {

					if(viewporter.forceDetection) {
						return null
					}

					for(var searchTerm in viewporter.profiles) {
						if(new RegExp(searchTerm).test(navigator.userAgent)) {
							return viewporter.profiles[searchTerm]
						}
					}
					return null
				},

				postProcess: function(  ) {
					// let everyone know we're finally ready
					viewporter.READY = true

					this.triggerWindowEvent(!this._firstUpdateExecuted ? 'viewportready' : 'viewportchange')
					this._firstUpdateExecuted = true

                    publishScreenResizedEvent()
				},

				prepareVisualViewport: function( ) {

					var that = this

					// if we're running in webapp mode (iOS), there's nothing to scroll away
					if(navigator.standalone) {
						return this.postProcess()
					}

					// maximize the document element's height to be able to scroll away the url bar
					document.documentElement.style.minHeight = '5000px'

					var startHeight = window.innerHeight
					var deviceProfile = this.getProfile()
					var orientation = viewporter.isLandscape() ? 'landscape' : 'portrait'

					// try scrolling immediately
					window.scrollTo(0, that.IS_ANDROID ? 1 : 0) // Android needs to scroll by at least 1px

					// start the checker loop
					var iterations = this.IS_ANDROID && !deviceProfile ? 20 : 5 // if we're on Android and don't know the device, brute force hard
					var check = window.setInterval(function() {

						// retry scrolling
						window.scrollTo(0, that.IS_ANDROID ? 1 : 0) // Android needs to scroll by at least 1px

						if(
							that.IS_ANDROID
								? (deviceProfile ? window.innerHeight === deviceProfile[orientation] : --iterations < 0) // Android: either match against a device profile, or brute force
								: (window.innerHeight > startHeight || --iterations < 0) // iOS is comparably easy!
						) {
                            clearInterval(check)

							// set minimum height of content to new window height
							document.documentElement.style.minHeight = window.innerHeight + 'px'

                            if( !document.getElementById('spell') ) throw "Viewport element Missing"

                            // set the right height for the body wrapper to allow bottom positioned elements
                            document.getElementById('spell').style.position = 'relative'
                            document.getElementById('spell').style.height = window.innerHeight + 'px'

							// fire events, get ready
							that.postProcess( )

						}

					}, 10)

				},

				triggerWindowEvent: function(name) {
					var event = document.createEvent("Event")
					event.initEvent(name, false, false)
					window.dispatchEvent(event)
				}

			};

			// initialize
			new _Viewporter()

		}

		viewporter.profiles = {

			// Motorola Xoom
			'MZ601': {
				portrait: 696,
				landscape: 1176
			},

			// Samsung Galaxy S, S2 and Nexus S
			'GT-I9000|GT-I9100|Nexus S': {
				portrait: 508,
				landscape: 295
			},

			// Samsung Galaxy Pad
			'GT-P1000': {
				portrait: 657,
				landscape: 400
			},

			// HTC Desire & HTC Desire HD
			'Desire_A8181|DesireHD_A9191': {
				portrait: 533,
				landscape: 320
			}

		}

		return viewporter
	}
)
;
define('funkysnakes/shared/config/constants',[],
	function() {
		return {
			// viewport dimensions in logical units
			xSize: 1024,
			ySize: 768,

			// screen size
			minWidth : 640,
			minHeight : 480,
			maxWidth : 1024,
			maxHeight : 768,

			// playing field border
			left  : 82,
			right : 942,
			top   : 668,
			bottom: 100,

			// ship
			minSpeedPerSecond : 80,
			maxSpeedPerSecond : 390,
			speedPerSecond    : 130,
			speedPowerupBonus : 50,

			interpolationDelay: 100,

			// tail
			pastPositionsDistance: 10,
			tailElementDistance  : 30,
			distanceTailToShip   : 35,

			// shield
			shieldLifetime: 2.0, // in seconds

			// misc
			maxCloudTextureSize: 512,
			maxNumberPlayers: 4
		}
	}
)
;
define('spell/client/util/font/fonts/BelloPro',[],
	function() {
		"use strict"
		return {
	"font": {
		"info": {
			"face": "Bello Pro",
			"size": "32",
			"bold": "0",
			"italic": "0",
			"charset": "",
			"unicode": "1",
			"stretchH": "100",
			"smooth": "1",
			"aa": "2",
			"padding": "0,0,0,0",
			"spacing": "1,1",
			"outline": "0"
		},
		"common": {
			"lineHeight": "32",
			"base": "25",
			"scaleW": "300",
			"scaleH": "300",
			"pages": "1",
			"packed": "0",
			"alphaChnl": "0",
			"redChnl": "4",
			"greenChnl": "4",
			"blueChnl": "4"
		}
	},
	"chars": {
		"0": {
			"id": "0",
			"x": "21",
			"y": "30",
			"width": "0",
			"height": "1",
			"xoffset": "0",
			"yoffset": "31",
			"xadvance": "0",
			"page": "0",
			"chnl": "15"
		},
		"13": {
			"id": "13",
			"x": "21",
			"y": "28",
			"width": "1",
			"height": "1",
			"xoffset": "0",
			"yoffset": "31",
			"xadvance": "3",
			"page": "0",
			"chnl": "15"
		},
		"32": {
			"id": "32",
			"x": "19",
			"y": "28",
			"width": "1",
			"height": "1",
			"xoffset": "0",
			"yoffset": "31",
			"xadvance": "5",
			"page": "0",
			"chnl": "15"
		},
		"33": {
			"id": "33",
			"x": "233",
			"y": "118",
			"width": "8",
			"height": "19",
			"xoffset": "3",
			"yoffset": "7",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"34": {
			"id": "34",
			"x": "52",
			"y": "180",
			"width": "10",
			"height": "9",
			"xoffset": "3",
			"yoffset": "8",
			"xadvance": "13",
			"page": "0",
			"chnl": "15"
		},
		"35": {
			"id": "35",
			"x": "81",
			"y": "161",
			"width": "11",
			"height": "13",
			"xoffset": "1",
			"yoffset": "11",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"36": {
			"id": "36",
			"x": "121",
			"y": "100",
			"width": "9",
			"height": "20",
			"xoffset": "1",
			"yoffset": "10",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"37": {
			"id": "37",
			"x": "66",
			"y": "122",
			"width": "14",
			"height": "19",
			"xoffset": "2",
			"yoffset": "10",
			"xadvance": "17",
			"page": "0",
			"chnl": "15"
		},
		"38": {
			"id": "38",
			"x": "38",
			"y": "55",
			"width": "19",
			"height": "23",
			"xoffset": "0",
			"yoffset": "7",
			"xadvance": "19",
			"page": "0",
			"chnl": "15"
		},
		"39": {
			"id": "39",
			"x": "295",
			"y": "26",
			"width": "4",
			"height": "9",
			"xoffset": "3",
			"yoffset": "8",
			"xadvance": "7",
			"page": "0",
			"chnl": "15"
		},
		"40": {
			"id": "40",
			"x": "94",
			"y": "79",
			"width": "9",
			"height": "21",
			"xoffset": "4",
			"yoffset": "9",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"41": {
			"id": "41",
			"x": "83",
			"y": "79",
			"width": "10",
			"height": "21",
			"xoffset": "0",
			"yoffset": "9",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"42": {
			"id": "42",
			"x": "191",
			"y": "155",
			"width": "10",
			"height": "12",
			"xoffset": "3",
			"yoffset": "7",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"43": {
			"id": "43",
			"x": "272",
			"y": "150",
			"width": "10",
			"height": "11",
			"xoffset": "2",
			"yoffset": "14",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"44": {
			"id": "44",
			"x": "82",
			"y": "175",
			"width": "5",
			"height": "9",
			"xoffset": "2",
			"yoffset": "20",
			"xadvance": "9",
			"page": "0",
			"chnl": "15"
		},
		"45": {
			"id": "45",
			"x": "129",
			"y": "174",
			"width": "7",
			"height": "6",
			"xoffset": "3",
			"yoffset": "16",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"46": {
			"id": "46",
			"x": "166",
			"y": "169",
			"width": "5",
			"height": "5",
			"xoffset": "3",
			"yoffset": "21",
			"xadvance": "9",
			"page": "0",
			"chnl": "15"
		},
		"47": {
			"id": "47",
			"x": "39",
			"y": "147",
			"width": "11",
			"height": "18",
			"xoffset": "2",
			"yoffset": "10",
			"xadvance": "13",
			"page": "0",
			"chnl": "15"
		},
		"48": {
			"id": "48",
			"x": "212",
			"y": "155",
			"width": "9",
			"height": "12",
			"xoffset": "1",
			"yoffset": "14",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"49": {
			"id": "49",
			"x": "30",
			"y": "166",
			"width": "7",
			"height": "14",
			"xoffset": "1",
			"yoffset": "12",
			"xadvance": "7",
			"page": "0",
			"chnl": "15"
		},
		"50": {
			"id": "50",
			"x": "12",
			"y": "166",
			"width": "9",
			"height": "14",
			"xoffset": "0",
			"yoffset": "13",
			"xadvance": "9",
			"page": "0",
			"chnl": "15"
		},
		"51": {
			"id": "51",
			"x": "97",
			"y": "142",
			"width": "10",
			"height": "17",
			"xoffset": "0",
			"yoffset": "13",
			"xadvance": "9",
			"page": "0",
			"chnl": "15"
		},
		"52": {
			"id": "52",
			"x": "108",
			"y": "142",
			"width": "10",
			"height": "17",
			"xoffset": "0",
			"yoffset": "13",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"53": {
			"id": "53",
			"x": "238",
			"y": "138",
			"width": "9",
			"height": "16",
			"xoffset": "0",
			"yoffset": "14",
			"xadvance": "9",
			"page": "0",
			"chnl": "15"
		},
		"54": {
			"id": "54",
			"x": "207",
			"y": "138",
			"width": "10",
			"height": "16",
			"xoffset": "1",
			"yoffset": "10",
			"xadvance": "9",
			"page": "0",
			"chnl": "15"
		},
		"55": {
			"id": "55",
			"x": "228",
			"y": "138",
			"width": "9",
			"height": "16",
			"xoffset": "1",
			"yoffset": "14",
			"xadvance": "9",
			"page": "0",
			"chnl": "15"
		},
		"56": {
			"id": "56",
			"x": "218",
			"y": "138",
			"width": "9",
			"height": "16",
			"xoffset": "0",
			"yoffset": "10",
			"xadvance": "9",
			"page": "0",
			"chnl": "15"
		},
		"57": {
			"id": "57",
			"x": "196",
			"y": "138",
			"width": "10",
			"height": "16",
			"xoffset": "0",
			"yoffset": "14",
			"xadvance": "9",
			"page": "0",
			"chnl": "15"
		},
		"58": {
			"id": "58",
			"x": "283",
			"y": "149",
			"width": "6",
			"height": "11",
			"xoffset": "3",
			"yoffset": "15",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"59": {
			"id": "59",
			"x": "22",
			"y": "166",
			"width": "7",
			"height": "14",
			"xoffset": "2",
			"yoffset": "15",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"60": {
			"id": "60",
			"x": "126",
			"y": "160",
			"width": "9",
			"height": "13",
			"xoffset": "2",
			"yoffset": "13",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"61": {
			"id": "61",
			"x": "41",
			"y": "180",
			"width": "10",
			"height": "9",
			"xoffset": "2",
			"yoffset": "15",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"62": {
			"id": "62",
			"x": "202",
			"y": "155",
			"width": "9",
			"height": "12",
			"xoffset": "1",
			"yoffset": "14",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"63": {
			"id": "63",
			"x": "190",
			"y": "118",
			"width": "10",
			"height": "19",
			"xoffset": "3",
			"yoffset": "7",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"64": {
			"id": "64",
			"x": "58",
			"y": "55",
			"width": "19",
			"height": "23",
			"xoffset": "3",
			"yoffset": "8",
			"xadvance": "22",
			"page": "0",
			"chnl": "15"
		},
		"65": {
			"id": "65",
			"x": "138",
			"y": "77",
			"width": "23",
			"height": "20",
			"xoffset": "0",
			"yoffset": "7",
			"xadvance": "20",
			"page": "0",
			"chnl": "15"
		},
		"66": {
			"id": "66",
			"x": "18",
			"y": "127",
			"width": "16",
			"height": "19",
			"xoffset": "0",
			"yoffset": "7",
			"xadvance": "16",
			"page": "0",
			"chnl": "15"
		},
		"67": {
			"id": "67",
			"x": "218",
			"y": "77",
			"width": "13",
			"height": "20",
			"xoffset": "1",
			"yoffset": "7",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"68": {
			"id": "68",
			"x": "225",
			"y": "98",
			"width": "17",
			"height": "19",
			"xoffset": "0",
			"yoffset": "7",
			"xadvance": "17",
			"page": "0",
			"chnl": "15"
		},
		"69": {
			"id": "69",
			"x": "203",
			"y": "77",
			"width": "14",
			"height": "20",
			"xoffset": "1",
			"yoffset": "7",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"70": {
			"id": "70",
			"x": "129",
			"y": "54",
			"width": "19",
			"height": "22",
			"xoffset": "0",
			"yoffset": "7",
			"xadvance": "15",
			"page": "0",
			"chnl": "15"
		},
		"71": {
			"id": "71",
			"x": "0",
			"y": "59",
			"width": "13",
			"height": "24",
			"xoffset": "1",
			"yoffset": "7",
			"xadvance": "14",
			"page": "0",
			"chnl": "15"
		},
		"72": {
			"id": "72",
			"x": "248",
			"y": "52",
			"width": "23",
			"height": "21",
			"xoffset": "0",
			"yoffset": "6",
			"xadvance": "21",
			"page": "0",
			"chnl": "15"
		},
		"73": {
			"id": "73",
			"x": "51",
			"y": "127",
			"width": "14",
			"height": "19",
			"xoffset": "0",
			"yoffset": "7",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"74": {
			"id": "74",
			"x": "78",
			"y": "55",
			"width": "19",
			"height": "23",
			"xoffset": "0",
			"yoffset": "7",
			"xadvance": "17",
			"page": "0",
			"chnl": "15"
		},
		"75": {
			"id": "75",
			"x": "0",
			"y": "84",
			"width": "18",
			"height": "21",
			"xoffset": "0",
			"yoffset": "6",
			"xadvance": "16",
			"page": "0",
			"chnl": "15"
		},
		"76": {
			"id": "76",
			"x": "149",
			"y": "54",
			"width": "17",
			"height": "22",
			"xoffset": "0",
			"yoffset": "7",
			"xadvance": "15",
			"page": "0",
			"chnl": "15"
		},
		"77": {
			"id": "77",
			"x": "220",
			"y": "53",
			"width": "27",
			"height": "21",
			"xoffset": "0",
			"yoffset": "6",
			"xadvance": "25",
			"page": "0",
			"chnl": "15"
		},
		"78": {
			"id": "78",
			"x": "162",
			"y": "77",
			"width": "23",
			"height": "20",
			"xoffset": "0",
			"yoffset": "7",
			"xadvance": "20",
			"page": "0",
			"chnl": "15"
		},
		"79": {
			"id": "79",
			"x": "261",
			"y": "95",
			"width": "17",
			"height": "19",
			"xoffset": "1",
			"yoffset": "7",
			"xadvance": "15",
			"page": "0",
			"chnl": "15"
		},
		"80": {
			"id": "80",
			"x": "167",
			"y": "54",
			"width": "17",
			"height": "22",
			"xoffset": "0",
			"yoffset": "6",
			"xadvance": "16",
			"page": "0",
			"chnl": "15"
		},
		"81": {
			"id": "81",
			"x": "110",
			"y": "28",
			"width": "24",
			"height": "25",
			"xoffset": "0",
			"yoffset": "7",
			"xadvance": "15",
			"page": "0",
			"chnl": "15"
		},
		"82": {
			"id": "82",
			"x": "186",
			"y": "77",
			"width": "16",
			"height": "20",
			"xoffset": "1",
			"yoffset": "7",
			"xadvance": "16",
			"page": "0",
			"chnl": "15"
		},
		"83": {
			"id": "83",
			"x": "232",
			"y": "75",
			"width": "13",
			"height": "20",
			"xoffset": "0",
			"yoffset": "7",
			"xadvance": "13",
			"page": "0",
			"chnl": "15"
		},
		"84": {
			"id": "84",
			"x": "272",
			"y": "52",
			"width": "20",
			"height": "21",
			"xoffset": "0",
			"yoffset": "6",
			"xadvance": "14",
			"page": "0",
			"chnl": "15"
		},
		"85": {
			"id": "85",
			"x": "35",
			"y": "127",
			"width": "15",
			"height": "19",
			"xoffset": "1",
			"yoffset": "7",
			"xadvance": "15",
			"page": "0",
			"chnl": "15"
		},
		"86": {
			"id": "86",
			"x": "243",
			"y": "96",
			"width": "17",
			"height": "19",
			"xoffset": "1",
			"yoffset": "7",
			"xadvance": "17",
			"page": "0",
			"chnl": "15"
		},
		"87": {
			"id": "87",
			"x": "159",
			"y": "98",
			"width": "23",
			"height": "19",
			"xoffset": "1",
			"yoffset": "7",
			"xadvance": "22",
			"page": "0",
			"chnl": "15"
		},
		"88": {
			"id": "88",
			"x": "204",
			"y": "98",
			"width": "20",
			"height": "19",
			"xoffset": "1",
			"yoffset": "7",
			"xadvance": "19",
			"page": "0",
			"chnl": "15"
		},
		"89": {
			"id": "89",
			"x": "245",
			"y": "27",
			"width": "18",
			"height": "24",
			"xoffset": "1",
			"yoffset": "7",
			"xadvance": "17",
			"page": "0",
			"chnl": "15"
		},
		"90": {
			"id": "90",
			"x": "153",
			"y": "28",
			"width": "16",
			"height": "25",
			"xoffset": "1",
			"yoffset": "7",
			"xadvance": "13",
			"page": "0",
			"chnl": "15"
		},
		"91": {
			"id": "91",
			"x": "209",
			"y": "54",
			"width": "10",
			"height": "22",
			"xoffset": "2",
			"yoffset": "8",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"92": {
			"id": "92",
			"x": "90",
			"y": "142",
			"width": "6",
			"height": "18",
			"xoffset": "3",
			"yoffset": "10",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"93": {
			"id": "93",
			"x": "71",
			"y": "79",
			"width": "11",
			"height": "21",
			"xoffset": "0",
			"yoffset": "9",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"94": {
			"id": "94",
			"x": "73",
			"y": "180",
			"width": "8",
			"height": "9",
			"xoffset": "2",
			"yoffset": "8",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"95": {
			"id": "95",
			"x": "157",
			"y": "171",
			"width": "8",
			"height": "5",
			"xoffset": "2",
			"yoffset": "21",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"96": {
			"id": "96",
			"x": "295",
			"y": "36",
			"width": "4",
			"height": "7",
			"xoffset": "1",
			"yoffset": "6",
			"xadvance": "7",
			"page": "0",
			"chnl": "15"
		},
		"97": {
			"id": "97",
			"x": "264",
			"y": "135",
			"width": "12",
			"height": "14",
			"xoffset": "0",
			"yoffset": "12",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"98": {
			"id": "98",
			"x": "223",
			"y": "118",
			"width": "9",
			"height": "19",
			"xoffset": "1",
			"yoffset": "7",
			"xadvance": "9",
			"page": "0",
			"chnl": "15"
		},
		"99": {
			"id": "99",
			"x": "93",
			"y": "161",
			"width": "10",
			"height": "13",
			"xoffset": "0",
			"yoffset": "13",
			"xadvance": "8",
			"page": "0",
			"chnl": "15"
		},
		"100": {
			"id": "100",
			"x": "212",
			"y": "118",
			"width": "10",
			"height": "19",
			"xoffset": "0",
			"yoffset": "7",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"101": {
			"id": "101",
			"x": "104",
			"y": "160",
			"width": "10",
			"height": "13",
			"xoffset": "0",
			"yoffset": "13",
			"xadvance": "8",
			"page": "0",
			"chnl": "15"
		},
		"102": {
			"id": "102",
			"x": "27",
			"y": "59",
			"width": "10",
			"height": "24",
			"xoffset": "0",
			"yoffset": "7",
			"xadvance": "8",
			"page": "0",
			"chnl": "15"
		},
		"103": {
			"id": "103",
			"x": "137",
			"y": "121",
			"width": "13",
			"height": "19",
			"xoffset": "0",
			"yoffset": "12",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"104": {
			"id": "104",
			"x": "123",
			"y": "121",
			"width": "13",
			"height": "19",
			"xoffset": "0",
			"yoffset": "7",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"105": {
			"id": "105",
			"x": "72",
			"y": "142",
			"width": "8",
			"height": "18",
			"xoffset": "0",
			"yoffset": "8",
			"xadvance": "6",
			"page": "0",
			"chnl": "15"
		},
		"106": {
			"id": "106",
			"x": "233",
			"y": "27",
			"width": "11",
			"height": "25",
			"xoffset": "-2",
			"yoffset": "7",
			"xadvance": "6",
			"page": "0",
			"chnl": "15"
		},
		"107": {
			"id": "107",
			"x": "109",
			"y": "122",
			"width": "13",
			"height": "19",
			"xoffset": "0",
			"yoffset": "7",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"108": {
			"id": "108",
			"x": "242",
			"y": "118",
			"width": "8",
			"height": "19",
			"xoffset": "0",
			"yoffset": "7",
			"xadvance": "6",
			"page": "0",
			"chnl": "15"
		},
		"109": {
			"id": "109",
			"x": "146",
			"y": "158",
			"width": "17",
			"height": "12",
			"xoffset": "1",
			"yoffset": "14",
			"xadvance": "16",
			"page": "0",
			"chnl": "15"
		},
		"110": {
			"id": "110",
			"x": "164",
			"y": "156",
			"width": "13",
			"height": "12",
			"xoffset": "1",
			"yoffset": "14",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"111": {
			"id": "111",
			"x": "178",
			"y": "155",
			"width": "12",
			"height": "12",
			"xoffset": "0",
			"yoffset": "14",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"112": {
			"id": "112",
			"x": "0",
			"y": "106",
			"width": "13",
			"height": "20",
			"xoffset": "0",
			"yoffset": "12",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"113": {
			"id": "113",
			"x": "27",
			"y": "106",
			"width": "12",
			"height": "20",
			"xoffset": "0",
			"yoffset": "12",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"114": {
			"id": "114",
			"x": "277",
			"y": "134",
			"width": "11",
			"height": "14",
			"xoffset": "0",
			"yoffset": "12",
			"xadvance": "9",
			"page": "0",
			"chnl": "15"
		},
		"115": {
			"id": "115",
			"x": "136",
			"y": "159",
			"width": "9",
			"height": "13",
			"xoffset": "0",
			"yoffset": "13",
			"xadvance": "9",
			"page": "0",
			"chnl": "15"
		},
		"116": {
			"id": "116",
			"x": "130",
			"y": "141",
			"width": "9",
			"height": "17",
			"xoffset": "1",
			"yoffset": "9",
			"xadvance": "8",
			"page": "0",
			"chnl": "15"
		},
		"117": {
			"id": "117",
			"x": "67",
			"y": "166",
			"width": "13",
			"height": "13",
			"xoffset": "0",
			"yoffset": "13",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"118": {
			"id": "118",
			"x": "115",
			"y": "160",
			"width": "10",
			"height": "13",
			"xoffset": "0",
			"yoffset": "13",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"119": {
			"id": "119",
			"x": "38",
			"y": "166",
			"width": "14",
			"height": "13",
			"xoffset": "0",
			"yoffset": "13",
			"xadvance": "14",
			"page": "0",
			"chnl": "15"
		},
		"120": {
			"id": "120",
			"x": "53",
			"y": "166",
			"width": "13",
			"height": "13",
			"xoffset": "0",
			"yoffset": "13",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"121": {
			"id": "121",
			"x": "284",
			"y": "115",
			"width": "12",
			"height": "18",
			"xoffset": "1",
			"yoffset": "13",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"122": {
			"id": "122",
			"x": "289",
			"y": "134",
			"width": "10",
			"height": "14",
			"xoffset": "0",
			"yoffset": "13",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"123": {
			"id": "123",
			"x": "197",
			"y": "54",
			"width": "11",
			"height": "22",
			"xoffset": "3",
			"yoffset": "8",
			"xadvance": "13",
			"page": "0",
			"chnl": "15"
		},
		"124": {
			"id": "124",
			"x": "104",
			"y": "79",
			"width": "6",
			"height": "21",
			"xoffset": "4",
			"yoffset": "8",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"125": {
			"id": "125",
			"x": "185",
			"y": "54",
			"width": "11",
			"height": "22",
			"xoffset": "1",
			"yoffset": "8",
			"xadvance": "13",
			"page": "0",
			"chnl": "15"
		},
		"126": {
			"id": "126",
			"x": "110",
			"y": "174",
			"width": "9",
			"height": "6",
			"xoffset": "2",
			"yoffset": "8",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"160": {
			"id": "160",
			"x": "19",
			"y": "30",
			"width": "1",
			"height": "1",
			"xoffset": "0",
			"yoffset": "31",
			"xadvance": "5",
			"page": "0",
			"chnl": "15"
		},
		"161": {
			"id": "161",
			"x": "81",
			"y": "142",
			"width": "8",
			"height": "18",
			"xoffset": "0",
			"yoffset": "14",
			"xadvance": "8",
			"page": "0",
			"chnl": "15"
		},
		"162": {
			"id": "162",
			"x": "111",
			"y": "100",
			"width": "9",
			"height": "20",
			"xoffset": "1",
			"yoffset": "10",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"163": {
			"id": "163",
			"x": "184",
			"y": "138",
			"width": "11",
			"height": "16",
			"xoffset": "1",
			"yoffset": "12",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"164": {
			"id": "164",
			"x": "0",
			"y": "166",
			"width": "11",
			"height": "14",
			"xoffset": "1",
			"yoffset": "12",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"165": {
			"id": "165",
			"x": "26",
			"y": "147",
			"width": "12",
			"height": "18",
			"xoffset": "0",
			"yoffset": "12",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"166": {
			"id": "166",
			"x": "293",
			"y": "52",
			"width": "6",
			"height": "21",
			"xoffset": "4",
			"yoffset": "8",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"167": {
			"id": "167",
			"x": "288",
			"y": "74",
			"width": "11",
			"height": "20",
			"xoffset": "1",
			"yoffset": "9",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"168": {
			"id": "168",
			"x": "120",
			"y": "174",
			"width": "8",
			"height": "6",
			"xoffset": "2",
			"yoffset": "7",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"169": {
			"id": "169",
			"x": "140",
			"y": "141",
			"width": "15",
			"height": "16",
			"xoffset": "1",
			"yoffset": "11",
			"xadvance": "18",
			"page": "0",
			"chnl": "15"
		},
		"170": {
			"id": "170",
			"x": "0",
			"y": "181",
			"width": "10",
			"height": "10",
			"xoffset": "2",
			"yoffset": "11",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"171": {
			"id": "171",
			"x": "245",
			"y": "155",
			"width": "14",
			"height": "11",
			"xoffset": "4",
			"yoffset": "14",
			"xadvance": "20",
			"page": "0",
			"chnl": "15"
		},
		"172": {
			"id": "172",
			"x": "145",
			"y": "173",
			"width": "11",
			"height": "5",
			"xoffset": "2",
			"yoffset": "17",
			"xadvance": "17",
			"page": "0",
			"chnl": "15"
		},
		"173": {
			"id": "173",
			"x": "137",
			"y": "173",
			"width": "7",
			"height": "6",
			"xoffset": "3",
			"yoffset": "16",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"174": {
			"id": "174",
			"x": "156",
			"y": "139",
			"width": "15",
			"height": "16",
			"xoffset": "4",
			"yoffset": "6",
			"xadvance": "19",
			"page": "0",
			"chnl": "15"
		},
		"175": {
			"id": "175",
			"x": "53",
			"y": "122",
			"width": "8",
			"height": "4",
			"xoffset": "2",
			"yoffset": "8",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"176": {
			"id": "176",
			"x": "88",
			"y": "175",
			"width": "7",
			"height": "7",
			"xoffset": "1",
			"yoffset": "8",
			"xadvance": "9",
			"page": "0",
			"chnl": "15"
		},
		"177": {
			"id": "177",
			"x": "260",
			"y": "153",
			"width": "11",
			"height": "11",
			"xoffset": "1",
			"yoffset": "14",
			"xadvance": "13",
			"page": "0",
			"chnl": "15"
		},
		"178": {
			"id": "178",
			"x": "21",
			"y": "181",
			"width": "7",
			"height": "10",
			"xoffset": "1",
			"yoffset": "11",
			"xadvance": "8",
			"page": "0",
			"chnl": "15"
		},
		"179": {
			"id": "179",
			"x": "222",
			"y": "155",
			"width": "7",
			"height": "12",
			"xoffset": "1",
			"yoffset": "11",
			"xadvance": "8",
			"page": "0",
			"chnl": "15"
		},
		"180": {
			"id": "180",
			"x": "96",
			"y": "175",
			"width": "6",
			"height": "7",
			"xoffset": "1",
			"yoffset": "6",
			"xadvance": "7",
			"page": "0",
			"chnl": "15"
		},
		"181": {
			"id": "181",
			"x": "172",
			"y": "138",
			"width": "11",
			"height": "16",
			"xoffset": "2",
			"yoffset": "14",
			"xadvance": "14",
			"page": "0",
			"chnl": "15"
		},
		"182": {
			"id": "182",
			"x": "269",
			"y": "115",
			"width": "14",
			"height": "18",
			"xoffset": "1",
			"yoffset": "13",
			"xadvance": "17",
			"page": "0",
			"chnl": "15"
		},
		"183": {
			"id": "183",
			"x": "295",
			"y": "44",
			"width": "4",
			"height": "5",
			"xoffset": "4",
			"yoffset": "17",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"184": {
			"id": "184",
			"x": "103",
			"y": "175",
			"width": "6",
			"height": "7",
			"xoffset": "2",
			"yoffset": "24",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"185": {
			"id": "185",
			"x": "290",
			"y": "149",
			"width": "5",
			"height": "11",
			"xoffset": "2",
			"yoffset": "10",
			"xadvance": "6",
			"page": "0",
			"chnl": "15"
		},
		"186": {
			"id": "186",
			"x": "63",
			"y": "180",
			"width": "9",
			"height": "9",
			"xoffset": "2",
			"yoffset": "11",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"187": {
			"id": "187",
			"x": "230",
			"y": "155",
			"width": "14",
			"height": "11",
			"xoffset": "4",
			"yoffset": "14",
			"xadvance": "20",
			"page": "0",
			"chnl": "15"
		},
		"188": {
			"id": "188",
			"x": "0",
			"y": "127",
			"width": "17",
			"height": "19",
			"xoffset": "2",
			"yoffset": "10",
			"xadvance": "19",
			"page": "0",
			"chnl": "15"
		},
		"189": {
			"id": "189",
			"x": "251",
			"y": "116",
			"width": "17",
			"height": "18",
			"xoffset": "2",
			"yoffset": "10",
			"xadvance": "20",
			"page": "0",
			"chnl": "15"
		},
		"190": {
			"id": "190",
			"x": "183",
			"y": "98",
			"width": "20",
			"height": "19",
			"xoffset": "1",
			"yoffset": "10",
			"xadvance": "22",
			"page": "0",
			"chnl": "15"
		},
		"191": {
			"id": "191",
			"x": "51",
			"y": "147",
			"width": "10",
			"height": "18",
			"xoffset": "0",
			"yoffset": "14",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"192": {
			"id": "192",
			"x": "140",
			"y": "0",
			"width": "23",
			"height": "27",
			"xoffset": "0",
			"yoffset": "0",
			"xadvance": "20",
			"page": "0",
			"chnl": "15"
		},
		"193": {
			"id": "193",
			"x": "116",
			"y": "0",
			"width": "23",
			"height": "27",
			"xoffset": "0",
			"yoffset": "0",
			"xadvance": "20",
			"page": "0",
			"chnl": "15"
		},
		"194": {
			"id": "194",
			"x": "44",
			"y": "0",
			"width": "23",
			"height": "27",
			"xoffset": "0",
			"yoffset": "0",
			"xadvance": "20",
			"page": "0",
			"chnl": "15"
		},
		"195": {
			"id": "195",
			"x": "19",
			"y": "0",
			"width": "24",
			"height": "27",
			"xoffset": "0",
			"yoffset": "0",
			"xadvance": "20",
			"page": "0",
			"chnl": "15"
		},
		"196": {
			"id": "196",
			"x": "209",
			"y": "0",
			"width": "23",
			"height": "26",
			"xoffset": "0",
			"yoffset": "1",
			"xadvance": "20",
			"page": "0",
			"chnl": "15"
		},
		"197": {
			"id": "197",
			"x": "68",
			"y": "0",
			"width": "23",
			"height": "27",
			"xoffset": "0",
			"yoffset": "0",
			"xadvance": "20",
			"page": "0",
			"chnl": "15"
		},
		"198": {
			"id": "198",
			"x": "111",
			"y": "79",
			"width": "26",
			"height": "20",
			"xoffset": "0",
			"yoffset": "7",
			"xadvance": "24",
			"page": "0",
			"chnl": "15"
		},
		"199": {
			"id": "199",
			"x": "281",
			"y": "27",
			"width": "13",
			"height": "24",
			"xoffset": "1",
			"yoffset": "7",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"200": {
			"id": "200",
			"x": "194",
			"y": "0",
			"width": "14",
			"height": "27",
			"xoffset": "1",
			"yoffset": "0",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"201": {
			"id": "201",
			"x": "179",
			"y": "0",
			"width": "14",
			"height": "27",
			"xoffset": "1",
			"yoffset": "0",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"202": {
			"id": "202",
			"x": "164",
			"y": "0",
			"width": "14",
			"height": "27",
			"xoffset": "1",
			"yoffset": "0",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"203": {
			"id": "203",
			"x": "50",
			"y": "28",
			"width": "14",
			"height": "26",
			"xoffset": "1",
			"yoffset": "1",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"204": {
			"id": "204",
			"x": "95",
			"y": "28",
			"width": "14",
			"height": "26",
			"xoffset": "0",
			"yoffset": "0",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"205": {
			"id": "205",
			"x": "80",
			"y": "28",
			"width": "14",
			"height": "26",
			"xoffset": "0",
			"yoffset": "0",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"206": {
			"id": "206",
			"x": "65",
			"y": "28",
			"width": "14",
			"height": "26",
			"xoffset": "0",
			"yoffset": "0",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"207": {
			"id": "207",
			"x": "218",
			"y": "27",
			"width": "14",
			"height": "25",
			"xoffset": "0",
			"yoffset": "1",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"208": {
			"id": "208",
			"x": "279",
			"y": "95",
			"width": "17",
			"height": "19",
			"xoffset": "0",
			"yoffset": "7",
			"xadvance": "17",
			"page": "0",
			"chnl": "15"
		},
		"209": {
			"id": "209",
			"x": "92",
			"y": "0",
			"width": "23",
			"height": "27",
			"xoffset": "0",
			"yoffset": "0",
			"xadvance": "20",
			"page": "0",
			"chnl": "15"
		},
		"210": {
			"id": "210",
			"x": "0",
			"y": "32",
			"width": "17",
			"height": "26",
			"xoffset": "1",
			"yoffset": "0",
			"xadvance": "15",
			"page": "0",
			"chnl": "15"
		},
		"211": {
			"id": "211",
			"x": "269",
			"y": "0",
			"width": "17",
			"height": "26",
			"xoffset": "1",
			"yoffset": "0",
			"xadvance": "15",
			"page": "0",
			"chnl": "15"
		},
		"212": {
			"id": "212",
			"x": "251",
			"y": "0",
			"width": "17",
			"height": "26",
			"xoffset": "1",
			"yoffset": "0",
			"xadvance": "15",
			"page": "0",
			"chnl": "15"
		},
		"213": {
			"id": "213",
			"x": "233",
			"y": "0",
			"width": "17",
			"height": "26",
			"xoffset": "1",
			"yoffset": "0",
			"xadvance": "15",
			"page": "0",
			"chnl": "15"
		},
		"214": {
			"id": "214",
			"x": "135",
			"y": "28",
			"width": "17",
			"height": "25",
			"xoffset": "1",
			"yoffset": "1",
			"xadvance": "15",
			"page": "0",
			"chnl": "15"
		},
		"215": {
			"id": "215",
			"x": "11",
			"y": "181",
			"width": "9",
			"height": "10",
			"xoffset": "2",
			"yoffset": "15",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"216": {
			"id": "216",
			"x": "18",
			"y": "32",
			"width": "15",
			"height": "26",
			"xoffset": "1",
			"yoffset": "4",
			"xadvance": "16",
			"page": "0",
			"chnl": "15"
		},
		"217": {
			"id": "217",
			"x": "186",
			"y": "28",
			"width": "15",
			"height": "25",
			"xoffset": "1",
			"yoffset": "1",
			"xadvance": "15",
			"page": "0",
			"chnl": "15"
		},
		"218": {
			"id": "218",
			"x": "170",
			"y": "28",
			"width": "15",
			"height": "25",
			"xoffset": "1",
			"yoffset": "1",
			"xadvance": "15",
			"page": "0",
			"chnl": "15"
		},
		"219": {
			"id": "219",
			"x": "34",
			"y": "28",
			"width": "15",
			"height": "26",
			"xoffset": "1",
			"yoffset": "0",
			"xadvance": "15",
			"page": "0",
			"chnl": "15"
		},
		"220": {
			"id": "220",
			"x": "202",
			"y": "28",
			"width": "15",
			"height": "25",
			"xoffset": "1",
			"yoffset": "1",
			"xadvance": "15",
			"page": "0",
			"chnl": "15"
		},
		"221": {
			"id": "221",
			"x": "0",
			"y": "0",
			"width": "18",
			"height": "31",
			"xoffset": "1",
			"yoffset": "0",
			"xadvance": "17",
			"page": "0",
			"chnl": "15"
		},
		"222": {
			"id": "222",
			"x": "264",
			"y": "27",
			"width": "16",
			"height": "24",
			"xoffset": "0",
			"yoffset": "4",
			"xadvance": "16",
			"page": "0",
			"chnl": "15"
		},
		"223": {
			"id": "223",
			"x": "98",
			"y": "55",
			"width": "16",
			"height": "23",
			"xoffset": "-4",
			"yoffset": "8",
			"xadvance": "12",
			"page": "0",
			"chnl": "15"
		},
		"224": {
			"id": "224",
			"x": "19",
			"y": "84",
			"width": "12",
			"height": "21",
			"xoffset": "0",
			"yoffset": "5",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"225": {
			"id": "225",
			"x": "32",
			"y": "84",
			"width": "12",
			"height": "21",
			"xoffset": "0",
			"yoffset": "5",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"226": {
			"id": "226",
			"x": "45",
			"y": "79",
			"width": "12",
			"height": "21",
			"xoffset": "0",
			"yoffset": "5",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"227": {
			"id": "227",
			"x": "14",
			"y": "106",
			"width": "12",
			"height": "20",
			"xoffset": "0",
			"yoffset": "6",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"228": {
			"id": "228",
			"x": "177",
			"y": "118",
			"width": "12",
			"height": "19",
			"xoffset": "0",
			"yoffset": "7",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"229": {
			"id": "229",
			"x": "58",
			"y": "79",
			"width": "12",
			"height": "21",
			"xoffset": "0",
			"yoffset": "5",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"230": {
			"id": "230",
			"x": "248",
			"y": "138",
			"width": "15",
			"height": "14",
			"xoffset": "0",
			"yoffset": "12",
			"xadvance": "13",
			"page": "0",
			"chnl": "15"
		},
		"231": {
			"id": "231",
			"x": "119",
			"y": "142",
			"width": "10",
			"height": "17",
			"xoffset": "0",
			"yoffset": "13",
			"xadvance": "8",
			"page": "0",
			"chnl": "15"
		},
		"232": {
			"id": "232",
			"x": "78",
			"y": "101",
			"width": "10",
			"height": "20",
			"xoffset": "0",
			"yoffset": "6",
			"xadvance": "8",
			"page": "0",
			"chnl": "15"
		},
		"233": {
			"id": "233",
			"x": "100",
			"y": "101",
			"width": "10",
			"height": "20",
			"xoffset": "0",
			"yoffset": "6",
			"xadvance": "8",
			"page": "0",
			"chnl": "15"
		},
		"234": {
			"id": "234",
			"x": "89",
			"y": "101",
			"width": "10",
			"height": "20",
			"xoffset": "0",
			"yoffset": "6",
			"xadvance": "8",
			"page": "0",
			"chnl": "15"
		},
		"235": {
			"id": "235",
			"x": "201",
			"y": "118",
			"width": "10",
			"height": "19",
			"xoffset": "0",
			"yoffset": "7",
			"xadvance": "8",
			"page": "0",
			"chnl": "15"
		},
		"236": {
			"id": "236",
			"x": "141",
			"y": "98",
			"width": "8",
			"height": "20",
			"xoffset": "0",
			"yoffset": "6",
			"xadvance": "6",
			"page": "0",
			"chnl": "15"
		},
		"237": {
			"id": "237",
			"x": "131",
			"y": "100",
			"width": "9",
			"height": "20",
			"xoffset": "0",
			"yoffset": "6",
			"xadvance": "6",
			"page": "0",
			"chnl": "15"
		},
		"238": {
			"id": "238",
			"x": "150",
			"y": "98",
			"width": "8",
			"height": "20",
			"xoffset": "0",
			"yoffset": "6",
			"xadvance": "6",
			"page": "0",
			"chnl": "15"
		},
		"239": {
			"id": "239",
			"x": "62",
			"y": "147",
			"width": "9",
			"height": "18",
			"xoffset": "0",
			"yoffset": "8",
			"xadvance": "6",
			"page": "0",
			"chnl": "15"
		},
		"240": {
			"id": "240",
			"x": "66",
			"y": "101",
			"width": "11",
			"height": "20",
			"xoffset": "0",
			"yoffset": "6",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"241": {
			"id": "241",
			"x": "95",
			"y": "122",
			"width": "13",
			"height": "19",
			"xoffset": "1",
			"yoffset": "7",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"242": {
			"id": "242",
			"x": "164",
			"y": "118",
			"width": "12",
			"height": "19",
			"xoffset": "0",
			"yoffset": "7",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"243": {
			"id": "243",
			"x": "40",
			"y": "106",
			"width": "12",
			"height": "20",
			"xoffset": "0",
			"yoffset": "6",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"244": {
			"id": "244",
			"x": "53",
			"y": "101",
			"width": "12",
			"height": "20",
			"xoffset": "0",
			"yoffset": "6",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"245": {
			"id": "245",
			"x": "151",
			"y": "119",
			"width": "12",
			"height": "19",
			"xoffset": "0",
			"yoffset": "7",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"246": {
			"id": "246",
			"x": "0",
			"y": "147",
			"width": "12",
			"height": "18",
			"xoffset": "0",
			"yoffset": "8",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"247": {
			"id": "247",
			"x": "29",
			"y": "181",
			"width": "11",
			"height": "9",
			"xoffset": "1",
			"yoffset": "15",
			"xadvance": "13",
			"page": "0",
			"chnl": "15"
		},
		"248": {
			"id": "248",
			"x": "13",
			"y": "147",
			"width": "12",
			"height": "18",
			"xoffset": "0",
			"yoffset": "10",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"249": {
			"id": "249",
			"x": "246",
			"y": "75",
			"width": "13",
			"height": "20",
			"xoffset": "0",
			"yoffset": "6",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"250": {
			"id": "250",
			"x": "260",
			"y": "74",
			"width": "13",
			"height": "20",
			"xoffset": "0",
			"yoffset": "6",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"251": {
			"id": "251",
			"x": "274",
			"y": "74",
			"width": "13",
			"height": "20",
			"xoffset": "0",
			"yoffset": "6",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"252": {
			"id": "252",
			"x": "81",
			"y": "122",
			"width": "13",
			"height": "19",
			"xoffset": "0",
			"yoffset": "7",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"253": {
			"id": "253",
			"x": "287",
			"y": "0",
			"width": "12",
			"height": "25",
			"xoffset": "1",
			"yoffset": "6",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		},
		"254": {
			"id": "254",
			"x": "115",
			"y": "54",
			"width": "13",
			"height": "23",
			"xoffset": "0",
			"yoffset": "9",
			"xadvance": "11",
			"page": "0",
			"chnl": "15"
		},
		"255": {
			"id": "255",
			"x": "14",
			"y": "59",
			"width": "12",
			"height": "24",
			"xoffset": "1",
			"yoffset": "7",
			"xadvance": "10",
			"page": "0",
			"chnl": "15"
		}
	},
	"name": "BelloPro",
	"image": "images/ttf/BelloPro_0.png"
}
	}
)
;
define('spell/client/util/font/createFontWriter',[],
	function() {
		"use strict"


		/**
		 * NOTE: The code that deals with text rendering should not know anything about world scaling or screen dimensions. It should only blit text on a
		 * texture which can then be used to do the actual drawing on the color buffer.
		 */

		//TODO: get constants from a global configuration
		var constants = {
			"xSize" : 1024,
			"ySize" : 768
		}

        var FontWriter = function( font, bitmap ) {

            var getCharInfo = function( char ) {
                return font.chars[ char ]
            }

            var drawChar = function( context, char, rgbColor, scale, posX, posY ) {

                var charInfo = getCharInfo( char )

                var sx = parseInt( charInfo.x ),
                    sy = parseInt( charInfo.y ),
                    sw = parseInt( charInfo.width ),
                    sh = parseInt( charInfo.height ),
                    dx = parseInt( posX ) + charInfo.xoffset * scale,
                    dy = constants.ySize - ( parseInt( posY ) + sh + charInfo.yoffset * scale ),
                    dw = charInfo.width * scale,
                    dh = charInfo.height * scale

                context.drawSubTexture( bitmap, sx, sy, sw, sh, dx, dy, dw, dh )

//                colorize( context, rgbColor, dx, dy, dw, dh )
            }

            var colorize = function( context, rgbColor, x, y, width, height ) {

                var imgdata = context.getImageData(
                    x,
                    y,
                    width,
                    height
                )

                var pixel = imgdata.data

                for ( var i = 0; i < pixel.length; i += 4 ) {
                    pixel[ i   ] = rgbColor[ 0 ] * pixel[ i   ]
                    pixel[ i+1 ] = rgbColor[ 1 ] * pixel[ i+1 ]
                    pixel[ i+2 ] = rgbColor[ 2 ] * pixel[ i+2 ]
                }

                context.putImageData( imgdata, x, y )
            }

            var drawString = function( context, string, rgbColor, scale, position ) {

                var stringified = string.toString()
                var posXOffset  = 0

                for( var i = 0; i < stringified.length; i++ ) {

                    var charCode = stringified.charCodeAt( i )

                    drawChar(
                        context,
                        charCode,
                        rgbColor,
                        scale,
                        position[ 0 ] + posXOffset,
                        position[ 1 ]
                    )

                    posXOffset += parseInt( getCharInfo( charCode ).xadvance ) * scale
                }

                return posXOffset
            }

            return {
                drawString: drawString
            }
        }

        return FontWriter
    }
)
;
define('spell/shared/util/zones/ZoneEntityManager',[],
	function() {
		"use strict"


		function ZoneEntityManager( globalEntityManager, zoneEntities, listeners ) {
			this.globalEntityManager = globalEntityManager
			this.zoneEntities        = zoneEntities
			this.listeners           = listeners || []
		}


		ZoneEntityManager.prototype = {
			createEntity: function( entityType, args ) {
				var entity = this.globalEntityManager.createEntity.apply( this.globalEntityManager, arguments )
				this.zoneEntities.add( entity )
				this.listeners.forEach( function( listener ) { listener.onCreateEntity( entityType, args, entity ) } )
				return entity
			},

			destroyEntity: function( entity ) {
				this.zoneEntities.remove( entity )
				this.listeners.forEach( function( listener ) { listener.onDestroyEntity( entity ) } )
			},

			addComponent: function( entity, componentType ) {
				var doesNotHaveComponent = !entity.hasOwnProperty( componentType )

				this.globalEntityManager.addComponent.apply( this.globalEntityManager, arguments )

				if ( doesNotHaveComponent ) {
					this.zoneEntities.update( entity )
				}
			},

			removeComponent: function( entity, componentType ) {
				var doesHaveComponent = entity.hasOwnProperty( componentType )

				this.globalEntityManager.removeComponent.apply( this.globalEntityManager, arguments )

				if ( doesHaveComponent ) {
					this.zoneEntities.update( entity )
				}
			}
		}


		return ZoneEntityManager
	}
)
;
define('underscore',[],
	function() {
		//     Underscore.js 1.3.1
		//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
		//     Underscore is freely distributable under the MIT license.
		//     Portions of Underscore are inspired or borrowed from Prototype,
		//     Oliver Steele's Functional, and John Resig's Micro-Templating.
		//     For all details and documentation:
		//     http://documentcloud.github.com/underscore

		// Baseline setup
		// --------------

		// Establish the root object, `window` in the browser, or `global` on the server.
		var root = this;

		// Save the previous value of the `_` variable.
		var previousUnderscore = root._;

		// Establish the object that gets returned to break out of a loop iteration.
		var breaker = {};

		// Save bytes in the minified (but not gzipped) version:
		var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

		// Create quick reference variables for speed access to core prototypes.
		var slice            = ArrayProto.slice,
				unshift          = ArrayProto.unshift,
				toString         = ObjProto.toString,
				hasOwnProperty   = ObjProto.hasOwnProperty;

		// All **ECMAScript 5** native function implementations that we hope to use
		// are declared here.
		var
				nativeForEach      = ArrayProto.forEach,
				nativeMap          = ArrayProto.map,
				nativeReduce       = ArrayProto.reduce,
				nativeReduceRight  = ArrayProto.reduceRight,
				nativeFilter       = ArrayProto.filter,
				nativeEvery        = ArrayProto.every,
				nativeSome         = ArrayProto.some,
				nativeIndexOf      = ArrayProto.indexOf,
				nativeLastIndexOf  = ArrayProto.lastIndexOf,
				nativeIsArray      = ArrayProto.isArray,
				nativeKeys         = ObjProto.keys,
				nativeBind         = FuncProto.bind;

		// Create a safe reference to the Underscore object for use below.
		var _ = function(obj) { return new wrapper(obj); };

//		// Export the Underscore object for **Node.js**, with
//		// backwards-compatibility for the old `require()` API. If we're in
//		// the browser, add `_` as a global object via a string identifier,
//		// for Closure Compiler "advanced" mode.
//		if (typeof exports !== 'undefined') {
//			if (typeof module !== 'undefined' && module.exports) {
//				exports = module.exports = _;
//			}
//			exports._ = _;
//		} else {
//			root['_'] = _;
//		}

		// Current version.
		_.VERSION = '1.3.1';

		// Collection Functions
		// --------------------

		// The cornerstone, an `each` implementation, aka `forEach`.
		// Handles objects with the built-in `forEach`, arrays, and raw objects.
		// Delegates to **ECMAScript 5**'s native `forEach` if available.
		var each = _.each = _.forEach = function(obj, iterator, context) {
			if (obj == null) return;
			if (nativeForEach && obj.forEach === nativeForEach) {
				obj.forEach(iterator, context);
			} else if (obj.length === +obj.length) {
				for (var i = 0, l = obj.length; i < l; i++) {
					if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
				}
			} else {
				for (var key in obj) {
					if (_.has(obj, key)) {
						if (iterator.call(context, obj[key], key, obj) === breaker) return;
					}
				}
			}
		};

		// Return the results of applying the iterator to each element.
		// Delegates to **ECMAScript 5**'s native `map` if available.
		_.map = _.collect = function(obj, iterator, context) {
			var results = [];
			if (obj == null) return results;
			if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
			each(obj, function(value, index, list) {
				results[results.length] = iterator.call(context, value, index, list);
			});
			if (obj.length === +obj.length) results.length = obj.length;
			return results;
		};

		// **Reduce** builds up a single result from a list of values, aka `inject`,
		// or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
		_.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
			var initial = arguments.length > 2;
			if (obj == null) obj = [];
			if (nativeReduce && obj.reduce === nativeReduce) {
				if (context) iterator = _.bind(iterator, context);
				return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
			}
			each(obj, function(value, index, list) {
				if (!initial) {
					memo = value;
					initial = true;
				} else {
					memo = iterator.call(context, memo, value, index, list);
				}
			});
			if (!initial) throw new TypeError('Reduce of empty array with no initial value');
			return memo;
		};

		// The right-associative version of reduce, also known as `foldr`.
		// Delegates to **ECMAScript 5**'s native `reduceRight` if available.
		_.reduceRight = _.foldr = function(obj, iterator, memo, context) {
			var initial = arguments.length > 2;
			if (obj == null) obj = [];
			if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
				if (context) iterator = _.bind(iterator, context);
				return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
			}
			var reversed = _.toArray(obj).reverse();
			if (context && !initial) iterator = _.bind(iterator, context);
			return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
		};

		// Return the first value which passes a truth test. Aliased as `detect`.
		_.find = _.detect = function(obj, iterator, context) {
			var result;
			any(obj, function(value, index, list) {
				if (iterator.call(context, value, index, list)) {
					result = value;
					return true;
				}
			});
			return result;
		};

		// Return all the elements that pass a truth test.
		// Delegates to **ECMAScript 5**'s native `filter` if available.
		// Aliased as `select`.
		_.filter = _.select = function(obj, iterator, context) {
			var results = [];
			if (obj == null) return results;
			if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
			each(obj, function(value, index, list) {
				if (iterator.call(context, value, index, list)) results[results.length] = value;
			});
			return results;
		};

		// Return all the elements for which a truth test fails.
		_.reject = function(obj, iterator, context) {
			var results = [];
			if (obj == null) return results;
			each(obj, function(value, index, list) {
				if (!iterator.call(context, value, index, list)) results[results.length] = value;
			});
			return results;
		};

		// Determine whether all of the elements match a truth test.
		// Delegates to **ECMAScript 5**'s native `every` if available.
		// Aliased as `all`.
		_.every = _.all = function(obj, iterator, context) {
			var result = true;
			if (obj == null) return result;
			if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
			each(obj, function(value, index, list) {
				if (!(result = result && iterator.call(context, value, index, list))) return breaker;
			});
			return result;
		};

		// Determine if at least one element in the object matches a truth test.
		// Delegates to **ECMAScript 5**'s native `some` if available.
		// Aliased as `any`.
		var any = _.some = _.any = function(obj, iterator, context) {
			iterator || (iterator = _.identity);
			var result = false;
			if (obj == null) return result;
			if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
			each(obj, function(value, index, list) {
				if (result || (result = iterator.call(context, value, index, list))) return breaker;
			});
			return !!result;
		};

		// Determine if a given value is included in the array or object using `===`.
		// Aliased as `contains`.
		_.include = _.contains = function(obj, target) {
			var found = false;
			if (obj == null) return found;
			if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
			found = any(obj, function(value) {
				return value === target;
			});
			return found;
		};

		// Invoke a method (with arguments) on every item in a collection.
		_.invoke = function(obj, method) {
			var args = slice.call(arguments, 2);
			return _.map(obj, function(value) {
				return (_.isFunction(method) ? method || value : value[method]).apply(value, args);
			});
		};

		// Convenience version of a common use case of `map`: fetching a property.
		_.pluck = function(obj, key) {
			return _.map(obj, function(value){ return value[key]; });
		};

		// Return the maximum element or (element-based computation).
		_.max = function(obj, iterator, context) {
			if (!iterator && _.isArray(obj)) return Math.max.apply(Math, obj);
			if (!iterator && _.isEmpty(obj)) return -Infinity;
			var result = {computed : -Infinity};
			each(obj, function(value, index, list) {
				var computed = iterator ? iterator.call(context, value, index, list) : value;
				computed >= result.computed && (result = {value : value, computed : computed});
			});
			return result.value;
		};

		// Return the minimum element (or element-based computation).
		_.min = function(obj, iterator, context) {
			if (!iterator && _.isArray(obj)) return Math.min.apply(Math, obj);
			if (!iterator && _.isEmpty(obj)) return Infinity;
			var result = {computed : Infinity};
			each(obj, function(value, index, list) {
				var computed = iterator ? iterator.call(context, value, index, list) : value;
				computed < result.computed && (result = {value : value, computed : computed});
			});
			return result.value;
		};

		// Shuffle an array.
		_.shuffle = function(obj) {
			var shuffled = [], rand;
			each(obj, function(value, index, list) {
				if (index == 0) {
					shuffled[0] = value;
				} else {
					rand = Math.floor(Math.random() * (index + 1));
					shuffled[index] = shuffled[rand];
					shuffled[rand] = value;
				}
			});
			return shuffled;
		};

		// Sort the object's values by a criterion produced by an iterator.
		_.sortBy = function(obj, iterator, context) {
			return _.pluck(_.map(obj, function(value, index, list) {
				return {
					value : value,
					criteria : iterator.call(context, value, index, list)
				};
			}).sort(function(left, right) {
						var a = left.criteria, b = right.criteria;
						return a < b ? -1 : a > b ? 1 : 0;
					}), 'value');
		};

		// Groups the object's values by a criterion. Pass either a string attribute
		// to group by, or a function that returns the criterion.
		_.groupBy = function(obj, val) {
			var result = {};
			var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
			each(obj, function(value, index) {
				var key = iterator(value, index);
				(result[key] || (result[key] = [])).push(value);
			});
			return result;
		};

		// Use a comparator function to figure out at what index an object should
		// be inserted so as to maintain order. Uses binary search.
		_.sortedIndex = function(array, obj, iterator) {
			iterator || (iterator = _.identity);
			var low = 0, high = array.length;
			while (low < high) {
				var mid = (low + high) >> 1;
				iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
			}
			return low;
		};

		// Safely convert anything iterable into a real, live array.
		_.toArray = function(iterable) {
			if (!iterable)                return [];
			if (iterable.toArray)         return iterable.toArray();
			if (_.isArray(iterable))      return slice.call(iterable);
			if (_.isArguments(iterable))  return slice.call(iterable);
			return _.values(iterable);
		};

		// Return the number of elements in an object.
		_.size = function(obj) {
			return _.toArray(obj).length;
		};

		// Array Functions
		// ---------------

		// Get the first element of an array. Passing **n** will return the first N
		// values in the array. Aliased as `head`. The **guard** check allows it to work
		// with `_.map`.
		_.first = _.head = function(array, n, guard) {
			return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
		};

		// Returns everything but the last entry of the array. Especcialy useful on
		// the arguments object. Passing **n** will return all the values in
		// the array, excluding the last N. The **guard** check allows it to work with
		// `_.map`.
		_.initial = function(array, n, guard) {
			return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
		};

		// Get the last element of an array. Passing **n** will return the last N
		// values in the array. The **guard** check allows it to work with `_.map`.
		_.last = function(array, n, guard) {
			if ((n != null) && !guard) {
				return slice.call(array, Math.max(array.length - n, 0));
			} else {
				return array[array.length - 1];
			}
		};

		// Returns everything but the first entry of the array. Aliased as `tail`.
		// Especially useful on the arguments object. Passing an **index** will return
		// the rest of the values in the array from that index onward. The **guard**
		// check allows it to work with `_.map`.
		_.rest = _.tail = function(array, index, guard) {
			return slice.call(array, (index == null) || guard ? 1 : index);
		};

		// Trim out all falsy values from an array.
		_.compact = function(array) {
			return _.filter(array, function(value){ return !!value; });
		};

		// Return a completely flattened version of an array.
		_.flatten = function(array, shallow) {
			return _.reduce(array, function(memo, value) {
				if (_.isArray(value)) return memo.concat(shallow ? value : _.flatten(value));
				memo[memo.length] = value;
				return memo;
			}, []);
		};

		// Return a version of the array that does not contain the specified value(s).
		_.without = function(array) {
			return _.difference(array, slice.call(arguments, 1));
		};

		// Produce a duplicate-free version of the array. If the array has already
		// been sorted, you have the option of using a faster algorithm.
		// Aliased as `unique`.
		_.uniq = _.unique = function(array, isSorted, iterator) {
			var initial = iterator ? _.map(array, iterator) : array;
			var result = [];
			_.reduce(initial, function(memo, el, i) {
				if (0 == i || (isSorted === true ? _.last(memo) != el : !_.include(memo, el))) {
					memo[memo.length] = el;
					result[result.length] = array[i];
				}
				return memo;
			}, []);
			return result;
		};

		// Produce an array that contains the union: each distinct element from all of
		// the passed-in arrays.
		_.union = function() {
			return _.uniq(_.flatten(arguments, true));
		};

		// Produce an array that contains every item shared between all the
		// passed-in arrays. (Aliased as "intersect" for back-compat.)
		_.intersection = _.intersect = function(array) {
			var rest = slice.call(arguments, 1);
			return _.filter(_.uniq(array), function(item) {
				return _.every(rest, function(other) {
					return _.indexOf(other, item) >= 0;
				});
			});
		};

		// Take the difference between one array and a number of other arrays.
		// Only the elements present in just the first array will remain.
		_.difference = function(array) {
			var rest = _.flatten(slice.call(arguments, 1));
			return _.filter(array, function(value){ return !_.include(rest, value); });
		};

		// Zip together multiple lists into a single array -- elements that share
		// an index go together.
		_.zip = function() {
			var args = slice.call(arguments);
			var length = _.max(_.pluck(args, 'length'));
			var results = new Array(length);
			for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
			return results;
		};

		// If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
		// we need this function. Return the position of the first occurrence of an
		// item in an array, or -1 if the item is not included in the array.
		// Delegates to **ECMAScript 5**'s native `indexOf` if available.
		// If the array is large and already in sort order, pass `true`
		// for **isSorted** to use binary search.
		_.indexOf = function(array, item, isSorted) {
			if (array == null) return -1;
			var i, l;
			if (isSorted) {
				i = _.sortedIndex(array, item);
				return array[i] === item ? i : -1;
			}
			if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
			for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
			return -1;
		};

		// Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
		_.lastIndexOf = function(array, item) {
			if (array == null) return -1;
			if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
			var i = array.length;
			while (i--) if (i in array && array[i] === item) return i;
			return -1;
		};

		// Generate an integer Array containing an arithmetic progression. A port of
		// the native Python `range()` function. See
		// [the Python documentation](http://docs.python.org/library/functions.html#range).
		_.range = function(start, stop, step) {
			if (arguments.length <= 1) {
				stop = start || 0;
				start = 0;
			}
			step = arguments[2] || 1;

			var len = Math.max(Math.ceil((stop - start) / step), 0);
			var idx = 0;
			var range = new Array(len);

			while(idx < len) {
				range[idx++] = start;
				start += step;
			}

			return range;
		};

		// Function (ahem) Functions
		// ------------------

		// Reusable constructor function for prototype setting.
		var ctor = function(){};

		// Create a function bound to a given object (assigning `this`, and arguments,
		// optionally). Binding with arguments is also known as `curry`.
		// Delegates to **ECMAScript 5**'s native `Function.bind` if available.
		// We check for `func.bind` first, to fail fast when `func` is undefined.
		_.bind = function bind(func, context) {
			var bound, args;
			if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
			if (!_.isFunction(func)) throw new TypeError;
			args = slice.call(arguments, 2);
			return bound = function() {
				if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
				ctor.prototype = func.prototype;
				var self = new ctor;
				var result = func.apply(self, args.concat(slice.call(arguments)));
				if (Object(result) === result) return result;
				return self;
			};
		};

		// Bind all of an object's methods to that object. Useful for ensuring that
		// all callbacks defined on an object belong to it.
		_.bindAll = function(obj) {
			var funcs = slice.call(arguments, 1);
			if (funcs.length == 0) funcs = _.functions(obj);
			each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
			return obj;
		};

		// Memoize an expensive function by storing its results.
		_.memoize = function(func, hasher) {
			var memo = {};
			hasher || (hasher = _.identity);
			return function() {
				var key = hasher.apply(this, arguments);
				return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
			};
		};

//		// Delays a function for the given number of milliseconds, and then calls
//		// it with the arguments supplied.
//		_.delay = function(func, wait) {
//			var args = slice.call(arguments, 2);
//			return setTimeout(function(){ return func.apply(func, args); }, wait);
//		};
//
//		// Defers a function, scheduling it to run after the current call stack has
//		// cleared.
//		_.defer = function(func) {
//			return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
//		};
//
//		// Returns a function, that, when invoked, will only be triggered at most once
//		// during a given window of time.
//		_.throttle = function(func, wait) {
//			var context, args, timeout, throttling, more;
//			var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
//			return function() {
//				context = this; args = arguments;
//				var later = function() {
//					timeout = null;
//					if (more) func.apply(context, args);
//					whenDone();
//				};
//				if (!timeout) timeout = setTimeout(later, wait);
//				if (throttling) {
//					more = true;
//				} else {
//					func.apply(context, args);
//				}
//				whenDone();
//				throttling = true;
//			};
//		};
//
//		// Returns a function, that, as long as it continues to be invoked, will not
//		// be triggered. The function will be called after it stops being called for
//		// N milliseconds.
//		_.debounce = function(func, wait) {
//			var timeout;
//			return function() {
//				var context = this, args = arguments;
//				var later = function() {
//					timeout = null;
//					func.apply(context, args);
//				};
//				clearTimeout(timeout);
//				timeout = setTimeout(later, wait);
//			};
//		};

		// Returns a function that will be executed at most one time, no matter how
		// often you call it. Useful for lazy initialization.
		_.once = function(func) {
			var ran = false, memo;
			return function() {
				if (ran) return memo;
				ran = true;
				return memo = func.apply(this, arguments);
			};
		};

		// Returns the first function passed as an argument to the second,
		// allowing you to adjust arguments, run code before and after, and
		// conditionally execute the original function.
		_.wrap = function(func, wrapper) {
			return function() {
				var args = [func].concat(slice.call(arguments, 0));
				return wrapper.apply(this, args);
			};
		};

		// Returns a function that is the composition of a list of functions, each
		// consuming the return value of the function that follows.
		_.compose = function() {
			var funcs = arguments;
			return function() {
				var args = arguments;
				for (var i = funcs.length - 1; i >= 0; i--) {
					args = [funcs[i].apply(this, args)];
				}
				return args[0];
			};
		};

		// Returns a function that will only be executed after being called N times.
		_.after = function(times, func) {
			if (times <= 0) return func();
			return function() {
				if (--times < 1) { return func.apply(this, arguments); }
			};
		};

		// Object Functions
		// ----------------

		// Retrieve the names of an object's properties.
		// Delegates to **ECMAScript 5**'s native `Object.keys`
		_.keys = nativeKeys || function(obj) {
			if (obj !== Object(obj)) throw new TypeError('Invalid object');
			var keys = [];
			for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
			return keys;
		};

		// Retrieve the values of an object's properties.
		_.values = function(obj) {
			return _.map(obj, _.identity);
		};

		// Return a sorted list of the function names available on the object.
		// Aliased as `methods`
		_.functions = _.methods = function(obj) {
			var names = [];
			for (var key in obj) {
				if (_.isFunction(obj[key])) names.push(key);
			}
			return names.sort();
		};

		// Extend a given object with all the properties in passed-in object(s).
		_.extend = function(obj) {
			each(slice.call(arguments, 1), function(source) {
				for (var prop in source) {
					obj[prop] = source[prop];
				}
			});
			return obj;
		};

		// Fill in a given object with default properties.
		_.defaults = function(obj) {
			each(slice.call(arguments, 1), function(source) {
				for (var prop in source) {
					if (obj[prop] == null) obj[prop] = source[prop];
				}
			});
			return obj;
		};

		// Create a (shallow-cloned) duplicate of an object.
		_.clone = function(obj) {
			if (!_.isObject(obj)) return obj;
			return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
		};

		// Invokes interceptor with the obj, and then returns obj.
		// The primary purpose of this method is to "tap into" a method chain, in
		// order to perform operations on intermediate results within the chain.
		_.tap = function(obj, interceptor) {
			interceptor(obj);
			return obj;
		};

		// Internal recursive comparison function.
		function eq(a, b, stack) {
			// Identical objects are equal. `0 === -0`, but they aren't identical.
			// See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
			if (a === b) return a !== 0 || 1 / a == 1 / b;
			// A strict comparison is necessary because `null == undefined`.
			if (a == null || b == null) return a === b;
			// Unwrap any wrapped objects.
			if (a._chain) a = a._wrapped;
			if (b._chain) b = b._wrapped;
			// Invoke a custom `isEqual` method if one is provided.
			if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
			if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
			// Compare `[[Class]]` names.
			var className = toString.call(a);
			if (className != toString.call(b)) return false;
			switch (className) {
				// Strings, numbers, dates, and booleans are compared by value.
				case '[object String]':
					// Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
					// equivalent to `new String("5")`.
					return a == String(b);
				case '[object Number]':
					// `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
					// other numeric values.
					return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
				case '[object Date]':
				case '[object Boolean]':
					// Coerce dates and booleans to numeric primitive values. Dates are compared by their
					// millisecond representations. Note that invalid dates with millisecond representations
					// of `NaN` are not equivalent.
					return +a == +b;
				// RegExps are compared by their source patterns and flags.
				case '[object RegExp]':
					return a.source == b.source &&
							a.global == b.global &&
							a.multiline == b.multiline &&
							a.ignoreCase == b.ignoreCase;
			}
			if (typeof a != 'object' || typeof b != 'object') return false;
			// Assume equality for cyclic structures. The algorithm for detecting cyclic
			// structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
			var length = stack.length;
			while (length--) {
				// Linear search. Performance is inversely proportional to the number of
				// unique nested structures.
				if (stack[length] == a) return true;
			}
			// Add the first object to the stack of traversed objects.
			stack.push(a);
			var size = 0, result = true;
			// Recursively compare objects and arrays.
			if (className == '[object Array]') {
				// Compare array lengths to determine if a deep comparison is necessary.
				size = a.length;
				result = size == b.length;
				if (result) {
					// Deep compare the contents, ignoring non-numeric properties.
					while (size--) {
						// Ensure commutative equality for sparse arrays.
						if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
					}
				}
			} else {
				// Objects with different constructors are not equivalent.
				if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
				// Deep compare objects.
				for (var key in a) {
					if (_.has(a, key)) {
						// Count the expected number of properties.
						size++;
						// Deep compare each member.
						if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
					}
				}
				// Ensure that both objects contain the same number of properties.
				if (result) {
					for (key in b) {
						if (_.has(b, key) && !(size--)) break;
					}
					result = !size;
				}
			}
			// Remove the first object from the stack of traversed objects.
			stack.pop();
			return result;
		}

		// Perform a deep comparison to check if two objects are equal.
		_.isEqual = function(a, b) {
			return eq(a, b, []);
		};

		// Is a given array, string, or object empty?
		// An "empty" object has no enumerable own-properties.
		_.isEmpty = function(obj) {
			if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
			for (var key in obj) if (_.has(obj, key)) return false;
			return true;
		};

		// Is a given value a DOM element?
		_.isElement = function(obj) {
			return !!(obj && obj.nodeType == 1);
		};

		// Is a given value an array?
		// Delegates to ECMA5's native Array.isArray
		_.isArray = nativeIsArray || function(obj) {
			return toString.call(obj) == '[object Array]';
		};

		// Is a given variable an object?
		_.isObject = function(obj) {
			return obj === Object(obj);
		};

		// Is a given variable an arguments object?
		_.isArguments = function(obj) {
			return toString.call(obj) == '[object Arguments]';
		};
		if (!_.isArguments(arguments)) {
			_.isArguments = function(obj) {
				return !!(obj && _.has(obj, 'callee'));
			};
		}

		// Is a given value a function?
		_.isFunction = function(obj) {
			return toString.call(obj) == '[object Function]';
		};

		// Is a given value a string?
		_.isString = function(obj) {
			return toString.call(obj) == '[object String]';
		};

		// Is a given value a number?
		_.isNumber = function(obj) {
			return toString.call(obj) == '[object Number]';
		};

		// Is the given value `NaN`?
		_.isNaN = function(obj) {
			// `NaN` is the only value for which `===` is not reflexive.
			return obj !== obj;
		};

		// Is a given value a boolean?
		_.isBoolean = function(obj) {
			return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
		};

		// Is a given value a date?
		_.isDate = function(obj) {
			return toString.call(obj) == '[object Date]';
		};

		// Is the given value a regular expression?
		_.isRegExp = function(obj) {
			return toString.call(obj) == '[object RegExp]';
		};

		// Is a given value equal to null?
		_.isNull = function(obj) {
			return obj === null;
		};

		// Is a given variable undefined?
		_.isUndefined = function(obj) {
			return obj === void 0;
		};

		// Has own property?
		_.has = function(obj, key) {
			return hasOwnProperty.call(obj, key);
		};

		// Utility Functions
		// -----------------

		// Run Underscore.js in *noConflict* mode, returning the `_` variable to its
		// previous owner. Returns a reference to the Underscore object.
		_.noConflict = function() {
			root._ = previousUnderscore;
			return this;
		};

		// Keep the identity function around for default iterators.
		_.identity = function(value) {
			return value;
		};

		// Run a function **n** times.
		_.times = function (n, iterator, context) {
			for (var i = 0; i < n; i++) iterator.call(context, i);
		};

		// Escape a string for HTML interpolation.
		_.escape = function(string) {
			return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
		};

		// Add your own custom functions to the Underscore object, ensuring that
		// they're correctly added to the OOP wrapper as well.
		_.mixin = function(obj) {
			each(_.functions(obj), function(name){
				addToWrapper(name, _[name] = obj[name]);
			});
		};

		// Generate a unique integer id (unique within the entire client session).
		// Useful for temporary DOM ids.
		var idCounter = 0;
		_.uniqueId = function(prefix) {
			var id = idCounter++;
			return prefix ? prefix + id : id;
		};

//		// By default, Underscore uses ERB-style template delimiters, change the
//		// following template settings to use alternative delimiters.
//		_.templateSettings = {
//			evaluate    : /<%([\s\S]+?)%>/g,
//			interpolate : /<%=([\s\S]+?)%>/g,
//			escape      : /<%-([\s\S]+?)%>/g
//		};
//
//		// When customizing `templateSettings`, if you don't want to define an
//		// interpolation, evaluation or escaping regex, we need one that is
//		// guaranteed not to match.
//		var noMatch = /.^/;
//
//		// Within an interpolation, evaluation, or escaping, remove HTML escaping
//		// that had been previously added.
//		var unescape = function(code) {
//			return code.replace(/\\\\/g, '\\').replace(/\\'/g, "'");
//		};
//
//		// JavaScript micro-templating, similar to John Resig's implementation.
//		// Underscore templating handles arbitrary delimiters, preserves whitespace,
//		// and correctly escapes quotes within interpolated code.
//		_.template = function(str, data) {
//			var c  = _.templateSettings;
//			var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
//					'with(obj||{}){__p.push(\'' +
//					str.replace(/\\/g, '\\\\')
//							.replace(/'/g, "\\'")
//							.replace(c.escape || noMatch, function(match, code) {
//								return "',_.escape(" + unescape(code) + "),'";
//							})
//							.replace(c.interpolate || noMatch, function(match, code) {
//								return "'," + unescape(code) + ",'";
//							})
//							.replace(c.evaluate || noMatch, function(match, code) {
//								return "');" + unescape(code).replace(/[\r\n\t]/g, ' ') + ";__p.push('";
//							})
//							.replace(/\r/g, '\\r')
//							.replace(/\n/g, '\\n')
//							.replace(/\t/g, '\\t')
//					+ "');}return __p.join('');";
//			var func = new Function('obj', '_', tmpl);
//			if (data) return func(data, _);
//			return function(data) {
//				return func.call(this, data, _);
//			};
//		};

		// Add a "chain" function, which will delegate to the wrapper.
		_.chain = function(obj) {
			return _(obj).chain();
		};

		// The OOP Wrapper
		// ---------------

		// If Underscore is called as a function, it returns a wrapped object that
		// can be used OO-style. This wrapper holds altered versions of all the
		// underscore functions. Wrapped objects may be chained.
		var wrapper = function(obj) { this._wrapped = obj; };

		// Expose `wrapper.prototype` as `_.prototype`
		_.prototype = wrapper.prototype;

		// Helper function to continue chaining intermediate results.
		var result = function(obj, chain) {
			return chain ? _(obj).chain() : obj;
		};

		// A method to easily add functions to the OOP wrapper.
		var addToWrapper = function(name, func) {
			wrapper.prototype[name] = function() {
				var args = slice.call(arguments);
				unshift.call(args, this._wrapped);
				return result(func.apply(_, args), this._chain);
			};
		};

		// Add all of the Underscore functions to the wrapper object.
		_.mixin(_);

		// Add all mutator Array functions to the wrapper.
		each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
			var method = ArrayProto[name];
			wrapper.prototype[name] = function() {
				var wrapped = this._wrapped;
				method.apply(wrapped, arguments);
				var length = wrapped.length;
				if ((name == 'shift' || name == 'splice') && length === 0) delete wrapped[0];
				return result(wrapped, this._chain);
			};
		});

		// Add all accessor Array functions to the wrapper.
		each(['concat', 'join', 'slice'], function(name) {
			var method = ArrayProto[name];
			wrapper.prototype[name] = function() {
				return result(method.apply(this._wrapped, arguments), this._chain);
			};
		});

		// Start chaining a wrapped Underscore object.
		wrapper.prototype.chain = function() {
			this._chain = true;
			return this;
		};

		// Extracts the result from a wrapped and chained object.
		wrapper.prototype.value = function() {
			return this._wrapped;
		};

		return _.noConflict()
	}
)
;
define(
	'spell/shared/util/deepClone',
	[
		'underscore'
	],
	function(
		_
	) {
		'use strict'


		return function deepClone( o ) {
			if (
				_.isBoolean( o )   ||
				_.isFunction( o )  ||
				_.isNaN( o )       ||
				_.isNull( o )      ||
				_.isNumber( o )    ||
				_.isString( o )    ||
				_.isUndefined( o )
			) {
				return o

			} else {
				var clone = _.isArray( o ) ? [] : {}

				_.each( o, function( value, key ) {
					clone[ key ] = deepClone( value )
				} )

				return clone
			}
		}
	}
)
;
define(
	'spell/shared/util/blueprints/createLocalComponentName',
	[
		'underscore'
	],
	function(
		_
	) {
		'use strict'


		return function( componentBlueprintId, importName ) {
			if( importName ) return importName

			return _.last( componentBlueprintId.split( '/' ) )
		}
	}
)
;
define(
	'spell/shared/util/blueprints/BlueprintManager',
	[
		'spell/shared/util/deepClone',
		'spell/shared/util/blueprints/createLocalComponentName',

		'jsonPath',
		'underscore'
	],
	function(
		deepClone,
		createLocalComponentName,

		jsonPath,
		_
	) {
		'use strict'


		/**
		 * private
		 */

		var blueprintTypes = {
			BLUEPRINT_TYPE_ENTITY    : 'entityBlueprint',
			BLUEPRINT_TYPE_COMPONENT : 'componentBlueprint',
			BLUEPRINT_TYPE_SYSTEM    : 'systemBlueprint'
		}

		var blueprints = {},
			entityTemplates = {}

		var isValidComponentBlueprint = function( blueprint ) {
			// check for ambiguous attribute names
			var attributeNameCounts = _.reduce(
				blueprint.attributes,
				function( memo, attributeConfig ) {
					var attributeName = attributeConfig.name

					memo[ attributeName ] = ( _.has( memo, attributeName ) ?
						memo[ attributeName ] += 1 :
						1
					)

					return memo
				},
				{}
			)

			return !_.any(
				attributeNameCounts,
				function( iter ) { return iter > 1 }
			)
		}

		var isValidEntityBlueprint = function( blueprint ) {
			// check for ambiguous local component names
			var componentNameCounts = _.reduce(
				blueprint.components,
				function( memo, componentConfig ) {
					var localComponentName = createLocalComponentName( componentConfig.id, componentConfig.importName )

					memo[ localComponentName ] = ( _.has( memo, localComponentName ) ?
						memo[ localComponentName ] += 1 :
						1
					)

					return memo
				},
				{}
			)

			return !_.any(
				componentNameCounts,
				function( iter ) { return iter > 1 }
			)
		}

		var isValidDefinition = function( blueprint ) {
			var bluePrintType = blueprint.type

			if( !_.include( blueprintTypes, bluePrintType ) ) return false


			if( bluePrintType === blueprintTypes.BLUEPRINT_TYPE_COMPONENT ) {
				return isValidComponentBlueprint( blueprint )
			}

			if( bluePrintType === blueprintTypes.BLUEPRINT_TYPE_ENTITY ) {
				return isValidEntityBlueprint( blueprint )
			}

			return true
		}

		var throwCouldNotFindBlueprint = function( blueprintId, blueprintType ) {
			throw 'Error: Could not find a blueprint with id \'' + blueprintId + ( blueprintType ? '\' of type ' + blueprintType : '' ) + '.'
		}

		var createComponentTemplate = function( componentBlueprint ) {
			if( _.size( componentBlueprint.attributes ) === 1 ) {
				return _.clone( componentBlueprint.attributes[ 0 ][ 'default' ] )
			}

			return _.reduce(
				componentBlueprint.attributes,
				function( memo, attributeConfig ) {
					memo[ attributeConfig.name ] = _.clone( attributeConfig[ 'default' ] )

					return memo
				},
				{}
			)
		}

		var updateComponent = function( component, attributeConfig, isSingleAttributeComponent ) {
			if( isSingleAttributeComponent ) {
				for( var property in attributeConfig ) {
					return _.clone( attributeConfig[ property ] )
				}
			}

			return _.extend( component, attributeConfig )
		}

		var createEntityTemplate = function( entityBlueprint ) {
			return _.reduce(
				entityBlueprint.components,
				function( memo, componentConfig ) {
					var componentBlueprintId = componentConfig.id,
						componentBlueprint = getBlueprint( componentBlueprintId, blueprintTypes.BLUEPRINT_TYPE_COMPONENT )

					if( !componentBlueprint ) throwCouldNotFindBlueprint( componentBlueprintId, blueprintTypes.BLUEPRINT_TYPE_COMPONENT )


					var localComponentName = createLocalComponentName( componentBlueprintId, componentConfig.importName )

					memo[ localComponentName ] = updateComponent(
						createComponentTemplate( componentBlueprint ),
						componentConfig.config,
						isSingleAttributeComponent( componentBlueprint.attributes )
					)

					return memo
				},
				{}
			)
		}

		var updateEntity = function( entity, entityConfig ) {
			return _.reduce(
				entityConfig,
				function( memo, componentConfig, componentName ) {
					updateComponent(
						memo[ componentName ],
						componentConfig,
						isSingleAttributeComponent( memo[ componentName ] )
					)

					return memo
				},
				entity
			)
		}

		var addBlueprint = function( definition ) {
			var blueprintId = definition.namespace + '/' + definition.name

			if( _.has( blueprints, blueprintId ) ) throw 'Error: Blueprint definition \'' + blueprintId + '\' already exists.'


			blueprints[ blueprintId ] = definition

			if( definition.type === blueprintTypes.BLUEPRINT_TYPE_ENTITY ) {
				entityTemplates[ blueprintId ] = createEntityTemplate( definition )
			}
		}

		var getBlueprint = function( blueprintId, blueprintType ) {
			var blueprint = blueprints[ blueprintId ]

			return ( !blueprint ?
				false :
				( !blueprintType ?
					blueprint :
					( blueprint.type !== blueprintType ?
						false :
						blueprint
					)
				)
			)
		}

		var isSingleAttributeComponent = function( attributes ) {
			if( !attributes ) throw 'Error: \'attributes\' is of type falsy.'

			return _.size( attributes ) === 1
		}


		/**
		 * public
		 */

		function BlueprintManager() {
		}

		BlueprintManager.prototype = {
			add : function( definition ) {
				if( !definition.type ||
					!isValidDefinition( definition ) ) {

					throw 'Error: The format of the supplied blueprint definition is invalid.'
				}

				addBlueprint( definition )
			},
			createEntity : function( blueprintId, entityConfig ) {
				return updateEntity(
					deepClone( entityTemplates[ blueprintId ] ),
					entityConfig
				)
			},
			hasBlueprint : function( blueprintId ) {
				return !!getBlueprint( blueprintId )
			},
			getBlueprint : function( blueprintId ) {
				return getBlueprint( blueprintId )
			},

			/**
			 * Returns all dependent component blueprint ids
			 *
			 * @param blueprintId - entity blueprint id
			 */
			getDependencyComponentBlueprintIds : function( blueprintId ) {
				return jsonPath( getBlueprint( blueprintId ), '$.components[*].id' )
			},

			/**
			 * Returns true if the component is a single attribute component, false otherwise.
			 *
			 * @param blueprintId - component blueprint id
			 * @return {*}
			 */
			isSingleAttributeComponent : function( blueprintId ) {
				return isSingleAttributeComponent( getBlueprint( blueprintId, blueprintTypes.BLUEPRINT_TYPE_COMPONENT ).attributes )
			}
		}

		return BlueprintManager
	}
)
;
define(
	"spell/shared/util/forestMultiMap",
	[
		"underscore"
	],
	function(
		_
	) {
		"use strict"


		function createNode() {
			return {
				subNodes: {},
				elements: []
			}
		}

		function getElements( node ) {
			if( !node ) {
				return []

			} else {
				return _.reduce(
					node.subNodes,
					function( elements, subNode ) {
						return elements.concat( getElements( subNode ) )
					},
					node.elements
				)
			}
		}

		function getNode( node, key, eachNode ) {
			return _.reduce(
				key,
				function( node, keyComponent ) {
					if( node === undefined ) return undefined

					if( eachNode !== undefined ) eachNode( node, keyComponent )

					return node.subNodes[ keyComponent ]
				},
				node
			)
		}


		return {
			create: function() {
				return createNode()
			},

			add: function(
				data,
				key,
				element
			) {
				var node = getNode(
					data,
					key,
					function( node, keyComponent ) {
						if ( !node.subNodes.hasOwnProperty( keyComponent ) ) {
							node.subNodes[ keyComponent ] = createNode()
						}
					}
				)

				node.elements.push( element )
			},

			remove: function(
				data,
				key,
				elementToRemove
			) {
				var node = getNode( data, key )

				node.elements = _.filter( node.elements, function( element ) {
					return element !== elementToRemove
				} )
			},

			get: function(
				data,
				key
			) {
				return getElements( getNode( data, key ) )
			}
		}
	}
)
;
define(
	"spell/shared/util/StatisticsManager",
	[
		"underscore"
	],
	function(
		_
	) {
		"use strict"


		/**
		 * private
		 */

		var numberOfValues = 512

		var createBuffer = function( bufferSize ) {
			var buffer = []

			while( bufferSize > 0 ) {
				buffer.push( 0 )
				bufferSize--
			}

			return buffer
		}

		var createSeries = function( id, name, unit ) {
			return {
				values : createBuffer( numberOfValues ),
				name   : name,
				unit   : unit
			}
		}


		/**
		 * public
		 */

		var StatisticsManager = function() {
			this.series = {}
		}

		StatisticsManager.prototype = {
			init : function() {
				this.addSeries( 'fps', 'frames per second', 'fps' )
				this.addSeries( 'totalTimeSpent', 'total time spent', 'ms' )
				this.addSeries( 'timeSpentRendering', 'time spent rendering', 'ms' )
			},
			/**
			 * call this method to signal the beginning of a new measurement period
			 */
			startTick: function() {
				_.each(
					this.series,
					function( iter ) {
						iter.values.push( 0 )
						iter.values.shift()
					}
				)
			},
			addSeries : function( id, name, unit ) {
				if( !id ) return

				if( _.has( this.series, id ) ) throw 'Series with id "' + id + '" already exists'

				this.series[ id ] = createSeries( id, name, unit )
			},
			updateSeries : function( id, value ) {
				if( !id ) return

				var series = this.series[ id ]

				if( !series ) return

				series.values[ numberOfValues - 1 ] += value
			},
			getValues : function() {
				return this.series
			},
			getSeriesValues : function( id ) {
				return this.series[ id ]
			}
		}

		return StatisticsManager
	}
)
;
define(
	'spell/shared/util/createEnumesqueObject',
	[
		'underscore'
	],
	function(
		_
	) {
		'use strict'


		/**
		 * Creates an object with the properties defined by the array "keys". Each property has a unique Number.
		 */
		return function( keys ) {
			return _.reduce(
				keys,
				function( memo, key ) {
					memo.result[ key ] = memo.index++

					return memo
				},
				{
					index  : 0,
					result : {}
				}
			).result
		}
	}
)
;
define(
	'spell/shared/util/Events',
	[
		'spell/shared/util/createEnumesqueObject'
	],
	function(
		createEnumesqueObject
	) {
		'use strict'


		return createEnumesqueObject( [
			// CONNECTION
			'SERVER_CONNECTION_ESTABLISHED',
			'MESSAGE_RECEIVED',

			// clock synchronization
			'CLOCK_SYNC_ESTABLISHED',

			// EventManager
			'SUBSCRIBE',
			'UNSUBSCRIBE',

			// ResourceLoader
			'RESOURCE_PROGRESS',
			'RESOURCE_LOADING_COMPLETED',
			'RESOURCE_ERROR',

			// MISC
			'RENDER_UPDATE',
			'LOGIC_UPDATE',
			'CREATE_ZONE',
			'DESTROY_ZONE',
			'SCREEN_RESIZED'
		] )
	}
)
;
define(
	"spell/shared/util/zones/ZoneManager",
	[
		"spell/shared/util/Events"
	],
	function(
		Events
	) {
		"use strict"


		/**
		 * private
		 */

		var zoneId = 0


		/**
		 * public
		 */

		var ZoneManager = function( eventManager, zoneTemplates, globals ) {
			this.eventManager   = eventManager
			this.zoneTemplates  = zoneTemplates
			this.globals        = globals
			this.theActiveZones = []
		}


		ZoneManager.IS_NO_ACTIVE_ZONE_ERROR            = "The zone you tried to destroy in not an active zone: "
		ZoneManager.ZONE_TEMPLATE_DOES_NOT_EXIST_ERROR = "You tried to create an instance of a zone type that doesn't exist: "


		ZoneManager.prototype = {
			createZone: function( templateId, args ) {
				var zoneTemplate = this.zoneTemplates[ templateId ]

				if ( zoneTemplate === undefined ) {
					throw ZoneManager.ZONE_TEMPLATE_DOES_NOT_EXIST_ERROR + templateId
				}

				var zone = {
					id         : zoneId++,
					templateId : templateId
				}

				zoneTemplate.onCreate.apply( zone, [ this.globals, args ] )
				this.theActiveZones.push( zone )

				this.eventManager.publish( Events.CREATE_ZONE, [ this, zone ] )

				return zone
			},

			destroyZone: function( zone, args ) {
				var wasRemoved = false
				this.theActiveZones = this.theActiveZones.filter( function( activeZone ) {
					if ( activeZone === zone ) {
						wasRemoved = true
						return false
					}

					return true
				} )

				if ( wasRemoved ) {
					this.zoneTemplates[ zone.templateId ].onDestroy.apply( zone, [ this.globals, args ] )

					this.eventManager.publish( Events.DESTROY_ZONE, [ this, zone ] )
				}
				else {
					throw ZoneManager.IS_NO_ACTIVE_ZONE_ERROR + zone
				}
			},

			activeZones: function() {
				return this.theActiveZones
			}
		}


		return ZoneManager
	}
)
;
define(
	'spell/shared/util/EventManager',
	[
		'spell/shared/util/forestMultiMap',
		'spell/shared/util/Events',

		'underscore'
	],
	function(
		forestMultiMap,
		Events,

		_
	) {
		'use strict'


		/**
		 * private
		 */

		var normalize = function( scope ) {
			return ( _.isArray( scope ) ? scope : [ scope ] )
		}

		var waitForChainConfig = false

		var registerWaitForChain = function( eventManager, config ) {
			var callback = config.callback

			// the lock is released after the n-th call ( n := config.events.length )
			var lock = _.after(
				config.events.length,
				function() {
					callback()
				}
			)

			// wire up all events to probe the lock
			_.each(
				config.events,
				function( scope ) {
					eventManager.subscribe( scope, lock )
				}
			)
		}


		/**
		 * public
		 */

		function EventManager() {
			this.subscribers = forestMultiMap.create()
		}

		EventManager.prototype = {
			subscribe: function(
				scope,
				subscriber
			) {
				scope = normalize( scope )

				forestMultiMap.add(
					this.subscribers,
					scope,
					subscriber
				)

				this.publish( Events.SUBSCRIBE, [ scope, subscriber ] )
			},

			unsubscribe: function(
				scope,
				subscriber
			) {
				scope = normalize( scope )

				forestMultiMap.remove(
					this.subscribers,
					scope,
					subscriber
				)

				this.publish( Events.UNSUBSCRIBE, [ scope, subscriber ] )
			},

			publish: function(
				scope,
				eventArgs
			) {
				scope = normalize( scope )

				var subscribersInScope = forestMultiMap.get(
					this.subscribers,
					scope
				)

				_.each( subscribersInScope, function( subscriber ) {
					subscriber.apply( undefined, eventArgs )
				} )

				return true
			},

			waitFor: function( scope ) {
				waitForChainConfig = {
					events : [ scope ]
				}

				return this
			},

			and: function( scope ) {
				// check if pending chain call exists
				if( !waitForChainConfig ) throw 'A call to the method "and" must be chained to a previous call to "waitFor".'


				waitForChainConfig.events.push( scope )

				return this
			},

			resume: function( callback ) {
				// check if pending chain call exists, return otherwise
				if( !waitForChainConfig ) throw 'A call to the method "resume" must be chained to a previous call to "waitFor" or "and".'


				waitForChainConfig.callback = callback

				registerWaitForChain( this, waitForChainConfig )

				waitForChainConfig = false
			}
		}

		return EventManager
	}
)
;
define(
	'spell/shared/util/platform/private/graphics/StateStack',
	[
		'spell/shared/util/platform/private/createNativeFloatArray',

		'glmatrix/mat4',
		'underscore'
	],
	function(
		createNativeFloatArray,

		mat4,
		_
	) {
		'use strict'


		/**
		 * private
		 */

		var createState = function( opacity, fillStyleColor, matrix ) {
			return {
				opacity : opacity,
				color   : fillStyleColor,
				matrix  : matrix
			}
		}

		var createDefaultState = function() {
			var opacity        = 1.0,
				fillStyleColor = createNativeFloatArray( 4 ),
				matrix         = mat4.create()

			fillStyleColor[ 0 ] = 1.0
			fillStyleColor[ 1 ] = 1.0
			fillStyleColor[ 2 ] = 1.0
			fillStyleColor[ 3 ] = 1.0

			mat4.identity( matrix )

			return createState( opacity, fillStyleColor, matrix )
		}

		var copyState = function( source, target ) {
			target.opacity = source.opacity

			target.color[ 0 ] = source.color[ 0 ]
			target.color[ 1 ] = source.color[ 1 ]
			target.color[ 2 ] = source.color[ 2 ]
			target.color[ 3 ] = source.color[ 3 ]

			mat4.set( source.matrix, target.matrix )
		}


		/**
		 * public
		 */

		var StateStack = function( depth ) {
			this.depth = depth
			this.stack = _.range( depth )
			this.index = 0

			// initializing stack
			for( var i = 0, stack = this.stack; i < depth; i++ ) {
				stack[ i ] = createDefaultState()
			}
		}

		StateStack.prototype = {
			pushState : function() {
				var index = this.index,
					stack = this.stack

				if( index === this.depth -1 ) throw 'Can not push state. Maximum state stack depth of ' + this.depth + ' was reached.'


				copyState( stack[ index ], stack[ ++this.index ] )
			},
			popState : function() {
				var index = this.index

				if( index > 0 ) {
					this.index--

				} else {
					throw 'Can not pop state. The state stack is already depleted.'
				}
			},
			getTop : function() {
				return this.stack[ this.index ]
			}
		}

		return StateStack
	}
)
;
define(
	"spell/shared/util/color",
	[
		"spell/shared/util/math",

		"glmatrix/vec3",
		"underscore"
	],
	function(
		MathHelper,

		vec3,
		_
	) {
		"use strict"


		var toRange = function( value ) {
			return Math.round( MathHelper.clamp( value, 0, 1 ) * 255 )
		}


		var createRgb = function( r, g, b ) {
			return [ r, g, b ]
		}


		var createRgba = function( vec ) {
			return ( vec.length === 4 ?
				[ vec[ 0 ], vec[ 1 ], vec[ 2 ], vec[ 3 ] ] :
				[ vec[ 0 ], vec[ 1 ], vec[ 2 ], 1.0 ] )
		}


		var createRandom = function() {
			var primaryColorIndex = Math.round( Math.random() * 3 )
			var colorVec = vec3.create( [ 0.8, 0.8, 0.8 ] )

			for( var i = 0; i < colorVec.length; i++ ) {
				if ( i === primaryColorIndex ) {
					colorVec[ i ] = 0.95

				} else {
					colorVec[ i ] *= Math.random()
				}
			}

			return colorVec
		}


		var formatCanvas = function( vec ) {
			if( vec[ 3 ] === undefined ) {
				return 'rgb('
					+ toRange( vec[ 0 ] ) + ', '
					+ toRange( vec[ 1 ] ) + ', '
					+ toRange( vec[ 2 ] ) + ')'
			}

			return 'rgba('
				+ toRange( vec[ 0 ] ) + ', '
				+ toRange( vec[ 1 ] ) + ', '
				+ toRange( vec[ 2 ] ) + ', '
				+ toRange( vec[ 3 ] ) + ')'
		}


		var isVec3Color = function( vec ) {
			return _.size( vec ) === 3
		}


		var isVec4Color = function( vec ) {
			return _.size( vec ) === 4
		}


		return {
			createRgb    : createRgb,
			createRgba   : createRgba,
			createRandom : createRandom,
			formatCanvas : formatCanvas,
			isVec3Color  : isVec3Color,
			isVec4Color  : isVec4Color
		}
	}
)
;
define(
	'spell/shared/util/platform/private/graphics/canvas/createCanvasContext',
	[
		'spell/shared/util/platform/private/graphics/StateStack',
		'spell/shared/util/color',

		'glmatrix/mat4'
	],
	function(
		StateStack,
		color,

		mat4
	) {
		'use strict'


		/**
		 * private
		 */

		var context
		var clearColor   = color.formatCanvas( [ 0.0, 0.0, 0.0, 1.0 ] )
		var stateStack   = new StateStack( 32 )
		var currentState = stateStack.getTop()

		// world space to view space transformation matrix
		var worldToView = mat4.create()
		mat4.identity( worldToView )

		// view space to screen space transformation matrix
		var viewToScreen = mat4.create()
		mat4.identity( viewToScreen )

		// accumulated transformation world space to screen space transformation matrix
		var worldToScreen = mat4.create()
		mat4.identity( worldToScreen )


		/**
		 * Returns true if the supplied quad covers the full screen, false otherwise.
		 *
		 * @param x
		 * @param y
		 * @param width
		 * @param height
		 */
		var isFullscreenCovered = function( x, y, width, height ) {
			var leftBorder   = x,
				rightBorder  = x + width,
				topBorder    = y + height,
				bottomBorder = y

			return ( leftBorder <= 0 &&
				rightBorder >= context.canvas.width &&
				topBorder >= context.canvas.height &&
				bottomBorder <= 0 )
		}

		var setClippingRegion = function( x, y, width, height ) {
			context.beginPath()
			context.rect( x, y, width, height )
			context.closePath()
			context.clip()
		}

		var updateWorldToScreen = function( viewToScreen, worldToView ) {
			mat4.multiply( viewToScreen, worldToView, worldToScreen )

			context.setTransform(
				worldToScreen[ 0 ],
				worldToScreen[ 1 ],
				worldToScreen[ 4 ],
				worldToScreen[ 5 ],
				worldToScreen[ 12 ],
				worldToScreen[ 13 ]
			)
		}

		var initWrapperContext = function() {
			viewport( 0, 0, context.canvas.width, context.canvas.height )

			// world space to view space matrix
			var cameraWidth  = context.canvas.width,
				cameraHeight = context.canvas.height

			mat4.ortho(
				-cameraWidth / 2,
				cameraWidth / 2,
				-cameraHeight / 2,
				cameraHeight / 2,
				0,
				1000,
				worldToView
			)

			mat4.translate( worldToView, [ -cameraWidth / 2, -cameraHeight / 2, 0 ] ) // WATCH OUT: apply inverse translation for camera position

			updateWorldToScreen( viewToScreen, worldToView )
		}

		/**
		 * Creates a wrapper context from the backend context.
		 */
		var createWrapperContext = function() {
			initWrapperContext()

			return {
				clear             : clear,
				createTexture     : createCanvasTexture,
				drawTexture       : drawTexture,
				drawSubTexture    : drawSubTexture,
				fillRect          : fillRect,
				getConfiguration  : getConfiguration,
				resizeColorBuffer : resizeColorBuffer,
				restore           : restore,
				rotate            : rotate,
				save              : save,
				scale             : scale,
				setClearColor     : setClearColor,
				setFillStyleColor : setFillStyleColor,
				setGlobalAlpha    : setGlobalAlpha,
				setTransform      : setTransform,
				setViewMatrix     : setViewMatrix,
				transform         : transform,
				translate         : translate,
				viewport          : viewport
			}
		}

		/**
		 * Returns a rendering context. Once a context has been created additional calls to this method return the same context instance.
		 *
		 * @param canvas - the canvas dom element
		 */
		var createCanvasContext = function( canvas ) {
			if( canvas === undefined ) throw 'Missing first argument.'

			if( context !== undefined ) return context


			context = canvas.getContext( '2d' )

			if( context === null ) return null


			return createWrapperContext()
		}


		/**
		 * public
		 */

		var setFillStyleColor = function( vec ) {
			currentState.color = color.createRgba( vec )
		}

		var setGlobalAlpha = function( u ) {
			currentState.opacity = u
		}

		var setClearColor = function( vec ) {
			clearColor = color.formatCanvas( vec )
		}

		var save = function() {
			stateStack.pushState()
			currentState = stateStack.getTop()
		}

		var restore = function() {
			stateStack.popState()
			currentState = stateStack.getTop()
		}

		var scale = function( vec ) {
			mat4.scale( currentState.matrix, vec )
		}

		var translate = function( vec ) {
			mat4.translate( currentState.matrix, vec )
		}

		var rotate = function( u ) {
			mat4.rotateZ( currentState.matrix, -u )
		}

		/**
		 * Clears the color buffer with the clear color
		 */
		var clear = function() {
			context.save()
			{
				// reset transformation to identity
				context.setTransform( 1, 0, 0, 1, 0, 0 )

				context.fillStyle = clearColor
				context.fillRect( 0, 0, context.canvas.width, context.canvas.height )
			}
			context.restore()
		}

		var drawTexture = function( texture, dx, dy, dw, dh ) {
			if( texture === undefined ) throw 'Texture is undefined'

			if( !dw ) dw = 1.0
			if( !dh ) dh = 1.0

			context.save()
			{
				context.globalAlpha = currentState.opacity

				var modelToWorld = currentState.matrix

				context.transform(
					modelToWorld[ 0 ],
					modelToWorld[ 1 ],
					modelToWorld[ 4 ],
					modelToWorld[ 5 ],
					modelToWorld[ 12 ],
					modelToWorld[ 13 ]
				)

				// rotating the image so that it is not upside down
				context.translate( dx, dy )
				context.rotate( Math.PI )
				context.scale( -1, 1 )
				context.translate( 0, -dh )

				context.drawImage( texture.privateImageResource, 0 , 0, dw, dh )
			}
			context.restore()
		}

		var drawSubTexture = function( texture, sx, sy, sw, sh, dx, dy, dw, dh ) {
			if( texture === undefined ) throw 'Texture is undefined'

			context.save()
			{
				context.globalAlpha = currentState.opacity

				var modelToWorld = currentState.matrix

				context.transform(
					modelToWorld[ 0 ],
					modelToWorld[ 1 ],
					modelToWorld[ 4 ],
					modelToWorld[ 5 ],
					modelToWorld[ 12 ],
					modelToWorld[ 13 ]
				)

				// rotating the image so that it is not upside down
				context.translate( dx, dy )
				context.rotate( Math.PI )
				context.scale( -1, 1 )
				context.translate( 0, -dh )

				context.drawImage( texture.privateImageResource, sx, sy, sw, sh, 0 , 0, dw, dh )
			}
			context.restore()
		}

		var fillRect = function( dx, dy, dw, dh ) {
			context.save()
			{
				context.fillStyle   = color.formatCanvas( currentState.color )
				context.globalAlpha = currentState.opacity

				var modelToWorld = currentState.matrix

				context.transform(
					modelToWorld[ 0 ],
					modelToWorld[ 1 ],
					modelToWorld[ 4 ],
					modelToWorld[ 5 ],
					modelToWorld[ 12 ],
					modelToWorld[ 13 ]
				)

				// rotating the image so that it is not upside down
				context.translate( dx, dy )
				context.rotate( Math.PI )
				context.scale( -1, 1 )
				context.translate( 0, -dh )

				context.fillRect( 0, 0, dw, dh )
			}
			context.restore()
		}

		var resizeColorBuffer = function( width, height ) {
			context.canvas.width  = width
			context.canvas.height = height
		}

		var transform = function( matrix ) {
			mat4.multiply( currentState.matrix, matrix )
		}

		var setTransform = function( matrix ) {
			mat4.set( matrix, currentState.matrix )
		}

		var setViewMatrix = function( matrix ) {
			mat4.set( matrix, worldToView )

			updateWorldToScreen( viewToScreen, worldToView )
		}

		var viewport = function( x, y, width, height ) {
			mat4.identity( viewToScreen )

			viewToScreen[ 0 ] = width * 0.5
			viewToScreen[ 5 ] = height * 0.5 * -1 // mirroring y-axis
			viewToScreen[ 12 ] = x + width * 0.5
			viewToScreen[ 13 ] = y + height * 0.5

			updateWorldToScreen( viewToScreen, worldToView )

			if( !isFullscreenCovered( x, y, width, height ) ) {
				setClippingRegion( x, y, width, height )
			}
		}

		/**
		 * Returns an object describing the current configuration of the rendering backend.
		 */
		var getConfiguration = function() {
			return {
				type   : 'canvas-2d',
				width  : context.canvas.width,
				height : context.canvas.height
			}
		}

		/**
		 * Returns instance of texture class
		 *
		 * The public interface of the texture class consists of the two attributes width and height.
		 *
		 * @param image
		 */
		var createCanvasTexture = function( image ) {
			return {
				/**
				 * Public
				 */
				width  : image.width,
				height : image.height,

				/**
				 * Private
				 *
				 * This is an implementation detail of the class. If you write code that depends on this you better know what you are doing.
				 */
				privateImageResource : image
			}
		}

		return createCanvasContext
	}
)
;
define(
	"spell/shared/util/platform/private/graphics/webgl/createContext",
	[
		"underscore"
	],
	function(
		_
	) {
		"use strict"


		var gl

		/**
		 * Returns a rendering context. Performs some probing to account for different runtime environments.
		 *
		 * @param canvas
		 */
		var createContext = function( canvas ) {
			var gl = null
			var contextNames = [ "webgl", "experimental-webgl", "webkit-3d", "moz-webgl" ]
			var attributes = {
				alpha: false
			}

			_.find(
				contextNames,
				function( it ) {
					gl = canvas.getContext( it, attributes )

					return ( gl !== null )
				}
			)

			return gl
		}

		return createContext
	}
)
;
define(
	'spell/shared/util/platform/private/graphics/webgl/createWebGlContext',
	[
		'spell/shared/util/platform/private/graphics/StateStack',
		'spell/shared/util/platform/private/graphics/webgl/createContext',
		'spell/shared/util/platform/private/graphics/webgl/shaders',

		'spell/shared/util/color',
		'spell/shared/util/math',
		'spell/shared/util/platform/private/createNativeFloatArray',

		'glmatrix/vec3',
		'glmatrix/mat3',
		'glmatrix/mat4'
	],
	function(
		StateStack,
		createContext,
		shaders,

		color,
		math,
		createNativeFloatArray,

		vec3,
		mat3,
		mat4
	) {
		'use strict'


		/**
		 * private
		 */

		var gl
		var stateStack   = new StateStack( 32 )
		var currentState = stateStack.getTop()

		var screenSpaceShimMatrix = mat4.create()
		var shaderProgram

		// view space to screen space transformation matrix
		var viewToScreen = mat4.create()
		mat4.identity( viewToScreen )

		// world space to view space transformation matrix
		var worldToView = mat4.create()
		mat4.identity( worldToView )

		// accumulated transformation world space to screen space transformation matrix
		var worldToScreen = mat4.create()
		mat4.identity( worldToScreen )

		var tmpMatrix     = mat4.create(),
			textureMatrix = mat3.create()


		/**
		 * Creates a projection matrix that normalizes the transformation behaviour to that of the normalized canvas-2d (that is origin is in bottom left,
		 * positive x-axis to the right, positive y-axis up, screen space coordinates as input. The matrix transforms from screen space to clip space.
		 *
		 * @param width
		 * @param height
		 * @param resultMatrix
		 */
		var createScreenSpaceShimMatrix = function( width, height, resultMatrix ) {
			mat4.identity( resultMatrix )

			mat4.ortho(
				0,
				width,
				0,
				height,
				0,
				1000,
				resultMatrix
			)
		}

		var createViewToScreenMatrix = function( width, height, resultMatrix ) {
			mat4.identity( resultMatrix )

			resultMatrix[ 0 ] = width * 0.5
			resultMatrix[ 5 ] = height * 0.5
			resultMatrix[ 12 ] = 0 + width * 0.5
			resultMatrix[ 13 ] = 0 + height * 0.5

			return resultMatrix
		}

		var initWrapperContext = function() {
			viewport( 0, 0, gl.canvas.width, gl.canvas.height )

			// gl initialization
			gl.clearColor( 0.0, 0.0, 0.0, 1.0 )
			gl.clear( gl.COLOR_BUFFER_BIT )

			// setting up blending
			gl.enable( gl.BLEND )
			gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA )

			gl.disable( gl.DEPTH_TEST )

			gl.activeTexture( gl.TEXTURE0 )

			setupShader()
		}

		/**
		 * Creates a wrapper context for the backend context.
		 */
		var createWrapperContext = function() {
			initWrapperContext()

			return {
				clear             : clear,
				createTexture     : createWebGlTexture,
				drawTexture       : drawTexture,
				drawSubTexture    : drawSubTexture,
				fillRect          : fillRect,
				getConfiguration  : getConfiguration,
				resizeColorBuffer : resizeColorBuffer,
				restore           : restore,
				rotate            : rotate,
				save              : save,
				scale             : scale,
				setClearColor     : setClearColor,
				setFillStyleColor : setFillStyleColor,
				setGlobalAlpha    : setGlobalAlpha,
				setTransform      : setTransform,
				setViewMatrix     : setViewMatrix,
				transform         : transform,
				translate         : translate,
				viewport          : viewport
			}
		}

		/**
		 * Returns a rendering context. Once a context has been created additional calls to this method return the same context instance.
		 *
		 * @param canvas - the canvas dom element
		 */
		var createWebGlContext = function( canvas ) {
			if( canvas === undefined ) throw 'Missing first argument.'

			if( gl !== undefined ) return gl


			gl = createContext( canvas )

			if( gl === null ) return null


			return createWrapperContext()
		}

		var setupShader = function() {
			shaderProgram = gl.createProgram()

			var vertexShader = gl.createShader( gl.VERTEX_SHADER )
			gl.shaderSource( vertexShader, shaders.vertex )
			gl.compileShader (vertexShader )
			gl.attachShader( shaderProgram, vertexShader )

			var fragmentShader = gl.createShader( gl.FRAGMENT_SHADER )
			gl.shaderSource( fragmentShader, shaders.fragment )
			gl.compileShader( fragmentShader )
			gl.attachShader( shaderProgram, fragmentShader )

			gl.linkProgram( shaderProgram )
			gl.useProgram( shaderProgram )


			// setting up vertices
			var vertices = createNativeFloatArray( 12 )
			vertices[ 0 ]  = 0.0
			vertices[ 1 ]  = 0.0
			vertices[ 2 ]  = 0.0
			vertices[ 3 ]  = 1.0
			vertices[ 4 ]  = 0.0
			vertices[ 5 ]  = 0.0
			vertices[ 6 ]  = 0.0
			vertices[ 7 ]  = 1.0
			vertices[ 8 ]  = 0.0
			vertices[ 9 ]  = 1.0
			vertices[ 10 ] = 1.0
			vertices[ 11 ] = 0.0


			var vertexPositionBuffer = gl.createBuffer()
			gl.bindBuffer( gl.ARRAY_BUFFER, vertexPositionBuffer )
			gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW )


			var attributeLocation = gl.getAttribLocation( shaderProgram, 'aVertexPosition' )
			gl.vertexAttribPointer( attributeLocation, 3, gl.FLOAT, false, 0, 0 )
			gl.enableVertexAttribArray( attributeLocation )


			// setting up texture coordinates
			var textureCoordinates = createNativeFloatArray( 8 )
			textureCoordinates[ 0 ] = 0.0
			textureCoordinates[ 1 ] = 0.0
			textureCoordinates[ 2 ] = 1.0
			textureCoordinates[ 3 ] = 0.0
			textureCoordinates[ 4 ] = 0.0
			textureCoordinates[ 5 ] = 1.0
			textureCoordinates[ 6 ] = 1.0
			textureCoordinates[ 7 ] = 1.0


			var textureCoordinateBuffer = gl.createBuffer()
			gl.bindBuffer( gl.ARRAY_BUFFER, textureCoordinateBuffer )
			gl.bufferData( gl.ARRAY_BUFFER, textureCoordinates, gl.STATIC_DRAW )

			attributeLocation = gl.getAttribLocation( shaderProgram, 'aTextureCoord' )
			gl.vertexAttribPointer( attributeLocation, 2, gl.FLOAT, false, 0, 0 )
			gl.enableVertexAttribArray( attributeLocation )


			// setting up screen space shim matrix
			var uniformLocation = gl.getUniformLocation( shaderProgram, 'uScreenSpaceShimMatrix' )
			gl.uniformMatrix4fv( uniformLocation, false, screenSpaceShimMatrix )


			// setting up texture matrix
			resetTextureMatrix( textureMatrix )
		}


		var isTextureMatrixIdentity = false

		var resetTextureMatrix = function( matrix ) {
			if( isTextureMatrixIdentity ) return


			matrix[ 0 ] = 1.0
			matrix[ 4 ] = 1.0
			matrix[ 6 ] = 0.0
			matrix[ 7 ] = 0.0

			gl.uniformMatrix3fv( gl.getUniformLocation( shaderProgram, 'uTextureMatrix' ), false, matrix )
		}

		var updateTextureMatrix = function( ss, st, tt, ts, matrix ) {
			isTextureMatrixIdentity = false

			matrix[ 0 ] = ss
			matrix[ 4 ] = st
			matrix[ 6 ] = tt
			matrix[ 7 ] = ts

			gl.uniformMatrix3fv( gl.getUniformLocation( shaderProgram, 'uTextureMatrix' ), false, matrix )
		}


		/**
		 * public
		 */

		var save = function() {
			stateStack.pushState()
			currentState = stateStack.getTop()
		}

		var restore = function() {
			stateStack.popState()
			currentState = stateStack.getTop()
		}

		var setFillStyleColor = function( vec ) {
			currentState.color = color.createRgba( vec )
		}

		var setGlobalAlpha = function( u ) {
			currentState.opacity = u
		}

		var setClearColor = function( vec ) {
			gl.clearColor( vec[ 0 ], vec[ 1 ], vec[ 2 ], 1.0 )
		}

		var scale = function( vec ) {
			mat4.scale( currentState.matrix, vec )
		}

		var translate = function( vec ) {
			mat4.translate( currentState.matrix, vec )
		}

		var rotate = function( u ) {
			mat4.rotateZ( currentState.matrix, -u )
		}

		/**
		 * Clears the color buffer with the clear color
		 */
		var clear = function() {
			gl.clear( gl.COLOR_BUFFER_BIT )
		}

		var drawTexture = function( texture, dx, dy, dw, dh ) {
			if( texture === undefined ) throw 'Texture is undefined'


			if( !dw ) dw = 1.0
			if( !dh ) dh = 1.0

			// setting up fillRect mode
			var uniformLocation = gl.getUniformLocation( shaderProgram, 'uFillRect' )
			gl.uniform1i( uniformLocation, 0 )

			// setting up global alpha
			gl.uniform1f( gl.getUniformLocation( shaderProgram, 'uGlobalAlpha' ), currentState.opacity )

			// setting up global color
			gl.uniform4fv( gl.getUniformLocation( shaderProgram, 'uGlobalColor' ), currentState.color )

			// setting up texture
			gl.bindTexture( gl.TEXTURE_2D, texture.privateGlTextureResource )
			uniformLocation = gl.getUniformLocation( shaderProgram, 'uTexture0' )
			gl.uniform1i( uniformLocation, 0 )

			// setting up transformation
			mat4.multiply( worldToScreen, currentState.matrix, tmpMatrix )

			// rotating the image so that it is not upside down
			mat4.translate( tmpMatrix, [ dx, dy, 0 ] )
			mat4.rotateZ( tmpMatrix, Math.PI )
			mat4.scale( tmpMatrix, [ -dw, dh, 0 ] )
			mat4.translate( tmpMatrix, [ 0, -1, 0 ] )

			gl.uniformMatrix4fv( gl.getUniformLocation( shaderProgram, 'uModelViewMatrix' ), false, tmpMatrix )

			// setting up the texture matrix
			resetTextureMatrix( textureMatrix )

			// drawing
			gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 )
		}

		var drawSubTexture = function( texture, sx, sy, sw, sh, dx, dy, dw, dh ) {
			if( texture === undefined ) throw 'Texture is undefined'


			if( !dw ) dw = 1.0
			if( !dh ) dh = 1.0

			// setting up fillRect mode
			var uniformLocation = gl.getUniformLocation( shaderProgram, 'uFillRect' )
			gl.uniform1i( uniformLocation, 0 )

			// setting up global alpha
			gl.uniform1f( gl.getUniformLocation( shaderProgram, 'uGlobalAlpha' ), currentState.opacity )

			// setting up global color
			gl.uniform4fv( gl.getUniformLocation( shaderProgram, 'uGlobalColor' ), currentState.color )

			// setting up texture
			gl.bindTexture( gl.TEXTURE_2D, texture.privateGlTextureResource )
			uniformLocation = gl.getUniformLocation( shaderProgram, 'uTexture0' )
			gl.uniform1i( uniformLocation, 0 )

			// setting up transformation
			mat4.multiply( worldToScreen, currentState.matrix, tmpMatrix )

			// rotating the image so that it is not upside down
			mat4.translate( tmpMatrix, [ dx, dy, 0 ] )
			mat4.rotateZ( tmpMatrix, Math.PI )
			mat4.scale( tmpMatrix, [ -dw, dh, 0 ] )
			mat4.translate( tmpMatrix, [ 0, -1, 0 ] )

			gl.uniformMatrix4fv( gl.getUniformLocation( shaderProgram, 'uModelViewMatrix' ), false, tmpMatrix )

			// setting up the texture matrix
			var tw = texture.width,
				th = texture.height

			updateTextureMatrix(
				sw / tw,
				sh / th,
				sx / tw,
				sy / th,
				textureMatrix
			)

			// drawing
			gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 )
		}

		var fillRect = function( dx, dy, dw, dh ) {
			// setting up fillRect mode
			var uniformLocation = gl.getUniformLocation( shaderProgram, 'uFillRect' )
			gl.uniform1i( uniformLocation, 1 )

			// setting up global alpha
			gl.uniform1f( gl.getUniformLocation( shaderProgram, 'uGlobalAlpha' ), currentState.opacity )

			// setting up global color
			gl.uniform4fv( gl.getUniformLocation( shaderProgram, 'uGlobalColor' ), currentState.color )

			// setting up transformation
			mat4.multiply( worldToScreen, currentState.matrix, tmpMatrix )

			// correcting position
			mat4.translate( tmpMatrix, [ dx, dy, 0 ] )
			mat4.scale( tmpMatrix, [ dw, dh, 0 ] )

			gl.uniformMatrix4fv( gl.getUniformLocation( shaderProgram, 'uModelViewMatrix' ), false, tmpMatrix )

			// drawing
			gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 )
		}

		var resizeColorBuffer = function( width, height ) {
			gl.canvas.width  = width
			gl.canvas.height = height

			createViewToScreenMatrix( width, height, viewToScreen )
			mat4.multiply( viewToScreen, worldToView, worldToScreen )
		}

		var transform = function( matrix ) {
			mat4.multiply( currentState.matrix, matrix )
		}

		var setTransform = function( matrix ) {
			mat4.set( matrix, currentState.matrix )
		}

		var setViewMatrix = function( matrix ) {
			mat4.set( matrix, worldToView )
			createViewToScreenMatrix( gl.canvas.width, gl.canvas.height, viewToScreen )
			mat4.multiply( viewToScreen, worldToView, worldToScreen )
		}

		var viewport = function( x, y, width, height ) {
			gl.viewport( x, y , width, height )

			// reinitialize screen space shim matrix
			createScreenSpaceShimMatrix( width, height, screenSpaceShimMatrix )

			var uniformLocation = gl.getUniformLocation( shaderProgram, 'uScreenSpaceShimMatrix' )
			gl.uniformMatrix4fv( uniformLocation, false, screenSpaceShimMatrix )
		}

		/**
		 * Returns an object describing the current configuration of the rendering backend.
		 */
		var getConfiguration = function() {
			return {
				type   : 'webgl',
				width  : gl.canvas.width,
				height : gl.canvas.height
			}
		}

		/**
		 * Returns instance of texture class
		 *
		 * The public interface of the texture class consists of the two attributes width and height.
		 *
		 * @param image
		 */
		var createWebGlTexture = function( image ) {
			var texture = gl.createTexture()
			gl.bindTexture( gl.TEXTURE_2D, texture )
			gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image )
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR )
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE )
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE )
			gl.generateMipmap( gl.TEXTURE_2D )
			gl.bindTexture( gl.TEXTURE_2D, null )


			return {
				/**
				 * Public
				 */
				width  : image.width,
				height : image.height,

				/**
				 * Private
				 *
				 * This is an implementation detail of the class. If you write code that depends on this you better know what you are doing.
				 */
				privateGlTextureResource : texture
			}
		}

		return createWebGlContext
	}
)
;
define(
	"spell/shared/util/platform/private/graphics/RenderingFactory",
	[
		"spell/shared/util/platform/private/graphics/canvas/createCanvasContext",
		"spell/shared/util/platform/private/graphics/webgl/createWebGlContext",
		"spell/shared/util/platform/private/graphics/createCanvasNode"
	],
	function(
		createCanvasContext,
		createWebGlContext,
		createCanvasNode
	) {
		"use strict"


		var BACK_END_WEBGL  = 0
		var BACK_END_CANVAS = 1

        var context = null

		/**
		 * Creates a rendering context
		 *
         * @param eventManager - Eventmanager
		 * @param width - width in pixels
		 * @param height - height in pixels
		 * @param requestedBackEnd - when supplied, overrides the automagic rendering back-end detection
		 */
		var createContext2d = function( eventManager, width, height, requestedBackEnd ) {
			var canvas = createCanvasNode( width, height )

			if( canvas === null || canvas === undefined ) throw "Could not create canvas node."


			// webgl
			if( requestedBackEnd === undefined ? true : ( requestedBackEnd === BACK_END_WEBGL ) ) {
				context = createWebGlContext( canvas )

				if( context ) return context
			}

			// canvas-2d
			if( requestedBackEnd === undefined ? true : ( requestedBackEnd === BACK_END_CANVAS ) ) {
				context = createCanvasContext( canvas )

				if( context ) return context
			}

			throw "Could not create a rendering back-end."
		}

		return {
			BACK_END_WEBGL  : BACK_END_WEBGL,
			BACK_END_CANVAS : BACK_END_CANVAS,
			createContext2d : createContext2d
		}
	}
)
;
define(
	"spell/shared/util/platform/private/configurationOptions",
	[
		"spell/shared/util/platform/private/graphics/RenderingFactory"
	],
	function(
		RenderingFactory
	) {
		"use strict"


		var extractRenderingBackEnd = function( validValues, value ) {
			if( value === 'webgl' ) {
				return RenderingFactory.BACK_END_WEBGL

			} else if( value === 'canvas-2d' ) {
				return RenderingFactory.BACK_END_CANVAS
			}

			return false
		}

		/**
		 * These are the platform specific options.
		 */
		var validOptions = {
			renderingBackEnd : {
				validValues  : [ 'webgl', 'canvas-2d' ],
				configurable : true,
				extractor    : extractRenderingBackEnd
			}
		}

		/**
		 * These options are used when they are not overridden by the environment configuration set up by the stage-0-loader.
		 */
		var defaultOptions = {
			renderingBackEnd : 'canvas-2d'
		}

		return {
			defaultOptions : defaultOptions,
			validOptions   : validOptions
		}
	}
)
;
define(
	"spell/shared/util/platform/private/loader/ImageLoader",
	[
		"spell/shared/util/Events",

		"underscore"
	],
	function(
		Events,

		_
	) {
		"use strict"


		/**
		 * private
		 */

		var onLoad = function( image ) {
			if( this.loaded === true ) return

			this.loaded = true

			var resources = {}
			resources[ this.resourceUri ] = image

			this.onCompleteCallback( resources )
		}

		var onError = function( event ) {
			this.eventManager.publish(
				[ Events.RESOURCE_ERROR, this.resourceBundleName ],
				[ this.resourceBundleName, event ]
			)
		}

		var onReadyStateChange = function( image ) {
			if( image.readyState === "complete" ) {
				image.onload( image )
			}
		}


		/**
		 * public
		 */

		var ImageLoader = function( eventManager, host, resourceBundleName, resourceUri, loadingCompletedCallback, timedOutCallback ) {
			this.eventManager       = eventManager
			this.host               = host
			this.resourceBundleName = resourceBundleName
			this.resourceUri        = resourceUri
			this.onCompleteCallback = loadingCompletedCallback
			this.loaded             = false
		}

		ImageLoader.prototype = {
			start: function() {
				var url = this.host + "/" + this.resourceUri

				var image = new Image()
				image.onload             = _.bind( onLoad, this, image )
				image.onreadystatechange = _.bind( onReadyStateChange, this, image )
				image.onerror            = _.bind( onError, this )
				image.src                = url
			}
		}

		return ImageLoader
	}
)
;
define(
	"spell/shared/util/platform/private/sound/loadSounds",
	[
		"spell/shared/util/platform/private/sound/createSound",
		"spell/shared/components/sound/soundEmitter",

		"underscore"
	],
	function (
		createSound,
		soundEmitterConstructor,

		_
		) {
		"use strict"

		var loadSounds = function ( soundManager, soundSpriteConfig, callback ) {
			var sounds            = {}
			var waitingFor        = 0
			var waitingForClones  = 0
			var maxChannels       = soundManager.checkMaxAvailableChannels()
			var availableChannels = maxChannels

			soundManager.soundSpriteConfig = soundSpriteConfig

			var generateSounds = function( ) {

				if( _.has( soundSpriteConfig.music, "index" ) === true) {
					_.each (
						_.keys( soundSpriteConfig.music.index ),
						function( soundId ) {
							sounds[ soundId ] = createSound(
								_.extend( { resource: soundSpriteConfig.music.resource }, soundSpriteConfig.music.index[ soundId ] ),
								soundManager
							)
						}
					)
				}

				if( _.has( soundSpriteConfig.fx, "index" ) === true) {
					_.each (
						_.keys( soundSpriteConfig.fx.index ),
						function( soundId ) {
							sounds[ soundId ] = createSound(
								_.extend( { resource: soundSpriteConfig.fx.resource }, soundSpriteConfig.fx.index[ soundId ] ),
								soundManager
							)
						}
					)

				}

				return sounds
			}

			var createFunctionWrapper = function( resource ) {

				var cloneloadeddataCallback = function ( ) {

					this.removeEventListener( 'canplaythrough', cloneloadeddataCallback, false)
					waitingForClones -= 1

					if ( waitingForClones === 0 ) {
						return callback( generateSounds() )
					}

				}

				var loadeddataCallback = function( html5AudioObject ) {

                    if( !soundManager.context ) {
                        this.removeEventListener( 'canplaythrough', loadeddataCallback, false)
                        soundManager.channels[ resource ] = this
                    } else {
                        soundManager.channels[ resource ] = html5AudioObject
                    }

					waitingFor -= 1

					if ( waitingFor === 0 ) {

						// After loading the ressources, clone the FX sounds into the free Channels of the soundManager
						if( _.has( soundSpriteConfig.fx, "resource" ) &&
                            !soundManager.context ) {

							var ObjectToClone = soundManager.channels[ soundSpriteConfig.fx.resource ]

							for( var i = maxChannels; i > 0; i-- ) {
								waitingForClones += 1

								var html5Audioclone = soundManager.cloneAudio( ObjectToClone )
								html5Audioclone.id = html5Audioclone.id +"_"+i

								html5Audioclone.addEventListener(
									"canplaythrough",
									cloneloadeddataCallback,
									false
								)

								soundManager.channels[ html5Audioclone.id ] = html5Audioclone
							}
						}

						if( waitingForClones === 0 ) {
							callback( generateSounds() )
						}
					}
				}

				waitingFor += 1
				maxChannels -= 1

				return soundManager.createAudio({
					id: resource,
					resource: resource,
					onloadeddata: loadeddataCallback
				})
			}

			if( _.has( soundSpriteConfig.music, "resource" ) ) {
                var html5Audio = createFunctionWrapper( soundSpriteConfig.music.resource )

                //iOS Hack
				if( availableChannels === 1 ) {

					var iosHack = function() {

						if( _.has( soundSpriteConfig.music, "resource" ) ) {
							waitingFor = 1
							html5Audio.load()
						}

						document.getElementById('game').style.display = 'block'
                        document.getElementById('viewport').removeChild( this )
					}

					document.getElementById('game').style.display = 'none'
					var soundLoad = document.createElement( 'input')
					soundLoad.type  = "submit"
					soundLoad.onclick = iosHack
					soundLoad.value = "On iPad/iPhone you have to click on this button to enable loading the sounds"
                    document.getElementById('viewport').insertBefore( soundLoad, document.getElementById('game') )

				}
			}

			if( _.has( soundSpriteConfig.fx, "resource" ) ) {
				createFunctionWrapper( soundSpriteConfig.fx.resource )
			}

		}

		return loadSounds
	}
)
;
define(
	"spell/shared/util/platform/private/loader/TextLoader",
	[
		"spell/shared/util/Events",

		"underscore"
	],
	function(
		Events,

		_
	) {
		"use strict"


		/**
		 * private
		 */

		var onLoad = function( request ) {
			if( this.loaded === true ) return

			this.loaded = true

			if( request.status !== 200 ) {
				onError.call( this, request.response )

				return
			}

			this.onCompleteCallback(
				request.response
			)
		}

		var onError = function( event ) {
			this.eventManager.publish(
				[ Events.RESOURCE_ERROR, this.resourceBundleName ],
				[ this.resourceBundleName, event ]
			)
		}

		var onReadyStateChange = function( request ) {
			/**
			 * readyState === 4 means "DONE"; see https://developer.mozilla.org/en/DOM/XMLHttpRequest
			 */
			if( request.readyState !== 4 ) return

			onLoad.call( this, request )
		}


		/**
		 * public
		 */

		var TextLoader = function( eventManager, host, resourceBundleName, resourceUri, loadingCompletedCallback, timedOutCallback ) {
			this.eventManager       = eventManager
			this.host               = host
			this.resourceBundleName = resourceBundleName
			this.resourceUri        = resourceUri
			this.onCompleteCallback = loadingCompletedCallback
			this.loaded             = false
		}

		TextLoader.prototype = {
			start: function() {
				var url = this.host + "/" + this.resourceUri

				var request = new XMLHttpRequest()
				request.onload             = _.bind( onLoad, this, request )
				request.onreadystatechange = _.bind( onReadyStateChange, this, request )
				request.onerror            = _.bind( onError, this )
				request.open( 'GET', url, true )
				request.send( null )
			}
		}

		return TextLoader
	}
)
;
define(
	"spell/shared/util/platform/private/loader/SoundLoader",
	[
		"spell/shared/util/platform/private/loader/TextLoader",
		"spell/shared/util/Events",
		"spell/shared/util/platform/private/sound/loadSounds",
		"spell/shared/util/platform/private/registerTimer",

		"underscore"
	],
	function(
		TextLoader,
		Events,
		loadSounds,
		registerTimer,

		_
	) {
		"use strict"


		/**
		 * private
		 */

		var processSoundSpriteConfig = function( soundSpriteConfig, onCompleteCallback ) {
			if( !_.has( soundSpriteConfig, "type" ) ||
				soundSpriteConfig.type !== 'spriteConfig' ||
				!_.has( soundSpriteConfig, "music" ) ||
				!_.has( soundSpriteConfig, "fx" ) ) {

				throw 'Not a valid sound sprite configuration.'
			}

			var loadingCompleted = false
			var timeOutLength = 5000

			// if loadSounds does not return in under 5000 ms a failed load is assumed
			registerTimer(
				_.bind(
					function() {
						if( loadingCompleted ) return

						this.onTimeOut( this.resourceBundleName, this.resourceUri )
					},
					this
				),
				timeOutLength
			)

			// creating the spell sound objects out of the sound sprite config
			loadSounds(
                this.soundManager,
				soundSpriteConfig,
				function( sounds ) {
					if( loadingCompleted ) return

					onCompleteCallback( sounds )
					loadingCompleted = true
				}
			)
		}

		var loadJson = function( uri, onCompleteCallback ) {
			var textLoader = new TextLoader(
				this.eventManager,
				this.host,
				this.resourceBundleName,
				uri,
				function( jsonString ) {
					var object = JSON.parse( jsonString )

					if( object === undefined ) throw 'Parsing json string failed.'


					onCompleteCallback( object )
				}
			)

			textLoader.start()
		}


		/**
		 * public
		 */

		var SoundLoader = function( eventManager, host, resourceBundleName, resourceUri, loadingCompletedCallback, timedOutCallback, soundManager ) {
			this.eventManager       = eventManager
            this.soundManager       = soundManager
			this.host               = host
			this.resourceBundleName = resourceBundleName
			this.resourceUri        = resourceUri
			this.onCompleteCallback = loadingCompletedCallback
			this.onTimeOut          = timedOutCallback
		}

		SoundLoader.prototype = {
			start: function() {
				var fileName = _.last( this.resourceUri.split( '/' ) )
				var extension = _.last( fileName.split( '.' ) )

				if( extension === "json" ) {
					/**
					 * The html5 back-end uses sound sprites by default. Therefore loading of the sound set config can be skipped and the sound sprite config
					 * can be loaded directly.
					 */
					var soundSpriteConfigUri = "sounds/output/" + fileName

					loadJson.call(
						this,
						soundSpriteConfigUri,
						_.bind(
							function( soundSpriteConfig ) {
								processSoundSpriteConfig.call( this, soundSpriteConfig, this.onCompleteCallback )
							},
							this
						)
					)

				} else /*if( extension === "" )*/ {
//					console.log( "Not yet implemented." )
				}
			}
		}

		return SoundLoader
	}
)
;
define(
	"spell/shared/util/platform/private/createLoader",
	[
		"underscore"
	],
	function(
		_
	) {
		"use strict"

		return function( constructor, eventManager, host, resourceBundleName, resourceUri, loadingCompletedCallback, timedOutCallback, soundManager ) {
			if( constructor === undefined )              throw 'Argument 1 is missing.'
			if( eventManager === undefined )             throw 'Argument 2 is missing.'
			if( host === undefined )                     throw 'Argument 3 is missing.'
			if( resourceBundleName === undefined )       throw 'Argument 4 is missing.'
			if( resourceUri === undefined )              throw 'Argument 5 is missing.'
			if( loadingCompletedCallback === undefined ) throw 'Argument 6 is missing.'
			if( timedOutCallback === undefined )         throw 'Argument 7 is missing.'

			return new constructor(
				eventManager,
				host,
				resourceBundleName,
				resourceUri,
				loadingCompletedCallback,
				timedOutCallback,
                soundManager
			)
		}
	}
)
;
define(
	"spell/shared/util/platform/private/Input",
	[
		"spell/shared/util/input/keyCodes",
		"spell/shared/util/math",

		"underscore"
	],
	function(
		keyCodes,
		math,

		_
	) {
		"use strict"


		/**
		 * private
		 */
		var isEventSupported = function( eventName ) {
			return _.has( nativeEventMap, eventName )
		}

		function getScreenOffset() {
			return getOffset( document.getElementById( 'spell-canvas' ) )
		}

		function getOffset( element ) {
			var box = element.getBoundingClientRect()

			var body    = document.body
			var docElem = document.documentElement

			var scrollTop  = window.pageYOffset || docElem.scrollTop || body.scrollTop
			var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft

			var clientTop  = docElem.clientTop || body.clientTop || 0
			var clientLeft = docElem.clientLeft || body.clientLeft || 0

			var top  = box.top + scrollTop - clientTop
			var left = box.left + scrollLeft - clientLeft

			return [ Math.round( left ), Math.round( top ) ]
		}

		var nativeTouchHandler = function( callback, event ) {
			event.stopPropagation()
			event.preventDefault()

			var touch = event.changedTouches[ 0 ]
			var offset = getScreenOffset()
			var screenSize = this.configurationManager.screenSize

			var position = [
				( touch.pageX - offset[ 0 ] ) / screenSize.width,
				( touch.pageY - offset[ 1 ] ) / screenSize.height
			]

			// if the event missed the display it gets ignored
			if( !math.isInInterval( position[ 0 ], 0.0, 1.0 ) ||
				!math.isInInterval( position[ 1 ], 0.0, 1.0 ) ) {

				return
			}

			callback( {
				type     : event.type,
				position : position
			} )
		}

		var nativeKeyHandler = function( callback, event ) {
			if( event.keyCode === keyCodes[ 'space' ] ||
				event.keyCode === keyCodes[ 'left arrow' ] ||
				event.keyCode === keyCodes[ 'up arrow' ] ||
				event.keyCode === keyCodes[ 'right arrow' ] ||
				event.keyCode === keyCodes[ 'down arrow' ] ) {

				event.preventDefault()
			}

			callback( event )
		}

        var nativeMouseHandler = function( callback, event ) {
            event.preventDefault()

			var offset = getScreenOffset()
			var screenSize = this.configurationManager.screenSize

			var position = [
				( event.pageX - offset[ 0 ] ) / screenSize.width,
				( event.pageY - offset[ 1 ] ) / screenSize.height
			]

            // if the event missed the display it gets ignored
            if( !math.isInInterval( position[ 0 ], 0.0, 1.0 ) ||
                !math.isInInterval( position[ 1 ], 0.0, 1.0 ) ) {

                return
            }

            callback( {
                type     : event.type,
                position : position
            } )
        }

		/**
		 * maps the internal event name to to native event name and callback
		 */
		var nativeEventMap = {
            touchstart : {
                eventName : 'touchstart',
                handler   : nativeTouchHandler
            },
            touchend : {
                eventName : 'touchend',
                handler   : nativeTouchHandler
            },
			mousedown : {
				eventName : 'mousedown',
				handler   : nativeMouseHandler
			},
			mouseup : {
				eventName : 'mouseup',
				handler   : nativeMouseHandler
			},
			keydown : {
				eventName : 'keydown',
				handler   : nativeKeyHandler
			},
			keyup : {
				eventName : 'keyup',
				handler   : nativeKeyHandler
			}
		}


		/**
		 * public
		 */

		var Input = function( configurationManager ) {
			this.configurationManager = configurationManager
		}

		var setListener = function( eventName, callback ) {
			if( !isEventSupported( eventName ) ) return

			var nativeEvent = nativeEventMap[ eventName ]

            document.body[ 'on' + nativeEvent.eventName ] = _.bind( nativeEvent.handler, this, callback )
		}

		var removeListener = function( eventName ) {
			if( !isEventSupported( eventName ) ) return

			var nativeEvent = nativeEventMap[ eventName ]

            document.body[ 'on' + nativeEvent.eventName ] = null
		}

		Input.prototype = {
			setInputEventListener    : setListener,
			removeInputEventListener : removeListener
		}

		return Input
	}
)
;
define(
	"spell/shared/util/platform/private/sound/SoundManager",
	[
		"spell/shared/components/sound/soundEmitter",

		"underscore"
	],
	function(
		soundEmitterConstructor,

		_
		) {
		"use strict"

		var maxAvailableChannels = 8
        var context              = undefined
        var muted                = false

		var checkMaxAvailableChannels = function() {
			if( (/iPhone|iPod|iPad/i).test( navigator.userAgent ) ) {
				maxAvailableChannels = 1

			} else {
				maxAvailableChannels = 8
			}

			return maxAvailableChannels
		}

		var basePath = "sounds"

		var channels = {}

		var getFreeChannel = function( resource, isBackground ) {
			var channel = _.find(
				channels,
				function( channel ) {
					if( channel.resource === resource &&
						!channel.playing &&
						!channel.selected )  {

						if( maxAvailableChannels === 1 ) {
							if(	isBackground ) return true
						} else {
							return true
						}
					}

					return false
				}
			)

			if( !!channel ) {
				channel.selected = true
				channel.playing = false
			}

			return channel
		}

		var remove = function( soundObject ) {
			soundObject.stop     = -1
			soundObject.start    = -1
			soundObject.selected = false
            soundObject.playing  = false
		}

		var audioFormats = {
			ogg: {
				mimeTypes: ['audio/ogg; codecs=vorbis']
			},
			mp3: {
				mimeTypes: ['audio/mpeg; codecs="mp3"', 'audio/mpeg', 'audio/mp3', 'audio/MPA', 'audio/mpa-robust']
			},
			wav: {
				mimeTypes: ['audio/wav; codecs="1"', 'audio/wav', 'audio/wave', 'audio/x-wav']
			}
		}

		var detectExtension = function() {

			var probe = new Audio();

			return _.reduce(
				audioFormats,
				function( memo, format, key ) {
					if( !!memo ) return memo

					var supportedMime = _.find(
						format.mimeTypes,
						function( mimeType ) {
							return probe.canPlayType( mimeType )
						}
					)

					return ( !!supportedMime ) ? key : null
				},
				null
			)
		}

		var createHTML5Audio = function ( config ) {
			var html5Audio = new Audio()

			if( !!config.onloadeddata ) {

				html5Audio.addEventListener(
					"canplaythrough", config.onloadeddata,
					false
				)
			}

			html5Audio.addEventListener( "error", function() {
				throw "Error: Could not load sound resource '"+html5Audio.src+"'"
			}, false )

			html5Audio.id       = config.id
			html5Audio.resource = config.resource
			html5Audio.playing  = false
			html5Audio.selected = false
			html5Audio.src      = basePath + "/" + config.resource + "."+ detectExtension()

			// old WebKit
			html5Audio.autobuffer = "auto"

			// new WebKit
			html5Audio.preload = "auto"
			html5Audio.load()

			return html5Audio
		}

		var cloneHTML5Audio = function( ObjectToClone ) {
			var html5Audioclone = ObjectToClone.cloneNode(true)

			html5Audioclone.resource = ObjectToClone.resource
			html5Audioclone.playing  = false
			html5Audioclone.selected = false

			return html5Audioclone
		}

        var createWebkitHTML5Audio = function ( config ) {
            var request = new XMLHttpRequest();
            request.open('GET', basePath + "/" + config.resource + "."+ detectExtension(), true);
            request.responseType = 'arraybuffer';

            if( !!config.onloadeddata ) {

                // Decode asynchronously
                request.onload = function() {
                  context.decodeAudioData( request.response,
                      function( buffer ) {

                          buffer.id       = config.id
                          buffer.resource = config.resource
                          buffer.playing  = false
                          buffer.selected = false

                          config.onloadeddata( buffer )
                      }

                  );
                }
            }

            request.onError = function() {
                throw "Error: Could not load sound resource '"+ config.resource +"'"
            }

            request.send()

            return request
        }

        var hasWebAudioSupport = function() {
            try{
                context = new webkitAudioContext()
                return true
            }catch( e ) {
                return false
            }
        }

        var toggleMuteSounds = function( muted ) {
            _.each(
                _.keys( channels ),
                function( key) {

                    if( hasWebAudioSupport() ) {
                        channels[key].gain  = ( muted === true ) ? 0 : 1

                    } else {
                        channels[key].muted = muted

                        if( maxAvailableChannels === 1 ) {
                            if( muted === true)
                                channels[ key ].pause()
                            else
                                channels[ key ].play()
                        }
                    }
                }
            )
        }

        var setMuted = function( value ) {
            muted = !!value
            toggleMuteSounds( muted )
        }

        var isMuted = function() {
            return muted
        }

        var SoundManager = function() {

            if( !hasWebAudioSupport() ) {
                this.createAudio = createHTML5Audio
                this.cloneAudio  = cloneHTML5Audio

            }else {
                this.createAudio = createWebkitHTML5Audio
                this.context          = context
            }

        }

        SoundManager.prototype = {
            soundSpriteConfig         : undefined,
            audioFormats              : audioFormats,
            channels                  : channels,
            getFreeChannel            : getFreeChannel,
            checkMaxAvailableChannels : checkMaxAvailableChannels,
            maxAvailableChannels      : maxAvailableChannels,
            remove                    : remove,
            setMuted                  : setMuted,
            isMuted                   : isMuted
        }

        return SoundManager
	}
)
;
define(
	'spell/shared/util/platform/PlatformKit',
	[
		'spell/shared/util/platform/private/callNextFrame',
		'spell/shared/util/platform/private/createSocket',
		'spell/shared/util/platform/private/graphics/RenderingFactory',
		'spell/shared/util/platform/private/registerTimer',
		'spell/shared/util/platform/private/loader/ImageLoader',
		'spell/shared/util/platform/private/loader/SoundLoader',
		'spell/shared/util/platform/private/loader/TextLoader',
		'spell/shared/util/platform/private/createLoader',
		'spell/shared/util/platform/private/Input',
		'spell/shared/util/platform/private/configurationOptions',
		'spell/shared/util/platform/private/system/features',
        'spell/shared/util/platform/private/graphics/Viewporter',
		'spell/shared/util/platform/private/sound/SoundManager',
		'spell/shared/util/math',

		'underscore'
	],
	function(
		callNextFrame,
		createSocket,
		RenderingFactory,
		registerTimer,
		ImageLoader,
		SoundLoader,
		TextLoader,
		createLoader,
		Input,
		configurationOptions,
		features,
        Viewporter,
		SoundManager,
		math,

		_
	) {
		'use strict'


		var getHost = function() {
			return document.location.host
		}

		var getUrlParameters = function() {
			var url = window.location.href
			var map = {}

			url.replace(
				/[?&]+([^=&]+)=([^&]*)/gi,
				function( match, key, value ) {
					map[ key ] = value
				}
			)

			return map
		}

		var getPlatformInfo = function() {
			return 'html5'
		}

		var getJson = function() {
			return {
				encode : _.bind( JSON.stringify, JSON ),
				decode : _.bind( JSON.parse, JSON )
			}
		}

		var createInput = function( eventManager, Events ) {
			return new Input( eventManager, Events )
		}

        var registerOnScreenResize = function( callback ) {
            Viewporter.renderViewport( callback )
        }

		var createSoundManager = function() {
			return new SoundManager()
		}

		return {
			callNextFrame          : callNextFrame,
			registerTimer          : registerTimer,
			createSocket           : createSocket,
			createSoundManager     : createSoundManager,
			RenderingFactory       : RenderingFactory,
			getHost                : getHost,
			getUrlParameters       : getUrlParameters,
			configurationOptions   : configurationOptions,
			getPlatformInfo        : getPlatformInfo,
			getJsonCoder           : getJson,
			createInput            : createInput,
			features               : features,
			registerOnScreenResize : registerOnScreenResize,

			createImageLoader : function( eventManager, host, resourceBundleName, resourceUri, loadingCompletedcallback, timedOutCallback ) {
				return createLoader( ImageLoader, eventManager, host, resourceBundleName, resourceUri, loadingCompletedcallback, timedOutCallback )
			},

			createSoundLoader : function( eventManager, host, resourceBundleName, resourceUri, loadingCompletedcallback, timedOutCallback, soundManager ) {
				return createLoader( SoundLoader, eventManager, host, resourceBundleName, resourceUri, loadingCompletedcallback, timedOutCallback, soundManager )
			},

			createTextLoader : function( eventManager, host, resourceBundleName, resourceUri, loadingCompletedcallback, timedOutCallback ) {
				return createLoader( TextLoader, eventManager, host, resourceBundleName, resourceUri, loadingCompletedcallback, timedOutCallback )
			}
		}
	}
)
;
define(
	"spell/shared/util/ConfigurationManager",
	[
		"spell/shared/util/platform/PlatformKit",
		"spell/shared/util/Events",

		"underscore"
	],
	function(
		PlatformKit,
		Events,

		_
	) {
		"use strict"


		/**
		 * private
		 */

		/**
		 * Generates a structure holding server host configuration information
		 *
		 * The returned structure looks like this:
		 * {
		 * 	host - the host, i.e. "acme.org:8080"
		 * 	type - This can take the value "internal" (same host as client was delivered from) or "external" (different host that the client was delivered from).
		 * }
		 *
		 * @param validValues
		 * @param value
		 */
		var extractServer = function( validValues, value ) {
			if( _.indexOf( validValues, '*' ) === -1 ) return false

			// TODO: validate that the value is a valid host
			var host = ( value === 'internal' ? PlatformKit.getHost() : value )
			var type = ( value === 'internal' ? 'internal' : 'external' )

			return {
				host : host,
				type : type
			}
		}

		var extractScreenSize = function( validValues, value ) {
			if( _.indexOf( validValues, value ) === -1 ) return false

			var parts = value.split( 'x' )

			return {
				width  : parseInt( parts[ 0 ] ),
				height : parseInt( parts[ 1 ] )
			}
		}

		/**
		 * These are the platform agnostic options.
		 *
		 * gameserver/resourceServer - "internal" means "same as the server that the client was delivered from"; "*" matches any valid host/port combination, i.e. "acme.org:8080"
		 *
		 * The property "configurable" controls if the option can be overwriten by the environment configuration set up by the stage-0-loader.
		 */
		var validOptions = {
			screenSize : {
				validValues  : [ '640x480', '800x600', '1024x768' ],
				configurable : false,
				extractor    : extractScreenSize
			},
			gameServer : {
				validValues  : [ 'internal', '*' ],
				configurable : true,
				extractor    : extractServer
			},
			resourceServer : {
				validValues  : [ 'internal', '*' ],
				configurable : true,
				extractor    : extractServer
			}
		}

		/**
		 * These options are used when they are not overridden by the environment configuration set up by the stage-0-loader.
		 */
		var defaultOptions = {
			screenSize     : '1024x768',
			gameServer     : 'internal',
			resourceServer : 'internal'
		}

		var createConfiguration = function( defaultOptions, validOptions ) {
			if( !defaultOptions ) defaultOptions = {}
			if( !validOptions ) validOptions = {}

			// PlatformKit.configurationOptions.* holds the platform specific options
			_.defaults( defaultOptions, PlatformKit.configurationOptions.defaultOptions )
			_.defaults( validOptions, PlatformKit.configurationOptions.validOptions )


			var suppliedParameters = PlatformKit.getUrlParameters()

			// filter out parameters that are not configurable
			suppliedParameters = _.reduce(
				suppliedParameters,
				function( memo, value, key ) {
					var option = validOptions[ key ]

					if( option &&
						!!option.configurable ) {

						memo[ key ] = value
					}

					return memo
				},
				{}
			)

			_.defaults( suppliedParameters, defaultOptions )

			var config = _.reduce(
				suppliedParameters,
				function( memo, optionValue, optionName ) {
					var option = validOptions[ optionName ]

					var configValue = option.extractor(
						option.validValues,
						optionValue
					)

					if( configValue !== false ) {
						memo[ optionName ] = configValue

					} else {
						// use the default value
						memo[ optionName ] = option.extractor(
							option.validValues,
							defaultOptions[ optionName ]
						)
					}

					return memo
				},
				{}
			)

			config.platform = PlatformKit.getPlatformInfo()

			return config
		}


		/**
		 * public
		 */

		var ConfigurationManager = function( eventManager ) {
			_.extend( this, createConfiguration( defaultOptions, validOptions ) )

			eventManager.subscribe(
				[ Events.SCREEN_RESIZED ],
				_.bind(
					function( width, height ) {
						this.screenSize.width  = width
						this.screenSize.height = height
					},
					this
				)
			)
		}

		return ConfigurationManager
	}
)
;
define(
	"spell/shared/util/InputManager",
	[
		"spell/shared/util/input/keyCodes",
		"spell/shared/util/math",
		"spell/shared/util/platform/PlatformKit",

		"underscore"
	],
	function(
		keyCodes,
		math,
		PlatformKit,

		_
	) {
		"use strict"

		//TODO: get constants from a global configuration
		var constants = {
			"xSize" : 1024,
			"ySize" : 768
		}

		/**
		 * private
		 */

		var nextSequenceNumber = 0


		/**
		 * public
		 */

		var inputEvents = []

		var mouseHandler = function( event ) {
			// scale screen space position to "world" position
			event.position[ 0 ] *= constants.xSize
			event.position[ 1 ] *= constants.ySize

			var internalEvent = {
				type           : event.type,
				sequenceNumber : nextSequenceNumber++,
                position       : event.position
			}

			inputEvents.push( internalEvent )
		}

        var touchHandler = function( event ) {
            // scale screen space position to "world" position
            event.position[ 0 ] *= constants.xSize
            event.position[ 1 ] *= constants.ySize

            var internalEvent = {
                type           : ( event.type === 'touchstart' ? 'mousedown' : 'mouseup' ),
                sequenceNumber : nextSequenceNumber++,
                position       : event.position
            }

            inputEvents.push( internalEvent )
        }

		var keyHandler = function( event ) {
			inputEvents.push( {
				type           : event.type,
				keyCode        : event.keyCode,
				sequenceNumber : nextSequenceNumber++
			} )
		}


		var InputManager = function( configurationManager ) {
			this.nativeInput = PlatformKit.createInput( configurationManager )

		}

		InputManager.prototype = {
			init : function() {
				if( PlatformKit.features.touch ) {
					this.nativeInput.setInputEventListener( 'touchstart', touchHandler )
					this.nativeInput.setInputEventListener( 'touchend', touchHandler )
				}

                this.nativeInput.setInputEventListener( 'mousedown', mouseHandler )
                this.nativeInput.setInputEventListener( 'mouseup', mouseHandler )

				this.nativeInput.setInputEventListener( 'keydown', keyHandler )
				this.nativeInput.setInputEventListener( 'keyup', keyHandler )
			},
			cleanUp : function() {
				if( PlatformKit.features.touch ) {
					this.nativeInput.removeInputEventListener( 'touchstart' )
					this.nativeInput.removeInputEventListener( 'touchend' )
				}

                this.nativeInput.removeInputEventListener( 'mousedown' )
                this.nativeInput.removeInputEventListener( 'mouseup' )

				this.nativeInput.removeInputEventListener( 'keydown' )
				this.nativeInput.removeInputEventListener( 'keyup' )
			},
			getInputEvents : function() {
				return inputEvents
			}
		}

		return InputManager
	}
)
;
define(
	'spell/shared/util/ResourceLoader',
	[
		'spell/shared/util/platform/PlatformKit',
		'spell/shared/util/Events',
		'spell/shared/util/Logger',

		'underscore'
	],
	function(
		PlatformKit,
		Events,
		Logger,

		_
	) {
		'use strict'


		/**
		 * private
		 */

		var STATE_WAITING_FOR_PROCESSING = 0
		var STATE_PROCESSING = 1
		var STATE_COMPLETED = 2

		var extensionToLoaderFactory = {
			'png'  : PlatformKit.createImageLoader,
			'jpg'  : PlatformKit.createImageLoader,
			'json' : PlatformKit.createSoundLoader,
			'txt'  : PlatformKit.createTextLoader
		}


		var createResourceBundle = function( name, resources ) {
			return {
				name                  : name,
				state                 : STATE_WAITING_FOR_PROCESSING,
				resources             : resources,
				resourcesTotal        : resources.length,
				resourcesNotCompleted : resources.length
			}
		}

		/**
		 * Returns true if a resource bundle with the provided name exists, false otherwise.
		 *
		 * @param resourceBundles
		 * @param name
		 */
		var resourceBundleExists = function( resourceBundles, name ) {
			return _.has( resourceBundles, name )
		}

		/**
		 * Returns true if a resource with the provided name exists, false otherwise.
		 *
		 * @param resources
		 * @param resourceName
		 */
		var isResourceInCache = function( resources, resourceName ) {
			return _.has( resources, resourceName )
		}

		var updateProgress = function( resourceBundle ) {
			resourceBundle.resourcesNotCompleted -= 1

			var progress = 1.0 - resourceBundle.resourcesNotCompleted / resourceBundle.resourcesTotal

			this.eventManager.publish(
				[ Events.RESOURCE_PROGRESS, resourceBundle.name ],
				[ progress ]
			)

			if( resourceBundle.resourcesNotCompleted === 0 ) {
				resourceBundle.state = STATE_COMPLETED

				this.eventManager.publish( [ Events.RESOURCE_LOADING_COMPLETED, resourceBundle.name ] )
			}
		}

		var checkResourceAlreadyLoaded = function( loadedResources, resourceName ) {
			_.each(
				loadedResources,
				_.bind(
					function( loadedResource, loadedResourceName ) {
						if( !_.has( this.resources, loadedResourceName ) ) return

						throw 'Error: sub-resource "' + loadedResourceName + '" from resource "' + resourceName + '" already exists.'
					},
					this
				)
			)
		}

		var resourceLoadingCompletedCallback = function( resourceBundleName, resourceName, loadedResources ) {
			if( loadedResources === undefined ||
				_.size( loadedResources ) === 0 ) {

				throw 'Resource "' + resourceName + '" from resource bundle "' + resourceBundleName + '" is undefined or empty on loading completed.'
			}

			// making sure the loaded resources were not already returned earlier
			checkResourceAlreadyLoaded.call( this, loadedResources, resourceName )

			// add newly loaded resources to cache
			_.extend( this.resources, loadedResources )

			updateProgress.call( this, this.resourceBundles[ resourceBundleName ] )
		}

		var resourceLoadingTimedOutCallback = function( resourceBundleName, resourceName ) {
			Logger.debug( 'Loading "' + resourceName + '" failed with a timeout. In case the execution environment is safari this message can be ignored.' )

			updateProgress.call( this, this.resourceBundles[ resourceBundleName ] )
		}

		var createLoader = function( eventManager, host, resourceBundleName, resourceName, loadingCompletedCallback, loadingTimedOutCallback, soundManager ) {
			var extension = _.last( resourceName.split( '.' ) )
			var loaderFactory = extensionToLoaderFactory[ extension ]

			if( loaderFactory === undefined ) {
				throw 'Could not create loader factory for resource "' + resourceName + '".'
			}

			var loader = loaderFactory(
				eventManager,
				host,
				resourceBundleName,
				resourceName,
				loadingCompletedCallback,
				loadingTimedOutCallback,
                ( extension === 'json' ) ? soundManager : undefined
			)

			return loader
		}

		var startLoadingResourceBundle = function( resourceBundle ) {
			_.each(
				resourceBundle.resources,
				_.bind(
					function( resourceName ) {
						if( isResourceInCache( this.resources, resourceName ) ) {
							updateProgress.call( this, resourceBundle )

							return
						}

						var loader = createLoader(
							this.eventManager,
							this.host,
							resourceBundle.name,
							resourceName,
							_.bind( resourceLoadingCompletedCallback, this, resourceBundle.name, resourceName ),
							_.bind( resourceLoadingTimedOutCallback, this, resourceBundle.name, resourceName ),
                            this.soundManager
						)

						if( loader !== undefined ) {
							loader.start()

						} else {
							throw 'Could not create a loader for resource "' + resourceName + '".'
						}
					},
					this
				)
			)
		}


		/**
		 * public
		 */

		var ResourceLoader = function( soundManager, eventManager, hostConfig ) {
			if( eventManager === undefined ) throw 'Argument "eventManager" is undefined.'
            if( soundManager === undefined ) throw 'Argument "soundManager" is undefined.'

            this.soundManager = soundManager
			this.eventManager = eventManager
			this.resourceBundles = {}
			this.resources = {}
			this.host = ( hostConfig.type === 'internal' ? '' : 'http://' + hostConfig.host )
		}

		ResourceLoader.prototype = {
			addResourceBundle: function( name, resources ) {
				if( _.size( resources ) === 0 ) {
					throw 'Resource group with name "' + name + '" has zero assigned resources.'
				}

				if( resourceBundleExists( this.resourceBundles, name ) ) {
					throw 'Resource group with name "' + name + '" already exists.'
				}


				this.resourceBundles[ name ] = createResourceBundle(
					name,
					resources
				)
			},

			start: function() {
				_.each(
					this.resourceBundles,
					_.bind(
						function( resourceBundle ) {
							if( resourceBundle.state !== STATE_WAITING_FOR_PROCESSING ) return

							resourceBundle.state = STATE_PROCESSING
							startLoadingResourceBundle.call( this, resourceBundle )
						},
						this
					)
				)
			},

			getResources: function() {
				return this.resources
			}
		}

		return ResourceLoader
	}
)
;
define(
	"funkysnakes/client/systems/updateRenderData",
	[
		"underscore"
	],
	function(
		_
	) {
		"use strict"


		return function(
			entities
		) {
			_.each( entities, function( entity ) {
				entity.renderData.position = _.clone( entity.position )
				if ( entity.orientation ) {
					entity.renderData.orientation = entity.orientation.angle
				}
				else {
					entity.renderData.orientation = 0
				}
			} )
		}
	}
)
;
define(
	"funkysnakes/client/systems/shieldRenderer",
	[
		"funkysnakes/shared/config/constants",

		"glmatrix/vec3",
		"glmatrix/mat4",
		"underscore"
	],
	function(
		constants,

		vec3,
		mat4,
		_
	) {
		"use strict"


		function render(
			timeInMs,
			textures,
			context,
			shieldEntities
		) {
			var maxShieldLifetime = constants.shieldLifetime
			var timeInS = timeInMs / 1000
			var scaleMagnitude = 0.04
			var scaleFrequency = Math.PI * 2 * 1.5

			_.each( shieldEntities, function( entity ) {
				var dynamicScaleFactor = 1 - scaleMagnitude + Math.cos( timeInS * scaleFrequency ) * scaleMagnitude,
					dynamicAlphaFactor = 1.0,
					entityRenderData   = entity.renderData


				if( entity.shield.state === "activated" ) {
					var ageInSeconds = maxShieldLifetime - entity.shield.lifetime

					// ((x/-3) + 1) + (x/3) * (cos(x * 30) + 1) / 2
					dynamicAlphaFactor = ( ( ageInSeconds / -maxShieldLifetime ) + 1 ) + ( ageInSeconds / maxShieldLifetime ) * ( Math.cos ( ageInSeconds * 30 ) + 1 ) / 2
				}

				context.save()
				{
					var textureId = "effects/shield.png"
					var shieldTexture = textures[ textureId ]

					context.setGlobalAlpha( dynamicAlphaFactor )

					// object to world space transformation go here
					context.translate( entityRenderData.position )
					context.rotate( entityRenderData.orientation )

					// "appearance" transformations go here
					context.scale( [ shieldTexture.width * dynamicScaleFactor, shieldTexture.height * dynamicScaleFactor, 1 ] )
					context.translate( [ -0.5, -0.5, 0 ] )

					context.drawTexture( shieldTexture, 0, 0, 1, 1 )
				}
				context.restore()
			} )
		}


		return render
	}
)
;
define(
	"funkysnakes/client/systems/Renderer",
	[
		"funkysnakes/client/systems/shieldRenderer",
		"funkysnakes/shared/config/constants",
		"spell/shared/util/Events",
        "spell/client/util/font/fonts/BelloPro",
        "spell/client/util/font/createFontWriter",

		"glmatrix/vec3",
		"glmatrix/mat4",
		"underscore"
	],
	function(
		shieldRenderer,
		constants,
		Events,
        BelloPro,
        createFontWriter,

		vec3,
		mat4,
		_
	) {
		"use strict"


		/**
		 * private
		 */

		var createEntitiesSortedByPath = function( entitiesByPass ) {
			var passA, passB

			return _.toArray( entitiesByPass ).sort(
				function( a, b ) {
					passA = a[ 0 ].renderData.pass
					passB = b[ 0 ].renderData.pass

					return ( passA < passB ? -1 : ( passA > passB ? 1 : 0 ) )
				}
			)
		}

		var createWorldToViewMatrix = function( matrix, aspectRatio ) {
			// world space to view space matrix
			var cameraWidth  = 1024,
				cameraHeight = 768

			mat4.ortho(
				0,
				cameraWidth,
				0,
				cameraHeight,
				0,
				1000,
				matrix
			)

			mat4.translate( matrix, [ 0, 0, 0 ] ) // camera is located at (0/0/0); WATCH OUT: apply inverse translation
		}

		var shadowOffset = vec3.create( [ 3, -2, 0 ] ),
			position     = vec3.create( [ 0, 0, 0 ] )


		var process = function(
			timeInMs,
			deltaTimeInMs,
			entitiesByPass,
			shieldEntities,
            textEntities
		) {
			var context       = this.context,
				textures      = this.textures,
				texture       = undefined,
				shadowTexture = undefined,
				drewShields   = false,
                fontWriter    = this.fontWriter

			// clear color buffer
			context.clear()


			_.each(
				createEntitiesSortedByPath( entitiesByPass ),
				function( entities ) {
					// draw shadows
					_.each(
						entities, function( entity ) {
							if( !entity.hasOwnProperty( "shadowCaster" ) ) return

							var entityRenderData = entity.renderData

							shadowTexture = textures[ entity.shadowCaster.textureId ]

							context.save()
							{
								context.setGlobalAlpha( 0.85 )

								vec3.reset( position )
								vec3.add( entityRenderData.position, shadowOffset, position )

								// object to world space transformation go here
								context.translate( position )
								context.rotate( entityRenderData.orientation )

								// "appearance" transformations go here
								context.translate( entity.appearance.translation )
								context.scale( [ shadowTexture.width, shadowTexture.height, 1 ] )

								context.drawTexture( shadowTexture, 0, 0, 1, 1 )
							}
							context.restore()
						}
					)

					// HACK: until animated appearances are supported shield rendering has to happen right before the "widget pass"
					if( !drewShields &&
						entities.length > 0 &&
						entities[ 0 ].renderData.pass === 100 ) {

						shieldRenderer( timeInMs, textures, context, shieldEntities )
						drewShields = true
					}

					// draw textures
					_.each(
						entities,
						function( entity ) {
							context.save()
							{
								var entityRenderData  = entity.renderData,
									entityAppearance  = entity.appearance,
									renderDataOpacity = entityRenderData.opacity,
									appearanceOpacity = entityAppearance.opacity

								// appearances without a texture id are drawn as colored rectangles
								if( !entityAppearance.textureId &&
									entityAppearance.color ) {

									context.translate( entityRenderData.position )
									context.setFillStyleColor( entityAppearance.color )
									context.fillRect(
										0,
										0,
										entityAppearance.scale[ 0 ],
										entityAppearance.scale[ 1 ]
									)

								} else {
									texture = textures[ entityAppearance.textureId ]

									if( texture === undefined ) throw "The textureId '" + entityAppearance.textureId + "' could not be resolved."


									if( appearanceOpacity !== 1.0 ||
											renderDataOpacity !== 1.0 ) {

										context.setGlobalAlpha( appearanceOpacity * renderDataOpacity )
									}

									// object to world space transformation go here
									context.translate( entityRenderData.position )
									context.rotate( entityRenderData.orientation )

									// "appearance" transformations go here
									context.translate( entityAppearance.translation )
									context.scale( [ texture.width, texture.height, 1 ] )

									context.drawTexture( texture, 0, 0, 1, 1 )
								}
							}
							context.restore()
						}
					)

//					// draw origins
//					context.setFillStyleColor( [ 1.0, 0.0, 1.0 ] )
//
//					_.each(
//						entities,
//						function( entity ) {
//							var entityRenderData = entity.renderData
//
//							context.save()
//							{
//								// object to world space transformation go here
//								context.translate( entityRenderData.position )
//								context.rotate( entityRenderData.orientation )
//
//								context.fillRect( -2, -2, 4, 4 )
//							}
//							context.restore()
//						}
//					)
				}
			)

//            _.each(
//                textEntities,
//                function( entity ) {
//                    var rgbColor = [
//                        1,
//                        0,
//                        0
//                    ]
//
//                    fontWriter.drawString(
//                        context,
//                        entity.text.value,
//                        rgbColor,
//                        1,
//                        entity.position
//                    )
//                }
//            )
		}

		/**
		 * public
		 */

		var Renderer = function(
			eventManager,
			textures,
			context
		) {
			this.textures        = textures
			this.context         = context
            this.fontWriter      = createFontWriter( BelloPro, textures[ "ttf/BelloPro_0.png" ]  )

			// setting up the view space matrix
			this.worldToView = mat4.create()
			mat4.identity( this.worldToView )
			createWorldToViewMatrix( this.worldToView, 4 / 3 )
			context.setViewMatrix( this.worldToView )

			// setting up the viewport
            var viewportPositionX = 0,
                viewportPositionY = 0
			context.viewport( viewportPositionX, viewportPositionY, constants.maxWidth, constants.maxHeight )


			eventManager.subscribe(
				Events.SCREEN_RESIZED,
				_.bind(
					function( screenWidth, screenHeight ) {
						context.resizeColorBuffer( screenWidth, screenHeight )
						context.viewport( viewportPositionX, viewportPositionY, screenWidth, screenHeight )
					},
					this
				)
			)
		}

		Renderer.prototype = {
			process : process
		}


		return Renderer
	}
)
;
define(
	"spell/shared/util/map",
	[
		"underscore"
	],
	function(
		_
	) {
		"use strict"
		
		
		return {
			create: function( initialElements, listener ) {
				var map = {
					elements: {}
				}
				
				_.each( initialElements, function( element ) {
					var key   = element[ 0 ]
					var value = element[ 1 ]
					
					map.elements[ key ] = value
				} )
				
				if ( listener !== undefined ) {
					listener.onCreate( map )
				}
				
				return map
			},
			
			add: function( map, key, value, listener ) {
				var oldValue = map.elements[ key ]
				
				map.elements[ key ] = value
				
				if ( oldValue === undefined ) {
					if ( listener !== undefined ) {
						listener.onAdd( map, key, value )
					}
				}
				else {
					if ( listener !== undefined ) {
						listener.onUpdate( map, key, oldValue, value )
					}
				}
			},
			
			remove: function( map, key, listener ) {
				var entity = map.elements[ key ]
				if ( listener !== undefined && entity !== undefined ) {
					listener.onRemove( map, key, entity )
				}
				
				delete map.elements[ key ]				
			}
		}
	}
)
;
define(
	"spell/shared/util/entities/Entities",
	[
		"spell/shared/util/map",
		
		"underscore"
	],
	function(
		map,
		
		_
	) {
		"use strict"
		
		
		function Entities() {
			this.entities = map.create()
			this.queries  = {}
			
			this.nextQueryId = 0
		}
		
		
		Entities.prototype = {
			add: function( entity ) {
				map.add( this.entities, entity.id, entity )
				
				_.each( this.queries, function( query ) {
					addIfHasAllComponents(
						query.entities,
						entity,
						query.componentTypes,
						query.dataStructure
					)
				} )
			},
			
			remove: function( entity ) {
				map.remove( this.entities, entity.id )
				
				_.each( this.queries, function( query ) {
					map.remove( query.entities, entity.id, query.dataStructure )
				} )
			},
			
			update: function( entity ) {
				_.each( this.queries, function( query ) {
					if ( hasAllComponents( entity, query.componentTypes ) ) {
						map.add( query.entities, entity.id, entity, query.dataStructure )
					}
					else {
						map.remove( query.entities, entity.id, query.dataStructure )
					}
				} )
			},
			
			prepareQuery: function( componentTypes, dataStructure ) {
				var queryId = getNextQueryId( this )
				
				var query = {
					componentTypes: componentTypes,
					entities      : map.create( [], dataStructure ),
					dataStructure : dataStructure
				}
				
				this.queries[ queryId ] = query
				
				_.each( this.entities.elements, function( entity ) {
					addIfHasAllComponents(
						query.entities,
						entity,
						query.componentTypes,
						dataStructure
					)
				} )
				
				return queryId
			},
			
			executeQuery: function( queryId ) {
				return this.queries[ queryId ].entities
			}
		}
		
		
		function getNextQueryId( self ) {
			var id = self.nextQueryId
			
			self.nextQueryId += 1
			
			return id
		}
		
		function addIfHasAllComponents(
			entityMap,
			entity,
			componentTypes,
			dataStructure
		) {
			if ( hasAllComponents( entity, componentTypes ) ) {
				map.add( entityMap, entity.id, entity, dataStructure )
			}
		}
		
		function hasAllComponents( entity, componentTypes ) {
			return _.all( componentTypes, function( componentType ) {
				return entity[ componentType ] !== undefined
			} )
		}
		
		
		return Entities
	}
)
;
define(
	"spell/shared/util/entities/datastructures/multiMap",
	[
		"underscore"
	],
	function(
		_
	) {
		"use strict"
		
		
		/**
		 * A multimap that uses an arbitrary property of an entity as its key.
		 * This data structure should be used, if you need to efficiently access groups of entities based on a specific
		 * property.
		 *
		 * Let's say, for example, that you have entities representing persons with a personalData component and want
		 * list those, grouping persons by their age.
		 *
		 * First, initialize the data structure for your specific use case:
		 * var ageMultiMap = multiMap( function( entity ) { return entity.personalData.age } )
		 *
		 * When the multi map is passed into your system later, you can access persons by their age:
		 * var arrayOfElevenYearOlds = entities[ 11 ]
		 *
		 * Attention: Changing the key property afterwards is not supported and will lead to unexpected results! A
		 * workaround for this is to remove the component from the entity and re-add it with the changed key property.
		 */
		
		return function( keyAccessor ) {
			return {
				onCreate: function( map ) {
					map.multiMap = {}
				},
				
				onAdd: function( map, key, entity ) {
					var entityKey = keyAccessor( entity )
					
					if ( !map.multiMap.hasOwnProperty( entityKey ) ) {
						map.multiMap[ entityKey ] = []
					}
					
					map.multiMap[ entityKey ].push( entity )
				},
				
				onUpdate: function( map, key, originalEntity, updatedEntity ) {
					this.onRemove( map, key, originalEntity )
					this.onAdd( map, key, updatedEntity )
				},
				
				onRemove: function( map, key, entityToRemove ) {
					var entityKey = keyAccessor( entityToRemove )

					if ( entityKey === undefined ) {
						_.each( map.multiMap, function( entities, theEntityKey ) {
							_.each( entities, function( entity ) {
								if ( entity === entityToRemove ) {
									entityKey = theEntityKey
								}
							} )
						} )
					}
					
					map.multiMap[ entityKey ] = map.multiMap[ entityKey ].filter( function( entityInMap ) {
						return entityInMap !== entityToRemove
					} )
					
					if ( map.multiMap[ entityKey ].length === 0 ) {
						delete map.multiMap[ entityKey ]
					}
				}
			}
		}
	}
)
;
define(
	'spell/shared/util/entities/datastructures/passIdMultiMap',
	[
		'spell/shared/util/entities/datastructures/multiMap'
	],
	function(
		multiMap
	) {
		'use strict'


		return multiMap(
			function( entity ) {
				return entity.renderData.pass
			}
		)
	}
)
;
define(
	'funkysnakes/client/zones/base',
	[
		"funkysnakes/client/systems/updateRenderData",
		'funkysnakes/client/systems/Renderer',

		'spell/shared/util/entities/Entities',
		'spell/shared/util/entities/datastructures/passIdMultiMap',
		'spell/shared/util/zones/ZoneEntityManager',
		'spell/shared/util/Events',

		'underscore'
	],
	function(
		updateRenderData,
		Renderer,

		Entities,
		passIdMultiMap,
		ZoneEntityManager,
		Events,

		_
	) {
		'use strict'


		/**
		 * private
		 */

		function updateTextures( renderingContext, resources, textures ) {
			// TODO: the resource loader should create spell texture object instances instead of raw html images

			// HACK: creating textures out of images
			_.each(
				resources,
				function( resource, resourceId ) {
					var extension =  _.last( resourceId.split( '.' ) )
					if( extension === 'png' || extension === 'jpg' ) {
						textures[ resourceId.replace(/images\//g, '') ] = renderingContext.createTexture( resource )
					}
				}
			)

			return textures
		}

		function update(
			globals,
			timeInMs,
			dtInS
		) {
		}

		function render(
			globals,
			timeInMs,
			deltaTimeInMs
		) {
			var entities = this.entities,
				queryIds = this.queryIds

			updateRenderData(
				entities.executeQuery( queryIds[ "updateRenderData" ][ 0 ] ).elements
			)

			this.renderer.process(
				timeInMs,
				deltaTimeInMs,
				entities.executeQuery( queryIds[ "render" ][ 0 ] ).multiMap,
				[]
			)
		}

		return {
			onCreate: function( globals, zoneConfig ) {
				var eventManager         = globals.eventManager,
					configurationManager = globals.configurationManager,
					statisticsManager    = globals.statisticsManager,
					resourceLoader       = globals.resourceLoader,
					zoneManager          = globals.zoneManager

				var entities  = new Entities()
				this.entities = entities

				var entityManager  = new ZoneEntityManager( globals.entityManager, this.entities )
				this.entityManager = entityManager

				this.renderer = new Renderer( eventManager, globals.textures, globals.renderingContext )


				this.queryIds = {
					render: [
						entities.prepareQuery( [ "position", "appearance", "renderData" ], passIdMultiMap )
					],
					updateRenderData: [
						entities.prepareQuery( [ "position", "renderData" ] )
					]
				}


				this.renderCallback = _.bind( render, this, globals )
				this.updateCallback = _.bind( update, this, globals )

				eventManager.subscribe( Events.RENDER_UPDATE, this.renderCallback )
				eventManager.subscribe( [ Events.LOGIC_UPDATE, '20' ], this.updateCallback )


				eventManager.subscribe(
					[ Events.RESOURCE_LOADING_COMPLETED, 'zoneResources' ],
					function() {
						updateTextures( globals.renderingContext, resourceLoader.getResources(), globals.textures )

						// create default entities from zone config
						_.each(
							zoneConfig.entities,
							function( entityConfig ) {
								entityManager.createEntity( entityConfig.blueprintId, entityConfig.config )
							}
						)
					}
				)

				var zoneResources = [
					'output/assets/textures/4.2.04_256.png',
					'output/assets/textures/ship_player4.png'
				]

				// trigger loading of zone resources
				resourceLoader.addResourceBundle( 'zoneResources', zoneResources )
				resourceLoader.start()
			},

			onDestroy: function( globals ) {
				var eventManager = globals.eventManager

				eventManager.unsubscribe( Events.RENDER_UPDATE, this.renderCallback )
				eventManager.unsubscribe( [ Events.LOGIC_UPDATE, '20' ], this.updateCallback )
			}
		}
	}
)
;
define(
	"spell/shared/util/Timer",
	[
		"spell/shared/util/Events",
		"spell/shared/util/platform/Types",

		"underscore"
	],
	function(
		Events,
		Types,

		_
	) {
		"use strict"


		/**
		 * private
		 */

//		var checkTimeWarp = function( newRemoteTime, updatedRemoteTime ) {
//			if( updatedRemoteTime > newRemoteTime ) return
//
//			var tmp = newRemoteTime - updatedRemoteTime
//			console.log( 'WARNING: clock reset into past by ' + tmp + ' ms' )
//		}


		/**
		 * public
		 */

		function Timer( eventManager, statisticsManager, initialTime ) {
			this.newRemoteTime        = initialTime
			this.remoteTime           = initialTime
			this.newRemoteTimPending  = false
			this.localTime            = initialTime
			this.previousSystemTime   = Types.Time.getCurrentInMs()
			this.elapsedTime          = 0
			this.deltaLocalRemoteTime = 0
			this.statisticsManager    = statisticsManager

			eventManager.subscribe(
				[ "clockSyncUpdate" ],
				_.bind(
					function( updatedRemoteTime ) {
//						checkTimeWarp( newRemoteTime, updatedRemoteTime )

						this.newRemoteTime = updatedRemoteTime
						this.newRemoteTimPending = true
					},
					this
				)
			)

			eventManager.subscribe(
				Events.CLOCK_SYNC_ESTABLISHED,
				_.bind(
					function( initialRemoteGameTimeInMs ) {
						this.newRemoteTime = this.remoteTime = this.localTime = initialRemoteGameTimeInMs
						this.newRemoteTimPending = false
					},
					this
				)
			)

			// setting up statistics
			statisticsManager.addSeries( 'remoteTime', '' )
			statisticsManager.addSeries( 'localTime', '' )
			statisticsManager.addSeries( 'deltaLocalRemoteTime', '' )
			statisticsManager.addSeries( 'relativeClockSkew', '' )
			statisticsManager.addSeries( 'newRemoteTimeTransfered', '' )
		}

		Timer.prototype = {
			update : function() {
				// TODO: think about incorporating the new value "softly" instead of directly replacing the old one
				if( this.newRemoteTimPending ) {
					this.remoteTime          = this.newRemoteTime
					this.newRemoteTimPending = false
				}

				// measuring time
				var systemTime            = Types.Time.getCurrentInMs()
				this.elapsedTime          = Math.max( systemTime - this.previousSystemTime, 0 ) // it must never be smaller than 0
				this.previousSystemTime   = systemTime

				this.localTime            += this.elapsedTime
				this.remoteTime           += this.elapsedTime
				this.deltaLocalRemoteTime = this.localTime - this.remoteTime

				// relative clock skew
				var factor = 1000000000
				this.relativeClockSkew = ( ( this.localTime / this.remoteTime * factor ) - factor ) * 2 + 1

				// updating statistics
				this.statisticsManager.updateSeries( 'remoteTime', this.remoteTime % 2000 )
				this.statisticsManager.updateSeries( 'localTime', this.localTime % 2000 )
				this.statisticsManager.updateSeries( 'deltaLocalRemoteTime', this.deltaLocalRemoteTime + 250 )
				this.statisticsManager.updateSeries( 'relativeClockSkew', this.relativeClockSkew )
			},
			getLocalTime : function() {
				return this.localTime
			},
			getElapsedTime : function() {
				return this.elapsedTime
			},
			getRemoteTime : function() {
				return this.remoteTime
			}//,
//			getDeltaLocalRemoteTime : function() {
//				return deltaRemoteLocalTime
//			},
//			getRelativeClockSkew : function() {
//				return relativeClockSkew
//			}
		}

		return Timer
	}
)
;
define(
	"funkysnakes/shared/util/createMainLoop",
	[
		"spell/shared/util/Events",
		"spell/shared/util/Timer",
		"spell/shared/util/platform/Types",
		"spell/shared/util/platform/PlatformKit",

		"underscore"
	],
	function(
		Events,
		Timer,
		Types,
		PlatformKit,

		_
	) {
		"use strict"


		var allowedDeltaInMs = 20


		return function(
			eventManager,
			statisticsManager
		) {
			// Until the proper remote game time is computed local time will have to do.
			var initialLocalGameTimeInMs = Types.Time.getCurrentInMs(),
				timer                    = new Timer( eventManager, statisticsManager, initialLocalGameTimeInMs ),
				localTimeInMs            = initialLocalGameTimeInMs

			// Since the main loop supports arbitrary update intervals but can't publish events for every possible
			// update interval, we need to maintain a set of all update intervals that subscribers are interested in.
			var updateIntervals = {}

			eventManager.subscribe(
				Events.SUBSCRIBE,
				function( scope, subscriber ) {
					if( scope[ 0 ] !== Events.LOGIC_UPDATE ) return

					var interval = scope[ 1 ]

					if( updateIntervals.hasOwnProperty( interval ) ) return

					updateIntervals[ interval ] = {
						accumulatedTimeInMs : 0,
						localTimeInMs       : localTimeInMs
					}
				}
			)

			var clockSpeedFactor, elapsedTimeInMs
			clockSpeedFactor = 1.0

			var mainLoop = function() {
				timer.update()
				localTimeInMs   = timer.getLocalTime()
				elapsedTimeInMs = timer.getElapsedTime()

				_.each(
					updateIntervals,
					function( updateInterval, deltaTimeInMsAsString ) {
						var deltaTimeInMs = parseInt( deltaTimeInMsAsString )

						updateInterval.accumulatedTimeInMs += elapsedTimeInMs * clockSpeedFactor

						while( updateInterval.accumulatedTimeInMs > deltaTimeInMs ) {
							// Only simulate, if not too much time has accumulated to prevent CPU overload. This can happen, if
							// the browser tab has been in the background for a while and requestAnimationFrame is used.
							if( updateInterval.accumulatedTimeInMs <= 5 * deltaTimeInMs ) {
								eventManager.publish(
									[ Events.LOGIC_UPDATE, deltaTimeInMsAsString ],
									[ updateInterval.localTimeInMs, deltaTimeInMs / 1000 ]
								)
							}

							updateInterval.accumulatedTimeInMs -= deltaTimeInMs
							updateInterval.localTimeInMs   += deltaTimeInMs
						}
					}
				)


				eventManager.publish( Events.RENDER_UPDATE, [ localTimeInMs, elapsedTimeInMs ] )


//				var localGameTimeDeltaInMs = timer.getRemoteTime() - localTimeInMs
//
//				if( Math.abs( localGameTimeDeltaInMs ) > allowedDeltaInMs ) {
//					if( localGameTimeDeltaInMs > 0 ) {
//						clockSpeedFactor = 1.25
//
//					} else {
//						clockSpeedFactor = 0.25
//					}
//
//				} else {
//					clockSpeedFactor = 1.0
//				}

				PlatformKit.callNextFrame( mainLoop )
			}

			return mainLoop
		}
	}
)
;
define(
	'spell/client/main',
	[
		'spell/shared/util/entities/EntityManager',
		'spell/shared/util/zones/ZoneManager',
		'spell/shared/util/blueprints/BlueprintManager',
		'spell/shared/util/ConfigurationManager',
		'spell/shared/util/EventManager',
		'spell/shared/util/InputManager',
		'spell/shared/util/ResourceLoader',
		'spell/shared/util/StatisticsManager',
		'spell/shared/util/Events',
		'spell/shared/util/Logger',
		'spell/shared/util/platform/PlatformKit',

		'funkysnakes/client/zones/base',
		'funkysnakes/shared/util/createMainLoop',

		'underscore'
	],
	function(
		EntityManager,
		ZoneManager,
		BlueprintManager,
		ConfigurationManager,
		EventManager,
		InputManager,
		ResourceLoader,
		StatisticsManager,
		Events,
		Logger,
		PlatformKit,

		baseZone,
		createMainLoop,

		_,

		runtimeModule
	) {
		'use strict'


		// return spell entry point
		var eventManager         = new EventManager()
		var configurationManager = new ConfigurationManager( eventManager )

		var renderingContext = PlatformKit.RenderingFactory.createContext2d(
			eventManager,
			1024,
			768,
			configurationManager.renderingBackEnd
		)

		var soundManager         = PlatformKit.createSoundManager()
		var inputManager         = new InputManager( configurationManager )
		var resourceLoader       = new ResourceLoader( soundManager, eventManager, configurationManager.resourceServer )
		var statisticsManager    = new StatisticsManager()

		statisticsManager.init()

		var globals = {
			configurationManager : configurationManager,
			eventManager         : eventManager,
			inputManager         : inputManager,
			inputEvents          : inputManager.getInputEvents(),
			renderingContext     : renderingContext,
			resourceLoader       : resourceLoader,
			statisticsManager    : statisticsManager,
			soundManager         : soundManager
		}


		// TODO: enter initial zone

		Logger.debug( 'client started' )

		var configurationManager = globals.configurationManager
		var resourceLoader       = globals.resourceLoader
		var eventManager         = globals.eventManager
		var statisticsManager    = globals.statisticsManager

//		PlatformKit.registerOnScreenResize( _.bind( onScreenResized, onScreenResized, eventManager ) )

		// creating entityManager
//		var componentConstructors = {
//			'markedForDestruction' : markedForDestruction,
//			'position'             : position,
//			'orientation'          : orientation,
//			'collisionCircle'      : collisionCircle,
//			'shield'               : shield,
//			'tailElement'          : tailElement,
//			'amountTailElements'   : amountTailElements
//		}

//		globals.entityManager = new EntityManager( entities, componentConstructors )


		var renderingContext       = globals.renderingContext
		var renderingContextConfig = renderingContext.getConfiguration()

		Logger.debug( 'created rendering context: type=' + renderingContextConfig.type + '; size=' + renderingContextConfig.width + 'x' + renderingContextConfig.height )


		// TODO: the resource loader should create spell texture object instances instead of raw html images

		// HACK: creating textures out of images
		var resources = resourceLoader.getResources()
		var textures = {}

		_.each(
			resources,
			function( resource, resourceId ) {
				var extension =  _.last( resourceId.split( '.' ) )
				if( extension === 'png' || extension === 'jpg' ) {
					textures[ resourceId.replace(/images\//g, '') ] = renderingContext.createTexture( resource )
				}
			}
		)


		var zones = {
			base: baseZone
		}

		var zoneManager = new ZoneManager( eventManager, zones, globals )

		var blueprintManager = new BlueprintManager()

		_.each(
			runtimeModule.componentBlueprints,
			function( componentBlueprint ) {
				blueprintManager.add( componentBlueprint )
			}
		)

		_.each(
			runtimeModule.entityBlueprints,
			function( entityBlueprint ) {
				blueprintManager.add( entityBlueprint )
			}
		)

		var entityManager = new EntityManager( blueprintManager )

		_.extend(
			globals,
			{
				configurationManager : configurationManager,
				entityManager        : entityManager,
				eventManager         : eventManager,
				textures             : textures,
				sounds               : resources,
				zoneManager          : zoneManager
			}
		)


		zoneManager.createZone(
			'base',
			_.find(
				runtimeModule.zones,
				function( iter ) {
					return iter.name === runtimeModule.startZone
				}
			)
		)


		var mainLoop = createMainLoop( eventManager, statisticsManager )

		PlatformKit.callNextFrame( mainLoop )
	}
)
;var spell = {
	setRuntimeModule : function( runtimeModule ) {
		this.runtimeModule = runtimeModule
	},
	start : function() {
		if( !this.runtimeModule ) throw 'Error: No runtime module provided. Make sure that the runtime module is included properly.'

		enterMain( 'spell/client/main', this.runtimeModule )
	}
}
