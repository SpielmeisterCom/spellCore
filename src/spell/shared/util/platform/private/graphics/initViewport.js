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

		var updateViewportMetaTag = function( initialScale, maximumScale, width ) {
			var viewportMetaTag = getViewportMetaTag()
			if( !viewportMetaTag ) return

			viewportMetaTag.setAttribute(
				'content',
				'width=' + width + ', user-scalable=0, initial-scale=' + initialScale + ', maximum-scale=' + maximumScale + ''
			)
		}

		var deviceClasses = [
			{
				userAgentKeywords : [ 'iPhone', 'iPod', 'Tizen' ],
				initialScale : 0.5,
				maximumScale : 0.5,
				getWidth: function() { return 'device-width' }
			},
			{
				userAgentKeywords : [ 'iPad' ],
				initialScale : 1.0,
				maximumScale : 1.0,
				getWidth: function() { return 'device-width' }
			},
			{
				userAgentKeywords : [ 'Android' ],
				initialScale : 1.0,
				maximumScale : 1.0,
				getWidth: function() { return window.innerWidth }
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
			var processResize = function() {
				if( window.scrollTo ) {
					window.scrollTo( 0, 0 )
				}

				eventManager.publish(
					eventManager.EVENT.AVAILABLE_SCREEN_SIZE_CHANGED,
					[ getAvailableScreenSize( id ) ]
				)
			}

			var processOrientationChange = function() {
				var orientation    = window.orientation,
					orienationMode = orientation === 0 ?
						'portrait' :
						orientation === -90 ?
							'landscapeRotatedRight' :
							'landscapeRotatedLeft'

				window.setTimeout(function() {
					var deviceClass = getDeviceClass( navigator.userAgent )

					if( deviceClass ) {
						updateViewportMetaTag( deviceClass.initialScale, deviceClass.maximumScale, deviceClass.getWidth() )
					}

					window.setTimeout( function() {
						eventManager.publish(
							eventManager.EVENT.DEVICE_ORIENTATION_CHANGED,
							[ orienationMode ]
						)

						processResize()
					}, 500)

				}, 500)

			}

			var deviceClass = getDeviceClass( navigator.userAgent )

			if( deviceClass ) {
				updateViewportMetaTag( deviceClass.initialScale, deviceClass.maximumScale, deviceClass.getWidth() )
			}

			window.addEventListener( 'orientationchange', processOrientationChange, true )
			window.addEventListener( 'resize', processResize, true )

			processOrientationChange()
		}
	}
)
