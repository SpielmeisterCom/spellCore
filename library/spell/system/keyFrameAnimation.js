/**
 * Emits the following events on events to EventHandlers
 *
 * animationStart
 * The animationstart event occurs at the start of the animation.
 *
 * animationEnd
 * The animationend event occurs when the animation finishes.
 *
 * animationiteration
 * The animationiteration event occurs at the end of each iteration of an animation,
 * except when an animationend event would fire at the same time.
 * This means that this event does not occur for animations with an iteration count of one or less.
 *
 */
define(
	'spell/system/keyFrameAnimation',
	[
		'spell/shared/Easing',
		'spell/math/util',
		'spell/math/vec2',

		'spell/functions'
	],
	function(
		Easing,
		mathUtil,
		vec2,

		_
	) {
		'use strict'


		var clamp        = mathUtil.clamp,
			isInInterval = mathUtil.isInInterval,
			modulo       = mathUtil.modulo

		var getKeyFrameIdA = function( keyFrames, offset ) {
			for( var i = 0, numKeyFrames = keyFrames.length; i < numKeyFrames; i++ ) {
				if( keyFrames[ i ].time > offset ) {
					return i - 1
				}
			}
		}

		var getEasingFunction = function( name ) {
			if( !name ) name = 'Linear'

			var fn = Easing[ name ]

			if( !fn ) {
				throw 'Error: Unkown easing function \'' + name + '\'.'
			}

			return fn
		}

		var createOffset = function( deltaTimeInMs, animationLengthInMs, offsetInMs, replaySpeed, reversed ) {
			return Math.round( offsetInMs + deltaTimeInMs * replaySpeed * ( reversed ? -1 : 1 ) )
		}

		var normalizeOffset = function( animationLengthInMs, offsetInMs, looped ) {
			return looped ?
				modulo( offsetInMs, animationLengthInMs ) :
				clamp( offsetInMs, 0, animationLengthInMs )
		}

		var updatePlaying = function( animationLengthInMs, offsetInMs, looped ) {
			return looped ?
				true :
				isInInterval( offsetInMs, 0, animationLengthInMs )
		}

		var setValue = function( component, attributeId, value ) {
			var attribute = component[ attributeId ]

			if( _.isArray( attribute ) ) {
				vec2.set( value, attribute )

			} else {
				component[ attributeId ] = value
			}
		}

		var lerp = function( a, b, t ) {
			return a + ( b - a ) * t
		}

		var process = function( spell, timeInMs, deltaTimeInMs ) {
			var entityManager      = this.entityManager,
				keyFrameAnimations = this.keyFrameAnimations

			for( var id in keyFrameAnimations ) {
				var keyFrameAnimation      = keyFrameAnimations[ id ],
					keyFrameAnimationAsset = keyFrameAnimation.asset,
					animate                = keyFrameAnimationAsset.animate,
					lengthInMs             = keyFrameAnimationAsset.length

				if( !keyFrameAnimation.playing ) continue

				var rawOffset = createOffset(
					deltaTimeInMs,
					lengthInMs,
					keyFrameAnimation.offset,
					keyFrameAnimation.replaySpeed,
					keyFrameAnimation.reversed
				)

				var offset = normalizeOffset( lengthInMs, rawOffset, keyFrameAnimation.looped )
				keyFrameAnimation.offset  = offset
				keyFrameAnimation.playing = updatePlaying( lengthInMs, rawOffset, keyFrameAnimation.looped )

				for( var componentId in animate ) {
					var componentAnimation = animate[ componentId ],
						component          = entityManager.getComponentById( id, componentId )

					if( !component ) {
						throw 'Error: Unable to access component \'' + componentId + '\' of entity \'' + id + '\'.'
					}

					for( var attributeId in componentAnimation ) {
						var attributeAnimation = componentAnimation[ attributeId ],
							keyFrames          = attributeAnimation.keyFrames,
							keyFrameIdA        = getKeyFrameIdA( keyFrames, offset )

						if( keyFrameIdA < 0 ) {
							// set to first key frame value
							setValue( component, attributeId, keyFrames[ 0 ].value )

							continue
						}

						if( keyFrameIdA === undefined ) {
							// set to last key frame value
							setValue( component, attributeId, keyFrames[ keyFrames.length - 1 ].value )

							continue
						}

						var keyFrameIdB = keyFrameIdA + 1,
							keyFrameA   = keyFrames[ keyFrameIdA ],
							keyFrameB   = keyFrames[ keyFrameIdB ]

						// interpolate between key frame A and B
						var attribute       = component[ attributeId ],
							attributeOffset = offset - keyFrameA.time,
							easingFunction  = getEasingFunction( keyFrameB.interpolation ),
							t               = easingFunction( attributeOffset / ( keyFrameB.time - keyFrameA.time ) )

						if( _.isArray( attribute ) ) {
							vec2.lerp( keyFrameA.value, keyFrameB.value, t, attribute )

						} else {
							component[ attributeId ] = lerp( keyFrameA.value, keyFrameB.value, t )
						}
					}
				}

				if( keyFrameAnimation.playing === false ) {
					entityManager.triggerEvent( id, 'animationEnd', [ 'keyFrameAnimation', keyFrameAnimation ] )
				}

				entityManager.updateWorldTransform( id )
			}
		}

		var KeyFrameAnimation = function( spell ) {
			this.entityManager = spell.entityManager
		}

		KeyFrameAnimation.prototype = {
			init : function() {},
			destroy : function() {},
			activate : function() {},
			deactivate : function() {},
			process : process
		}

		return KeyFrameAnimation
	}
)
