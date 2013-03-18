/**
 * This module acts as a static include list for modules that must be included in the engine library even though they are not used by the engine itself. This is
 * the case for certain math modules or similar modules which are useful for end users/developers.
 */

define(
	'spell/client/staticInclude',
	[
		'spell/client/2d/graphics/drawShape',
		'spell/client/2d/graphics/physics/drawBox',
		'spell/client/2d/graphics/physics/drawCircle',
		'spell/client/2d/graphics/physics/drawPoint',
		'spell/client/2d/graphics/physics/drawOrigin',
		'spell/client/2d/graphics/drawCoordinateGrid',
		'spell/client/2d/graphics/drawTitleSafeOutline',
		'spell/data/spatial/QuadTree',
		'spell/math/mat2',
		'spell/math/mat3',
		'spell/math/mat4',
		'spell/math/quat4',
		'spell/math/util',
		'spell/math/vec2',
		'spell/math/vec3',
		'spell/math/vec4',
		'spell/math/random/XorShift32',
		'spell/math/random/UUID',
		'spell/shared/Easing',
		'spell/shared/util/createEntityEach',
		'spell/shared/util/input/keyCodes',
		'spell/shared/util/translate',
		'spell/client/util/createComprisedRectangle',
		'spell/client/util/createIncludedRectangle',
		'spell/recursiveFunctions',
		'spell/stringUtil'
	],
	function() {
		return undefined
	}
)
