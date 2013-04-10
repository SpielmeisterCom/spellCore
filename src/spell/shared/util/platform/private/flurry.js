define(
	'spell/shared/util/platform/private/flurry',
	[
		'spell/shared/util/platform/private/isHtml5Ejecta'
	],
	function(
		isHtml5Ejecta
	) {
		'use strict'


		return {
			logEvent : function( eventName, timed ) {
				if( isHtml5Ejecta ) {
					ejecta.flurryLogEvent( eventName, timed )
				}
			},
			endTimedEvent : function( eventName ) {
				if( isHtml5Ejecta ) {
					ejecta.flurryEndTimedEvent( eventName )
				}
			}
		}
	}
)
