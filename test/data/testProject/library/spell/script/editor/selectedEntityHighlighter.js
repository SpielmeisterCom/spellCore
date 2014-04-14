define("spell/script/editor/selectedEntityHighlighter",
	[
		'spell/math/vec2',
		'spell/math/mat3',
		'spell/functions'
	],
	function(
		vec2,
		mat3,
		_
		) {
		"use strict";

		var RECTANGLE_COMPONENT_ID = 'spell.component.2d.graphics.shape.rectangle'

		var entityHighlighter = function(spell, editorSystem) {
		}

		entityHighlighter.prototype = {
			process: function( spell, editorSystem, timeInMs, deltaTimeInMs) {
				return
				var entityManager       = spell.entityManager,
					selectedEntityId    = editorSystem.selectedEntity


				if( selectedEntityId ) {

					var rectangleConfig = {
						'lineColor': [1, 0, 0],
						'lineWidth': 3
					}

					if( !entityManager.hasComponent( selectedEntityId, RECTANGLE_COMPONENT_ID) ) {

						entityManager.addComponent( selectedEntityId, RECTANGLE_COMPONENT_ID, rectangleConfig)

					} else {
						entityManager.updateComponent( selectedEntityId, RECTANGLE_COMPONENT_ID, rectangleConfig)
					}
				}
			}
		}

		return entityHighlighter


	})