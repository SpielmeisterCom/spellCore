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
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		var nativeHandler

		var nativeHandlerImpl = function( callback, event ) {
			event.preventDefault()

			callback( {
				type : 'deviceOrientation',
				alpha : event.alpha,
				beta : event.beta,
				gamma : event.gamma
			} )
		}

		return {
			registerListener : function( el, callback ) {
				nativeHandler = _.bind( nativeHandlerImpl, this, callback )

				el.addEventListener( 'deviceorientation', nativeHandler, true )
			},
			removeListener : function( el ) {
				if( !nativeHandler ) return

				el.removeEventLister( 'deviceorientation', nativeHandler )

				nativeHandler = undefined
			}
		}
	}
)
