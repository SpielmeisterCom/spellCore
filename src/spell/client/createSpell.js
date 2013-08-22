define(
	'spell/client/createSpell',
    [
		'spell/math/mat2',
		'spell/math/mat2d',
		'spell/math/mat3',
		'spell/math/mat4',
		'spell/math/quat',
		'spell/math/util',
		'spell/math/vec2',
		'spell/math/vec3',
		'spell/math/vec4',
		'spell/random/XorShift32'
    ],
	function(
		mat2,
		mat2d,
		mat3,
		mat4,
		quat,
		util,
		vec2,
		vec3,
		vec4,
		XorShift32
    ) {
		'use strict'


		return function() {
			return {
				math : {
					random : {
						XorShift32 : XorShift32
					},
					mat2 : mat2,
					mat2d : mat2d,
					mat3 : mat3,
					mat4 : mat4,
					quat : quat,
					vec2 : vec2,
					vec3 : vec3,
					vec4 : vec4
				}
			}
		}
	}
)
