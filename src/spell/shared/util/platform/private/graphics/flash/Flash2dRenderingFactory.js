define(
	"spell/shared/util/platform/private/graphics/flash/Flash2dRenderingFactory",
	function() {

		var createCanvasContext = function() {
			throw "Creating a 2d flash renderer is not valid in this context"
		}

		var renderingFactory = {
			createContext2d : createCanvasContext
		}


		return renderingFactory
	}
)
