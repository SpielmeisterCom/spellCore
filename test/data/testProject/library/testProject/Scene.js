define(
	'testProject/Scene',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		return {
			/**
			 * This function is executed after the entites contained in the scene configuration have been created. All initialization functionality specific to
			 * the scene should be placed here.
			 *
			 * @param spell
			 * @param sceneConfig
			 */
			init : function( spell, sceneConfig ) {},

			/**
			 * This function is executed before all entities are destroyed. Scene specific clean up should be performed here.
			 *
			 * @param spell
			 * @param sceneConfig
			 */
			destroy : function( spell, sceneConfig ) {}
		}
	}
)
