define(
	'funkysnakes/client/mainBlueprintTest',
	[
		'spell/shared/util/blueprints/BlueprintManager'
	],
	function(
		BlueprintManager
	) {
		'use strict'


		var blueprintManager = new BlueprintManager()

		var spaceshipEntityBlueprint = {
			"type" : "entityBlueprint",
			"namespace" : "projectName/entities",
			"name" : "spacecraft",
			"components" : [
				{
					"id" : "spelljs/core/position",
					"config" : {
						"value" : [ 1, 2, 3 ]
					}
				},
				{
					"id" : "myProject/position",
					"importName" : "otherPosition",
					"config" : {
						"value" : [ 10, 10, 10 ]
					}
				},
				{
					"id" : "spelljs/collision/axisAlignedBoundingBox",
					"config" : {
						"width" : 5.0,
						"height" : 12.5
					}
				},
				{
					"id" : "spelljs/core/graphics/appearance",
					"config" : {
						"textureId" : "projectName/textures/spacecraft_shiny_new",
						"rotation" : 0.32,
						"scale" : [ 1.25, 1.25 ],
						"translation" : [ 16, -16 ],
						"size" : [ 1, 1 ]
					}
				}
			]
		}

		var positionComponentBlueprint = {
			"type" : "componentBlueprint",
			"namespace" : "spelljs/core",
			"name" : "position",
			"attributes" : [
				{
					"name" : "value",
					"type" : "vec3",
					"default" : [ 0, 0, 0 ]
				}
			]
		}

		var otherPositionComponentBlueprint = {
			"type" : "componentBlueprint",
			"namespace" : "myProject",
			"name" : "position",
			"attributes" : [
				{
					"name" : "value",
					"type" : "vec3",
					"default" : [ 0, 0, 0 ]
				}
			]
		}

		var axisAlignedBoundingBoxComponentBlueprint = {
			"type" : "componentBlueprint",
			"namespace" : "spelljs/collision",
			"name" : "axisAlignedBoundingBox",
			"attributes" : [
				{
					"name" : "width",
					"type" : "Number",
					"default" : 1.0
				},
				{
					"name" : "height",
					"type" : "Number",
					"default" : 1.0
				}
			],
			"scriptId" : "interpolate/axisAlignedBoundingBox"
		}

		var appearanceComponentBlueprint = {
			"type" : "componentBlueprint",
			"namespace" : "spelljs/core/graphics",
			"name" : "appearance",
			"attributes" : [
				{
					"name" : "textureId",
					"type" : "AssetTextureId",
					"default" : "spelljs/textures/not_defined"
				},
				{
					"name" : "rotation",
					"type" : "Number",
					"default" : 0
				},
				{
					"name" : "scale",
					"type" : "vec2",
					"default" : [ 1, 1 ]
				},
				{
					"name" : "translation",
					"type" : "vec2",
					"default" : [ 0, 0 ]
				}
			]
		}


		blueprintManager.add( positionComponentBlueprint )
		blueprintManager.add( otherPositionComponentBlueprint )
		blueprintManager.add( axisAlignedBoundingBoxComponentBlueprint )
		blueprintManager.add( appearanceComponentBlueprint )
		blueprintManager.add( spaceshipEntityBlueprint )

		var entity1 = blueprintManager.createEntity(
			'projectName/entities/spacecraft',
			{
				axisAlignedBoundingBox : {
					width : 1
				},
				position : [ 100, 0, 0 ]
			}
		)

		var entity2 = blueprintManager.createEntity(
			'projectName/entities/spacecraft',
			{
				position : [ 200, 0, 0 ]
			}
		)

		console.log( entity1 )
		console.log( entity2 )
	}
)
