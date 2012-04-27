define(
	"spell/client/main",
	[
		"spell/shared/util/ConfigurationManager",
		"spell/shared/util/EventManager",
		"spell/shared/util/InputManager",
		"spell/shared/util/ResourceLoader",
		"spell/shared/util/StatisticsManager",
		"spell/shared/util/Events",
		"spell/shared/util/platform/PlatformKit"
	],
	function(
		ConfigurationManager,
		EventManager,
		InputManager,
		ResourceLoader,
		StatisticsManager,
		Events,
		PlatformKit
	) {
		"use strict"


		// return spell entry point
		return function( clientMain ) {
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

			clientMain( globals )
		}
	}
)
