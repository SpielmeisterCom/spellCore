define(
	"spell/shared/util/platform/private/loader/ImageLoader",
	[
		"spell/shared/util/Events",

		'spell/functions'
	],
	function(
		Events,

		_
	) {
		"use strict"


		/*
		 * private
		 */

		var onLoad = function( image ) {
			if( this.loaded === true ) return

			this.loaded = true

			this.onCompleteCallback( image )
		}

		var onError = function( event ) {
			this.eventManager.publish(
				[ Events.RESOURCE_ERROR, this.resourceBundleName ],
				[ this.resourceBundleName, event ]
			)
		}

		var onReadyStateChange = function( image ) {
			if( image.readyState === "complete" ) {
				image.onload( image )
			}
		}


		/*
		 * public
		 */

		var ImageLoader = function( eventManager, resourcePath, resourceBundleName, resourceName, loadingCompletedCallback, timedOutCallback, renderingContext ) {
			this.eventManager       = eventManager
			this.renderingContext   = renderingContext
			this.resourceBundleName = resourceBundleName
			this.resourcePath       = resourcePath
			this.resourceName       = resourceName
			this.onCompleteCallback = loadingCompletedCallback
			this.loaded             = false
		}

		ImageLoader.prototype = {
			start: function() {
				var image = new Image()
				image.onload             = _.bind( onLoad, this, image )
				image.onreadystatechange = _.bind( onReadyStateChange, this, image )
				image.onerror            = _.bind( onError, this )
				image.src                = this.resourcePath + '/' + this.resourceName
			}
		}

		return ImageLoader
	}
)
