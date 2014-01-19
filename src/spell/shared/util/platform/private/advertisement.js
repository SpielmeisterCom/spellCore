define(
	'spell/shared/util/platform/private/advertisement',
	[
		'spell/shared/util/platform/private/environment/isHtml5Ejecta',
		'spell/shared/util/platform/private/environment/isHtml5TeaLeaf',
		'spell/shared/util/platform/private/registerTimer',
		'spell/functions'
	],
	function(
		isHtml5Ejecta,
		isHtml5TeaLeaf,
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
						spell.audioContext.pauseContext()
						spell.mainLoop.pause()
					},
					100
				)

			} else {
				if( !isPaused ) return

				isPaused = false

				spell.audioContext.resumeContext()
				spell.mainLoop.resume()
			}
		}

		return {
			init : function( spell, next ) {
				var processInterstitialPartial = _.bind( processInterstitial, null, spell )

				if( isHtml5Ejecta ) {
					document.addEventListener( 'interstitial', processInterstitialPartial )

				} else if( isHtml5TeaLeaf ) {
					NATIVE.events.registerHandler( 'interstitial', processInterstitialPartial )
				}

				next()
			},
			loadInterstitial : function() {
				if( isHtml5Ejecta ) {
					//ejecta.loadInterstitial()

				} else if( isHtml5TeaLeaf ) {
					NATIVE.plugins.sendEvent( 'AdMobPlugin', 'loadInterstitial', JSON.stringify( {} ) )
				}
			},
			showInterstitial : function() {
				if( isHtml5Ejecta ) {
					//ejecta.showInterstitial()

				} else if( isHtml5TeaLeaf ) {
					NATIVE.plugins.sendEvent( 'AdMobPlugin', 'showInterstitial', JSON.stringify( {} ) )
				}
			}
		}
	}
)
