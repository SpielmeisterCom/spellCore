define(
	"spell/shared/util/platform/private/callNextFrame",
	[
		"spell/shared/util/platform/private/registerTimer"
	],
	function(
		registerTimer
	) {
		"use strict";


		// running in node context
		if( typeof window === "undefined" ) {
			return function( callback ) {
				registerTimer( callback, 5 )
			}
		}


		// running in browser
		var browserCallback = (
			window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame
		)

		var hasBrowserSupport = !!browserCallback

		if( hasBrowserSupport ) {
			return function( callback ) {
				browserCallback.call( window, callback )
			}
		}


		// no browser support
		return function( callback ) {
			registerTimer(
				function() {
					callback( new Date() )
				},
				1000 / 60 // 60 Hz
			)
		}
	}
)
