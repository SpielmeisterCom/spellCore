/**
 * @class spell.system.globalTransformUpdater
 * @singleton
 */

define(
	'spell/system/globalTransformUpdater',
	[
		'spell/math/vec2',
		'spell/functions'
	],
	function(
		vec2,
		_
		) {
		'use strict'


		var updateGlobalTransforms = function( entityId ) {

			var defaultTransform = 	{
				'translation':  [ 0, 0 ],
				'scale':        [ 1,1 ],
				'rotation':     0
			}

			for ( var entityId in this.roots ) {
				updateGlobalTransform.call( this, defaultTransform, entityId )
			}

		}

		var updateGlobalTransform = function ( parentTransform, entityId ) {
			var transform           = this.transforms[ entityId ],
				children            = this.children[ entityId ],
				tmpVec              = vec2.create()

			/*
see http://www.cs.uic.edu/~jbell/CourseNotes/ComputerGraphics/2DTransforms.html
			 http://gamedev.stackexchange.com/questions/25567/transform-coordinates-from-3d-to-2d-without-matrix-or-built-in-methods
			 */

			vec2.set( parentTransform.translation, tmpVec )
			vec2.add( tmpVec, transform.translation )

			//this is a stub for the moment
			vec2.set( tmpVec, transform.globalTranslation )
			vec2.set( transform.scale, transform.globalScale )
			vec2.set( transform.rotation, transform.globalRotation )

			//update all childs recursively
			if ( children ) {
				for ( var childEntityId in children.list ) {
					updateGlobalTransform( transform, childEntityId )
				}
			}

		}

		/**
		 * Creates an instance of the system.
		 *
		 * @constructor
		 * @param {Object} [spell] The spell object.
		 */
		var globalTransformUpdater = function( spell ) {

		}

		globalTransformUpdater.prototype = {
			/**
			 * Gets called when the system is created.
			 *
			 * @param {Object} [spell] The spell object.
			 */
			init: function( spell ) {

			},

			/**
			 * Gets called when the system is destroyed.
			 *
			 * @param {Object} [spell] The spell object.
			 */
			destroy: function( spell ) {

			},

			/**
			 * Gets called when the system is activated.
			 *
			 * @param {Object} [spell] The spell object.
			 */
			activate: function( spell ) {

			},

			/**
			 * Gets called when the system is deactivated.
			 *
			 * @param {Object} [spell] The spell object.
			 */
			deactivate: function( spell ) {

			},

			/**
			 * Gets called to trigger the processing of game state.
			 *
			 * @param {Object} [spell] The spell object.
			 * @param {Object} [timeInMs] The current time in ms.
			 * @param {Object} [deltaTimeInMs] The elapsed time in ms.
			 */
			process: function( spell, timeInMs, deltaTimeInMs ) {

				updateGlobalTransforms.call( this )

			}
		}

		return globalTransformUpdater
	}
)
