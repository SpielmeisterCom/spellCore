define(
	'spell/shared/util/platform/private/graphics/initViewport',
	[
		'spell/Events',
		'spell/shared/util/platform/private/getAvailableScreenSize',

		'spell/functions'
	],
	function(
		Events,
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
		return function( eventManager, id ) {

			alert( navigator.userAgent )

			var performScreenResize = function() {
				window.scrollTo( 0, 0 )
				eventManager.publish( Events.AVAILABLE_SCREEN_SIZE_CHANGED, [ getAvailableScreenSize( id ) ] )
			}

			var deviceClass = getDeviceClass( navigator.userAgent )

			if( deviceClass ) {
				updateViewportMetaTag( deviceClass.initialScale, deviceClass.maximumScale )
			}

			window.addEventListener( 'resize', performScreenResize, true )
			window.addEventListener( 'orientationchange', performScreenResize, true )

			performScreenResize()
		}
	}
)
