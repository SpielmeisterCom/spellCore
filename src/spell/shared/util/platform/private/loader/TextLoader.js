define(
	'spell/shared/util/platform/private/loader/TextLoader',
	[
		'spell/shared/util/Events',

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

		var onLoad = function( request ) {
			if( this.loaded === true ) return

			this.loaded = true

			var response = request.response || request.responseText

			if( request.status !== 200 ) {
				onError.call( this, response )

				return
			}

			this.onLoadCallback( response )
		}

		var onError = function( event ) {
			this.onErrorCallback( event )
		}

		var onReadyStateChange = function( request ) {
			/*
			 * readyState === 4 means 'DONE'; see https://developer.mozilla.org/en/DOM/XMLHttpRequest
			 */
			if( request.readyState !== 4 ) return

			onLoad.call( this, request )
		}


		/*
		 * public
		 */

		var TextLoader = function( resourcePath, resourceName, onLoadCallback, onErrorCallback ) {
			this.resourcePath    = resourcePath
			this.resourceName    = resourceName
			this.onLoadCallback  = onLoadCallback
			this.onErrorCallback = onErrorCallback
			this.loaded          = false
		}

		TextLoader.prototype = {
			start: function() {
				var url = this.resourcePath + '/' + this.resourceName

				var request = new XMLHttpRequest()
				request.onload             = _.bind( onLoad, this, request )
				request.onreadystatechange = _.bind( onReadyStateChange, this, request )
				request.onerror            = _.bind( onError, this )
				request.open( 'GET', url, true )
				request.send( null )
			}
		}

		return TextLoader
	}
)
