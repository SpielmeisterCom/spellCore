define(
	"spell/shared/util/platform/private/graphics/createCanvasNode",
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
