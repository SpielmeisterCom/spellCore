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
			var metaTags = document.getElementsByTagName( 'meta' )

			for( var i = 0, n = metaTags.length, metaTag; i < n; i++ ) {
				metaTag = metaTags[ i ]

				if( metaTag.name === 'viewport' ) return metaTag
			}
		}

		var updateViewportMetaTag = function( initialScale, maximumScale ) {
			var viewportMetaTag = getViewportMetaTag()
			if( !viewportMetaTag ) return

			viewportMetaTag.setAttribute(
				'content',
				'width=device-width, user-scalable=0, initial-scale=' + initialScale + ', maximum-scale=' + maximumScale + ''
			)
		}

		var deviceClasses = [
			{
				userAgentKeywords : [ 'iPhone', 'iPod' ],
				initialScale : 0.5,
				maximumScale : 0.5
			},
			{
				userAgentKeywords : [ 'iPad' ],
				initialScale : 1.0,
				maximumScale : 1.0
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
		return function( eventManager, id, initialScreenSize ) {
			var processResize = function() {
				if( window.scrollTo ) {
					window.scrollTo( 0, 0 )
				}

				eventManager.publish(
					eventManager.EVENT.AVAILABLE_SCREEN_SIZE_CHANGED,
					[ id ? getAvailableScreenSize( id ) : initialScreenSize ]
				)
			}

			var processOrientationChange = function() {
				var orientation    = window.orientation,
					orienationMode = orientation === 0 ?
						'portrait' :
						orientation === -90 ?
							'landscapeRotatedRight' :
							'landscapeRotatedLeft'

				eventManager.publish(
					eventManager.EVENT.DEVICE_ORIENTATION_CHANGED,
					[ orienationMode ]
				)

				processResize()
			}

			var deviceClass = getDeviceClass( navigator.userAgent )

			if( deviceClass ) {
				updateViewportMetaTag( deviceClass.initialScale, deviceClass.maximumScale )
			}

			window.addEventListener( 'orientationchange', processOrientationChange, true )
			window.addEventListener( 'resize', processResize, true )

			processOrientationChange()
		}
	}
)
