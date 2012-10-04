define(
	'spell/shared/util/platform/private/graphics/createCanvasNode',
	function() {
		return function( id, width, height ) {
			var container = document.getElementById( id )

			if( !container ) throw 'Could not find a container with the id ' + id + ' in the DOM tree.'


			var canvas = document.createElement( 'canvas' )
				canvas.id     = id + '-screen'
				canvas.width  = width
				canvas.height = height
				canvas.className += 'spell-canvas'

			container.appendChild( canvas )

			return canvas
		}
	}
)
