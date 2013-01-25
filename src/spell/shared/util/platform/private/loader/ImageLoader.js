define(
	'spell/shared/util/platform/private/loader/ImageLoader',
	[
		'spell/Events',

		'spell/functions'
	],
	function(
		Events,

		_
	) {
		'use strict'


		/*
		 * private
		 */

		var free = function( image ) {
			image.onload = null
			image.onreadystatechange = null
			image.onerror = null
		}

		var onLoad = function( image ) {
			if( this.loaded === true ) return
			this.loaded = true

			free( image )
			this.onLoadCallback( this.renderingContext.createTexture( image ) )
		}

		var onError = function( image, event ) {
			free( image )
			this.onErrorCallback( event )
		}

		var onReadyStateChange = function( image ) {
			if( image.readyState === 'complete' ) {
				image.onload( image )
			}
		}


		/*
		 * public
		 */

		var ImageLoader = function( renderingContext, resourcePath, resourceName, onLoadCallback, onErrorCallback, onTimedOutCallback ) {
			this.renderingContext = renderingContext
			this.resourcePath     = resourcePath
			this.resourceName     = resourceName
			this.onLoadCallback   = onLoadCallback
			this.onErrorCallback  = onErrorCallback
			this.loaded           = false
		}

		ImageLoader.prototype = {
			start : function() {
				var image = new Image()

				image.onload             = _.bind( onLoad, this, image )
				image.onreadystatechange = _.bind( onReadyStateChange, this, image )
				image.onerror            = _.bind( onError, this, image )
				image.src                = this.resourcePath + '/' + this.resourceName
			}
		}

		return ImageLoader
	}
)
