define(
	"spell/shared/util/platform/private/loader/ImageLoader",
	[
		"spell/shared/util/Events",

		"underscore"
	],
	function(
		Events,

		_
	) {
		"use strict"


		/**
		 * private
		 */

		var onLoad = function( image ) {
			if( this.loaded === true ) return

			this.loaded = true

			var resources = {}
			resources[ this.resourceUri ] = image

			this.onCompleteCallback( resources )
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


		/**
		 * public
		 */

		var ImageLoader = function( eventManager, host, resourceBundleName, resourceUri, loadingCompletedCallback, timedOutCallback ) {
			this.eventManager       = eventManager
			this.host               = host
			this.resourceBundleName = resourceBundleName
			this.resourceUri        = resourceUri
			this.onCompleteCallback = loadingCompletedCallback
			this.loaded             = false
		}

		ImageLoader.prototype = {
			start: function() {
				var url = this.host + "/" + this.resourceUri

				var image = new Image()
				image.onload             = _.bind( onLoad, this, image )
				image.onreadystatechange = _.bind( onReadyStateChange, this, image )
				image.onerror            = _.bind( onError, this )
				image.src                = url
			}
		}

		return ImageLoader
	}
)
