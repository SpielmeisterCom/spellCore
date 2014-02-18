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

		var lerp = function( a, b, t ) {
			return a + ( b - a ) * t
		}

		var process = function( spell, timeInMs, deltaTimeInMs ) {
			var entityManager      = this.entityManager,
				keyFrameAnimations = this.keyFrameAnimations,
				worldPassEntities  = spell.visibilityManager.worldPassEntities || [],
				uiPassEntities  = spell.visibilityManager.uiPassEntitiesMap || {}

			for( var id in keyFrameAnimations ) {
				var keyFrameAnimation = keyFrameAnimations[ id ]

				if( !keyFrameAnimation.playing ) continue

				var keyFrameAnimationAsset = keyFrameAnimation.asset,
					animate                = keyFrameAnimationAsset.animate,
					lengthInMs             = keyFrameAnimationAsset.length

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

				var currentlyVisible = (uiPassEntities[ id ])
				if(!currentlyVisible) {
					for (var i= 0, n = worldPassEntities.length; i<n; i++) {
						if (worldPassEntities[ i ][ 'id' ] == id) {
							currentlyVisible = true
							break;
						}
					}
				}
				if( !currentlyVisible ) {
					// HACK: If an entity is not visible do not bother updating its components. This will inevitable lead
					// to visual artifacts when the bound of the entity is smaller than the space covered by the key
					// frame animation. As the time of this writing this is not the case. The real solution is to
					// compute the bounds of entities properly.
					continue
				}

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
							entityManager.updateComponentAttribute( id, componentId, attributeId, keyFrames[ 0 ].value )

							continue
						}

						if( keyFrameIdA === undefined ) {
							// set to last key frame value
							entityManager.updateComponentAttribute( id, componentId, attributeId, keyFrames[ keyFrames.length - 1 ].value )

							continue
						}

						var keyFrameIdB = keyFrameIdA + 1,
							keyFrameA   = keyFrames[ keyFrameIdA ],
							keyFrameB   = keyFrames[ keyFrameIdB ]

						// interpolate between key frame A and B
						var attributeOffset = offset - keyFrameA.time,
							easingFunction  = getEasingFunction( keyFrameB.interpolation ),
							t               = easingFunction( attributeOffset / ( keyFrameB.time - keyFrameA.time ) )

						if( _.isArray( component[ attributeId ] ) ) {
							entityManager.updateComponentAttribute(
								id,
								componentId,
								attributeId,
								vec2.lerp( component[ attributeId ], keyFrameA.value, keyFrameB.value, t )
							)

						} else {
							entityManager.updateComponentAttribute(
								id,
								componentId,
								attributeId,
								lerp( keyFrameA.value, keyFrameB.value, t )
							)
						}
					}
				}

				if( keyFrameAnimation.playing === false ) {
					entityManager.triggerEvent( id, 'animationEnd', [ 'keyFrameAnimation', keyFrameAnimation ] )
				}
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
