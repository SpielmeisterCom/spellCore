define(
	'spell/shared/util/platform/private/network/performHttpRequest',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		var createGetParameters = function( parameters ) {
			return '?' + _.map(
				parameters,
				function( value, key ) {
					return key + '=' + encodeURIComponent( value )
				}
			).join( '&' )
		}

		var createCorsRequest = function( method, url, onLoad, onError, parameters ) {
			var request = new XMLHttpRequest()

			if( method == 'GET' ) {
				url += createGetParameters( parameters )
			}

			if( 'withCredentials' in request ) {
				request.open( method, url, true )

			} else if( typeof XDomainRequest !== 'undefined' ) {
				request = new XDomainRequest()
				request.open( method, url )

			} else {
				return
			}

			request.onreadystatechange = function() {
				if( this.readyState == 4 &&
					this.status == 200 ) {

					onLoad( this.responseText )
				}
			}

			if( onError ) {
				request.onerror = function( event ) {
					onError( 'Error while accessing ' + url, event )
				}
			}

			return request
		}

		/**
		 * Performs a http request. The host specified in the url must allow CORS requests (html5 and flash). Otherwise
		 * an uncatchable error will be thrown.
		 *
		 * @param method
		 * @param url
		 * @param onLoad
		 * @param onError
		 * @param parameters
		 */
		var performHttpRequest = function( method, url, onLoad, onError, parameters ) {
			if( !url ) {
				throw 'url is undefined.'
			}

			if( !method ) {
				throw 'method is undefined.'
			}

			if( method !== 'GET' &&
				method !== 'POST' ) {

				throw 'The provided method is not supported.'
			}

			if( !onLoad ) {
				throw 'onLoad is undefined.'
			}

			var request = createCorsRequest( method, url, onLoad, onError, parameters )

			request.send( method === 'POST' ? parameters : null )
		}

		return performHttpRequest
	}
)
