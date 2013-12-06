define(
	'spell/shared/util/platform/private/advertisement',
	[
		'spell/shared/util/platform/private/environment/isHtml5Ejecta',
		'spell/shared/util/platform/private/environment/isHtml5GameClosure',
		'spell/shared/util/platform/private/registerTimer',
		'spell/functions'
	],
	function(
		isHtml5Ejecta,
		isHtml5GameClosure,
		registerTimer,
		_
	) {
		'use strict'


		var mutedState = false,
			isPaused   = false

		var processInterstitial = function( spell, event ) {
			if( event.isShown ) {
				if( isPaused ) return

				isPaused = true

				// delay pausing because the chartboost interstitial takes its time
				registerTimer(
					function() {
						mutedState = spell.audioContext.isAllMuted()

						if( !mutedState ) {
							console.log( 'spell.audioContext.setAllMuted( true )' )
							spell.audioContext.setAllMuted( true )
						}

						spell.mainLoop.pause()
					},
					100
				)

			} else {
				if( !isPaused ) return

				isPaused = false

				if( !mutedState ) {
					console.log( 'spell.audioContext.setAllMuted( false )' )
					spell.audioContext.setAllMuted( false )
				}

				spell.mainLoop.resume()
			}
		}

		return {
			init : function( spell, next ) {
				if( isHtml5GameClosure ) {
					NATIVE.events.registerHandler( 'interstitial', _.bind( processInterstitial, null, spell ) )
				}

				next()
			},
			loadInterstitial : function() {
				if( isHtml5Ejecta ) {
					ejecta.loadInterstitial()

				} else if( isHtml5GameClosure ) {
					NATIVE.plugins.sendEvent( 'AdMobPlugin', 'loadInterstitial', JSON.stringify( {} ) )
				}
			},
			showInterstitial : function() {
				if( isHtml5Ejecta ) {
					ejecta.showInterstitial()

				} else if( isHtml5GameClosure ) {
					NATIVE.plugins.sendEvent( 'AdMobPlugin', 'showInterstitial', JSON.stringify( {} ) )
				}
			}
		}
	}
)
