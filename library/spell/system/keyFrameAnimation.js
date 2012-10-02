define(
	'spell/system/keyFrameAnimation',
	[
		'spell/shared/Easing',
		'spell/math/vec2',

		'spell/functions'
	],
	function(
		Easing,
		vec2,

		_
	) {
		'use strict'


		var getKeyFrameIdA = function( keyFrames, offset ) {
			for( var i = 0, numKeyFrames = keyFrames.length; i < numKeyFrames; i++ ) {
				if( keyFrames[ i ].time > offset ) {
					return i - 1
				}
			}
		}

		var getEasingFunction = function( name ) {
			if( !name ) name = 'LinearInOut'

			var fn = Easing[ name ]

			if( !fn ) {
				throw 'Error: Unkown easing function \'' + name + '\'.'
			}

			return fn
		}

		var updateOffset = function( deltaTimeInMs, animationLengthInMs, offsetInMs, replaySpeed, looped ) {
			var newOffsetInMs = Math.round( offsetInMs + deltaTimeInMs * replaySpeed )

			if( !looped &&
				newOffsetInMs > animationLengthInMs ) {

				return animationLengthInMs
			}

			return newOffsetInMs % animationLengthInMs
		}

		var lerp = function( a, b, t ) {
			return a + ( b - a ) * t
		}

		var init = function( spell ) {}

		var cleanUp = function( spell ) {}

		var process = function( spell, timeInMs, deltaTimeInMs ) {
			var entityManager      = this.entityManager,
				keyFrameAnimations = this.keyFrameAnimations

			for( var id in keyFrameAnimations ) {
				var keyFrameAnimation      = keyFrameAnimations[ id ],
					offset                 = keyFrameAnimation.offset,
					keyFrameAnimationAsset = keyFrameAnimation.asset,
					animate                = keyFrameAnimationAsset.animate,
					length                 = keyFrameAnimationAsset.length

				if( !keyFrameAnimation.looped &&
					offset === length ) {

					continue
				}

				for( var componentId in animate ) {
					var componentAnimation = animate[ componentId ],
						component          = entityManager.getComponentById( componentId, id )

					if( !component ) {
						throw 'Error: Unable to access component \'' + componentId + '\' of entity \'' + id + '\'.'
					}

					for( var attributeId in componentAnimation ) {
						var attributeAnimation = componentAnimation[ attributeId ],
							keyFrames          = attributeAnimation.keyFrames,
							animationLength    = attributeAnimation.length,
							keyFrameIdA        = getKeyFrameIdA( keyFrames, offset )

						if( keyFrameIdA < 0 ) continue

						var keyFrameIdB = keyFrameIdA + 1,
							keyFrameA   = keyFrames[ keyFrameIdA ],
							keyFrameB   = keyFrames[ keyFrameIdB ]

						if( !keyFrameB ) continue

						var attribute       = component[ attributeId ],
							attributeOffset = offset - keyFrameA.time,
							easingFunction  = getEasingFunction( keyFrameB.interpolation ),
							t               = easingFunction( attributeOffset / ( keyFrameB.time - keyFrameA.time ) )

						if( attribute.length ) {
							vec2.lerp( keyFrameA.value, keyFrameB.value, t, attribute )

						} else {
							component[ attributeId ] = lerp( keyFrameA.value, keyFrameB.value, t )
						}
					}
				}

				keyFrameAnimation.offset = updateOffset(
					deltaTimeInMs,
					keyFrameAnimationAsset.length,
					offset,
					keyFrameAnimation.replaySpeed,
					keyFrameAnimation.looped
				)
			}
		}

		var KeyFrameAnimation = function( spell ) {
			this.entityManager = spell.EntityManager
		}

		KeyFrameAnimation.prototype = {
			cleanUp : cleanUp,
			init    : init,
			process : process
		}

		return KeyFrameAnimation
	}
)
