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
