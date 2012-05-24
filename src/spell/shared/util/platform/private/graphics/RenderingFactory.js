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
		 * @param id - the id of the dom node the engine instance is placed in
		 * @param width - width in pixels
		 * @param height - height in pixels
		 * @param requestedBackEnd - when supplied, overrides the automagic rendering back-end detection
		 */
		var createContext2d = function( eventManager, id, width, height, requestedBackEnd ) {
			var canvas = createCanvasNode( id, width, height )

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
