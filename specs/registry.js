
define(
	function() {
		var registry = {
			"specs/unit/spell/components/base/debugSpec.js":                                       { "type": "unit", "platform": "common" },
			"specs/unit/spell/components/base/orientationSpec.js":                                 { "type": "unit", "platform": "common" },
			"specs/unit/spell/components/base/positionSpec.js":                                    { "type": "unit", "platform": "common" },
			"specs/unit/spell/components/base/speedSpec.js":                                       { "type": "unit", "platform": "common" },
			"specs/unit/spell/components/collision/collisionRectangleSpec.js":                     { "type": "unit", "platform": "common" },
			"specs/unit/spell/components/rendering/appearanceSpec.js":                             { "type": "unit", "platform": "common" },
			"specs/unit/spell/core/componentSpec.js":                                              { "type": "unit", "platform": "common" },
			"specs/unit/spell/core/EntitiesSpec.js":                                               { "type": "unit", "platform": "common" },
			"specs/unit/spell/core/EntitySpec.js":                                                 { "type": "unit", "platform": "common" },
			"specs/unit/spell/core/EntityCreatorSpec.js":                                          { "type": "unit", "platform": "common" },
			"specs/unit/spell/core/MainLoopSpec.js":                                               { "type": "unit", "platform": "common" },
			"specs/unit/spell/core/MainLoopDefinitionLanguageSpec.js":                             { "type": "unit", "platform": "common" },
			"specs/unit/spell/core/ManifestSpec.js":                                               { "type": "unit", "platform": "common" },
			"specs/unit/spell/core/prepareQueriesSpec.js":                                         { "type": "unit", "platform": "common" },
			"specs/unit/spell/systems/browser/rendering/RendererSpec.js":                          { "type": "unit", "platform": "common" },
			"specs/unit/spell/util/browser/rendering/defineAnimationsSpec.js":                     { "type": "unit", "platform": "common" },
			"specs/unit/spell/util/browser/rendering/defineImagesSpec.js":                         { "type": "unit", "platform": "common" },
			"specs/unit/spell/util/common/ArrayLikeSpec.js":                                       { "type": "unit", "platform": "common" },
			"specs/unit/spell/util/common/ContinuousAxisAlignedRectangleCollisionDetectorSpec.js": { "type": "unit", "platform": "common" },
			"specs/unit/spell/util/common/dialectSpec.js":                                         { "type": "unit", "platform": "common" },
			"specs/unit/spell/util/common/MapSpec.js":                                             { "type": "unit", "platform": "common" },
			"specs/unit/spell/util/common/SortedArraySpec.js":                                     { "type": "unit", "platform": "common" },
			"specs/unit/spell/util/common/UniformGridSpec.js":                                     { "type": "unit", "platform": "common" },
			"specs/unit/spell/util/common/VectorSpec.js":                                          { "type": "unit", "platform": "common" },
			
			"specs/integration/spell/core/MainLoopExecutorSpec.js":                      { "type": "integration", "platform": "common"  },
			"specs/integration/spell/util/browser/rendering/loadImagesAndPassToSpec.js": { "type": "integration", "platform": "browser" },
			"specs/integration/spell/util/node/returnFilesInDirectorySpec.js":           { "type": "integration", "platform": "node" },
			
			"specs/acceptance/spell/common/InitializationSpec.js":                 { "type": "acceptance", "platform": "common"},
			"specs/acceptance/spell/common/MainLoopDefinitionAndExecutionSpec.js": { "type": "acceptance", "platform": "common"}
		}
		
		return registry
	}
)
