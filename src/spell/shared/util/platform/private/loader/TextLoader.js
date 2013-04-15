define(
	'spell/shared/util/platform/private/loader/TextLoader',
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

		var onLoad = function( request ) {
			if( this.loaded === true ) return

			this.loaded = true

			var response = request.response || request.responseText

			if( request.status !== 200 ) {
				onError.call( this, response )

				return
			}

			this.onLoadCallback( this.postProcess ? this.postProcess( response ) : response )
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

		var TextLoader = function( postProcess, libraryUrl, libraryPath, onLoadCallback, onErrorCallback ) {
			this.postProcess     = postProcess
			this.libraryUrl      = libraryUrl
			this.libraryPath     = libraryPath
			this.onLoadCallback  = onLoadCallback
			this.onErrorCallback = onErrorCallback
			this.loaded          = false
		}

		TextLoader.prototype = {
			start : function() {
				var url     = this.libraryUrl ? this.libraryUrl + '/' + this.libraryPath : this.libraryPath,
					request = new XMLHttpRequest()

				request.onload             = _.bind( onLoad, this, request )
				request.onreadystatechange = _.bind( onReadyStateChange, this, request )
				request.onerror            = _.bind( onError, this )

				request.open( 'GET', url, true )
				request.send()
			}
		}

		return TextLoader
	}
)
