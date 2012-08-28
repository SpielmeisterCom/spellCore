/**
 * This module acts as a static include list for modules that must be included in the engine library even though they are not used by the engine itself. This is
 * the case for certain math modules or similar modules which are useful for end users/developers.
 */

define(
	'spell/client/staticInclude',
	[
		'spell/client/2d/graphics/drawCoordinateGrid',
		'spell/math/mat2',
		'spell/math/mat3',
		'spell/math/mat4',
		'spell/math/quat4',
		'spell/math/util',
		'spell/math/vec2',
		'spell/math/vec3',
		'spell/math/vec4',
		'spell/math/random/XorShift32',
		'spell/shared/util/createEntityEach'
	],
	function() {
		return undefined
	}
)
