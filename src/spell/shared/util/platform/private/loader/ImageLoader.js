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

			this.onLoadCallback( image )
		}

		var onError = function( event ) {
			this.onErrorCallback( event )
		}

		var onReadyStateChange = function( image ) {
			if( image.readyState === "complete" ) {
				image.onload( image )
			}
		}


		/*
		 * public
		 */

		var ImageLoader = function( resourcePath, resourceName, onLoadCallback, onErrorCallback, onTimedOutCallback ) {
			this.resourcePath       = resourcePath
			this.resourceName       = resourceName
			this.onLoadCallback     = onLoadCallback
			this.onErrorCallback    = onErrorCallback
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
