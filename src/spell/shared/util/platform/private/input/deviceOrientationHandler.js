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
		'spell/shared/util/platform/private/isHtml5GameClosure'
	],
	function(
		_,
		isHtml5GameClosure
	) {
		'use strict'


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
				if( isHtml5GameClosure ) {
					nativeHandler = function( event ) {
						callback( new DeviceOrientationEvent( event.alpha, event.beta, event.gamma ) )
					}

					NATIVE.events.registerHandler( 'deviceorientation', nativeHandler )

				} else {
					nativeHandler = _.bind( nativeHandlerImpl, this, callback )

					el.addEventListener( 'deviceorientation', nativeHandler, true )
				}
			},
			removeListener : function( el ) {
				if( !nativeHandler ) return

				if( isHtml5GameClosure ) {
					NATIVE.events.unregisterHandler( 'deviceorientation', nativeHandler )

				} else {
					el.removeEventListener( 'deviceorientation', nativeHandler, true )
				}

				nativeHandler = undefined
			}
		}
	}
)
