define(
	'spell/shared/util/platform/private/flurry',
	[
		'spell/shared/util/platform/private/environment/isHtml5Ejecta',
		'spell/shared/util/platform/private/environment/isHtml5GameClosure'
	],
	function(
		isHtml5Ejecta,
		isHtml5GameClosure
	) {
		'use strict'


		return {
			logEvent : function( eventName, timed ) {
				if( isHtml5Ejecta ) {
					ejecta.flurryLogEvent( eventName, timed )

				} else if( isHtml5GameClosure ) {
					NATIVE.flurry.logEvent( eventName )
				}
			},
			endTimedEvent : function( eventName ) {
				if( isHtml5Ejecta ) {
					ejecta.flurryEndTimedEvent( eventName )

				} else if( isHtml5GameClosure ) {
					NATIVE.flurry.endTimedEvent( eventName )
				}
			}
		}
	}
)
