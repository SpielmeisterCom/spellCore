/**
 * See http://www.w3.org/TR/page-visibility/ for details.
 *
 * enum VisibilityState { "hidden", "visible", "prerender", "unloaded" };
 *
 * partial interface Document {
 *  readonly attribute boolean hidden;
 *  readonly attribute VisibilityState visibilityState;
 * };
 */

define(
	'spell/shared/util/platform/private/environment/visibilityChangeHandler',
	[
		'spell/functions'
	],
	function(
		_
		) {
		'use strict'

		var hidden, state, visibilityChange

		if( typeof document.hidden !== 'undefined' ) {

			hidden = 'hidden'
			visibilityChange = 'visibilitychange'
			state = 'visibilityState'

		} else if( typeof document.mozHidden !== 'undefined' ) {

			hidden = 'mozHidden'
			visibilityChange = 'mozvisibilitychange'
			state = 'mozVisibilityState'

		} else if( typeof document.msHidden !== 'undefined' ) {

			hidden = 'msHidden'
			visibilityChange = 'msvisibilitychange'
			state = 'msVisibilityState'

		} else if( typeof document.webkitHidden !== 'undefined' ) {

			hidden = 'webkitHidden'
			visibilityChange = 'webkitvisibilitychange'
			state = 'webkitVisibilityState'
		}


		var handleVisibilityChange = function( eventManager ) {

			var visibilityState = document[ state ],
				isVisible       = ( visibilityState == 'VISIBLE' || visibilityState == 'visible' )

			eventManager.publish(
				eventManager.EVENT.VISIBILITY_CHANGED,
				isVisible
			)
		}

		return {
			registerListener : function( eventManager ) {

				var listener = _.bind( handleVisibilityChange, this, eventManager )

				document.addEventListener( visibilityChange, listener )
			},
			removeListener : function( ) {
			}
		}
	}
)
