define(
	'spell/shared/util/platform/private/graphics/createCanvasNode',
	function() {
		return function( id, width, height ) {
            var canvas

            if ( window && window.canvas ) {
                //if a global canvas element was specified, use this (for Ejecta/CocoonJS style environments)
                canvas = window.canvas
            } else {
                canvas = document.createElement( 'canvas' )
            }

            canvas.id           = id + '-screen'
            canvas.width        = width
            canvas.height       = height
            canvas.className    += 'spell-canvas'

			if( id ) {
				var container = document.getElementById( id )
				if( !container ) throw 'Could not find a container with the id ' + id + ' in the DOM tree.'

				container.appendChild( canvas )

			} else {
				document.body.appendChild( canvas )
			}

			return canvas
		}
	}
)
