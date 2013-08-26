define(
	'spell/shared/util/platform/private/loader/ImageLoader',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


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


		var ImageLoader = function( renderingContext, url, onLoadCallback, onErrorCallback, onTimedOutCallback ) {
			this.renderingContext = renderingContext
			this.url              = url
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
				image.src                = this.url
			}
		}

		return ImageLoader
	}
)
