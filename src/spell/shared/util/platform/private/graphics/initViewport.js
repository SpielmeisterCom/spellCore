define(
	'spell/shared/util/platform/private/graphics/initViewport',
	[
		'spell/shared/util/platform/private/getAvailableScreenSize',

		'spell/functions'
	],
	function(
		getAvailableScreenSize,

		_
	) {
        'use strict'


		var getViewportMetaTag = function() {
			if(!document || !document.getElementsByTagName) {
				return
			}

			var metaTags = document.getElementsByTagName( 'meta' )

			for( var i = 0, n = metaTags.length, metaTag; i < n; i++ ) {
				metaTag = metaTags[ i ]

				if( metaTag.name === 'viewport' ) return metaTag
			}
		}

		var updateViewportMetaTag = function( metaViewPortSetting ) {
			var viewportMetaTag = getViewportMetaTag()
			if( !viewportMetaTag ) return

			viewportMetaTag.setAttribute(
				'content',
                metaViewPortSetting
			)
		}

		var deviceClasses = [
			{
				userAgentKeywords : [ 'iPhone', 'iPod', 'Tizen' ],
                metaViewPortSetting: 'width=device-width, user-scalable=0, minimum-scale=1.0, initial-scale=0.5, maximum-scale=0.5, minimal-ui'
			},
			{
				userAgentKeywords : [ 'iPad' ],
                metaViewPortSetting: 'width=device-width, user-scalable=0, minimum-scale=1.0, initial-scale=1.0, maximum-scale=1.0, minimal-ui'
			},
			{
				userAgentKeywords : [ 'Android' ],
                //do no use user-scalable=0 on android, because it triggers the "tap freeze" bug
                metaViewPortSetting: 'width=device-width, initial-scale=1, maximum-scale=1.01'
			}
		]

		var getDeviceClass = function( userAgent ) {
			return _.find(
				deviceClasses,
				function( deviceClass ) {
					return _.any(
						deviceClass.userAgentKeywords,
						function( keyword ) {
							return userAgent.match( new RegExp( keyword, 'i' ) )
						}
					)
				}
			)
		}

		/**
		 * Initializes the browser viewport
		 *
		 * @param eventManager the event manager
		 * @param id the id of the spell container div
		 */
		return function( eventManager, id ) {
            var IS_ANDROID = /Android/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
                ORIENTATION_CHANGE_PENDING = 0


			var processResize = function() {
                if(ORIENTATION_CHANGE_PENDING) {
                    return
                }

                if( window.scrollTo ) {
                    window.scrollTo(0, IS_ANDROID ? 1 : 0)
                }

                window.setTimeout(function() {
                    eventManager.publish(
                        eventManager.EVENT.AVAILABLE_SCREEN_SIZE_CHANGED,
                        [ getAvailableScreenSize( id ) ]
                    )
                }, 250)
			}

			var processOrientationChange = function() {
                window.setTimeout( function() {
                    var orientation    = window.orientation,
                        orienationMode = orientation === 0 ?
                            'portrait' :
                                orientation === -90 ?
                            'landscapeRotatedRight' :
                            'landscapeRotatedLeft'

                    ORIENTATION_CHANGE_PENDING = 1

                    var deviceClass = getDeviceClass( navigator.userAgent )
                    if( deviceClass ) {
                        updateViewportMetaTag( deviceClass.metaViewPortSetting )
                    }

                    window.setTimeout( function() {
                        eventManager.publish(
                            eventManager.EVENT.DEVICE_ORIENTATION_CHANGED,
                            [ orienationMode ]
                        )

                        ORIENTATION_CHANGE_PENDING = 0
                        processResize()
                    }, 500)

                }, 500)
			}

			var deviceClass = getDeviceClass( navigator.userAgent )

			if( deviceClass ) {
				updateViewportMetaTag( deviceClass.metaViewPortSetting )
			}

			window.addEventListener( 'orientationchange', processOrientationChange, true )
			window.addEventListener( 'resize', processResize, true )

			processOrientationChange()
		}
	}
)
