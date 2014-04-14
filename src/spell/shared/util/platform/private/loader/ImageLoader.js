define(
	'spell/shared/util/platform/private/loader/ImageLoader',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'

		// free internal handlers
		var free = function( image ) {
			image.onload  = null
			image.onerror = null
		}

		var onError = function( image, callback, event ) {
			free( image )

			callback(
				'ImageLoader> Could not load image ' + image.src,
				null
			)
		}

		var onLoad = function( image, callback ) {
			free( image )

			callback(
				null,
				this.renderingContext.createTexture( image )
			)
		}

		var ImageLoader = function( renderingContext ) {
			this.renderingContext = renderingContext
		}

		ImageLoader.prototype = {
			load : function( url, callback ) {
				var image = new Image()

				image.onload = _.bind(
					onLoad,
					this,
					image,
					callback
				)

				image.onerror = _.bind(
					onError,
					this,
					image,
					callback
				)

				image.src = url
			}
		}

		return ImageLoader
	}
)
