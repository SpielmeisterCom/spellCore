/**
 * See http://www.w3.org/TR/orientation-event/#deviceorientation for details.
 *
 * interface DeviceOrientationEvent : Event {
 *    readonly attribute double? alpha;
 *    readonly attribute double? beta;
 *    readonly attribute double? gamma;
 *    readonly attribute boolean absolute;
 *
 *    void initDeviceOrientationEvent(in DOMString type,
 *       in boolean bubbles,
 *       in boolean cancelable,
 *       in double? alpha,
 *       in double? beta,
 *       in double? gamma,
 *       in boolean absolute
 *    );
 * }
 *
 * interface DeviceAcceleration {
 *    readonly attribute double? x;
 *    readonly attribute double? y;
 *    readonly attribute double? z;
 * }
 *
 *interface DeviceRotationRate {
 *    readonly attribute double? alpha;
 *    readonly attribute double? beta;
 *    readonly attribute double? gamma;
 *}
 *
 *interface DeviceMotionEvent : Event {
 *    readonly attribute DeviceAcceleration? acceleration;
 *    readonly attribute DeviceAcceleration? accelerationIncludingGravity;
 *    readonly attribute DeviceRotationRate? rotationRate;
 *    readonly attribute double? interval;
 *
 *    void initAccelerometerEvent(
 *        in DOMString type,
 *        in boolean bubbles,
 *        in boolean cancelable,
 *        in DeviceAcceleration? acceleration,
 *        in DeviceAcceleration? accelerationIncludingGravity,
 *        in DeviceRotationRate? rotationRate,
 *        in double? interval
 *    );
 *}
 */

define(
	'spell/shared/util/platform/private/input/deviceOrientationHandler',
	[
		'spell/functions',
		'spell/shared/util/platform/private/environment/isHtml5TeaLeaf',
		'spell/shared/util/platform/private/environment/isHtml5Tizen'
	],
	function(
		_,
		isHtml5TeaLeaf,
		isHtml5Tizen
	) {
		'use strict'


		var TO_DEGREE_FACTOR = 180 / Math.PI

		var nativeHandler

		var DeviceOrientationEvent = function( alpha, beta, gamma ) {
			this.type = 'deviceOrientation'
			this.alpha = alpha
			this.beta = beta
			this.gamma = gamma
		}

		var nativeHandlerImpl = function( callback, event ) {
			event.preventDefault()

			callback( new DeviceOrientationEvent( event.alpha, event.beta, event.gamma ) )
		}

		return {
			registerListener : function( el, callback ) {
				if( isHtml5TeaLeaf ) {
					nativeHandler = function( event ) {
						callback( new DeviceOrientationEvent(
							event.alpha * TO_DEGREE_FACTOR,
							event.beta * TO_DEGREE_FACTOR,
							event.gamma * TO_DEGREE_FACTOR
						) )
					}

					NATIVE.events.registerHandler( 'deviceorientation', nativeHandler )

				} else if( isHtml5Tizen ) {
					nativeHandler = function( event ) {
						callback( new DeviceOrientationEvent( event.alpha, event.beta, -event.gamma ) )
					}

					el.addEventListener( 'deviceorientation', nativeHandler, true )

				} else {
					nativeHandler = _.bind( nativeHandlerImpl, this, callback )

					el.addEventListener( 'deviceorientation', nativeHandler, true )
				}
			},
			removeListener : function( el ) {
				if( !nativeHandler ) return

				if( isHtml5TeaLeaf ) {
					NATIVE.events.unregisterHandler( 'deviceorientation', nativeHandler )

				} else {
					el.removeEventListener( 'deviceorientation', nativeHandler, true )
				}

				nativeHandler = undefined
			}
		}
	}
)
