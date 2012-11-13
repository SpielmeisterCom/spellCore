/**
 * @class spell.system.globalTransformUpdater
 * @singleton
 */

define(
	'spell/system/globalTransformUpdater',
	[
		'spell/math/util',
		'spell/math/vec2',
		'spell/math/mat3',
		'spell/functions'
	],
	function(
		mathUtil,
		vec2,
		mat3,
		_
		) {
		'use strict'

		var transformToMatrix = function( transformComponent ) {
			var scale       = transformComponent.scale,
				translation = transformComponent.translation,
				rotationInDegrees = transformComponent.rotation * 180 / Math.PI,

				resultMatrix = mat3.create( [

					//1. column
					scale[ 0 ] * Math.cos( rotationInDegrees ),
					scale[ 1 ] * Math.sin( rotationInDegrees ),
					0,

					//2. column
					scale[ 0 ] * -1 * Math.sin( rotationInDegrees ),
					scale[ 1 ] * Math.cos( rotationInDegrees ),
					0,

					//3.column
					translation[ 0 ],
					translation[ 1 ],
					1
				])

			return resultMatrix
		}

		var matrixToTransform = function( matrix3x3 ) {
			var transform = {},
				scaleX = mathUtil.sign( matrix3x3[ 0 ] ) * Math.sqrt((matrix3x3[ 0 ] * matrix3x3[ 0 ]) + (matrix3x3[ 3 ] * matrix3x3[ 3 ])),
				scaleY = mathUtil.sign( matrix3x3[ 4 ] ) * Math.sqrt((matrix3x3[ 1 ] * matrix3x3[ 1 ]) + (matrix3x3[ 4 ] * matrix3x3[ 4 ]))

			transform.translation   = [ matrix3x3[ 6 ], matrix3x3[ 7 ] ]
			transform.scale         = [ scaleX, scaleY ]
			transform.rotation      = Math.acos( matrix3x3[ 0 ] / scaleX )

			//http://math.stackexchange.com/questions/13150/extracting-rotation-scale-values-from-2d-transformation-matrix
			//sign = Math.atan(-c / a);

			return transform
		}

		var updateGlobalTransforms = function( entityId ) {
			var defaultMatrix = mat3.create()
			mat3.identity( defaultMatrix )

			for ( var entityId in this.roots ) {
				updateGlobalTransform.call( this, defaultMatrix, entityId )
			}
		}

		var updateGlobalTransform = function ( parentMatrix3x3, entityId ) {
			var transform           = this.transforms[ entityId ],
				children            = this.children[ entityId ],
				matrix              = mat3.identity(),
				globalTransform


			if ( transform ) {
				matrix              = transformToMatrix( transform )
				mat3.multiply( parentMatrix3x3, matrix, matrix )

				globalTransform             = matrixToTransform( matrix )
				transform.globalTranslation = globalTransform.translation
				transform.globalScale       = globalTransform.scale
				transform.globalRotation    = globalTransform.rotation
			} else {
				matrix              = parentMatrix3x3
			}

			//update all childs recursively
			if ( children ) {
				for ( var childEntityIndex in children.ids ) {
					updateGlobalTransform.call( this, matrix, children.ids[ childEntityIndex ] )
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
