define(
	'spell/shared/util/platform/private/network/performHttpRequest',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		var createParameters = function( parameters ) {
			return _.map(
				parameters,
				function( value, key ) {
					return key + '=' + encodeURIComponent( value )
				}

			).join( '&' )
		}

		var createRequest = function() {
			return typeof XDomainRequest === 'undefined' ? new XMLHttpRequest() : new XDomainRequest()
		}

		var createCorsRequest = function( method, url, data, onLoad, onError ) {
			var request = createRequest()

			if( onLoad ) {
				request.onreadystatechange = function() {
					var status = this.status

					if( this.readyState == 4 &&
						status == 200 ) {

						onLoad( this.responseText )

					} else if( status != 0 &&
						status != 200 ) {

						onError( 'Request failed with http status ' + status + '.' )
					}
				}
			}

			if( _.size( data ) > 0 &&
				method == 'GET' ) {

				url += '?' + createParameters( data )
			}

			if( onError ) {
				request.onerror = function( event ) {
					onError( 'Error while accessing ' + url + '.' )
				}
			}

			request.open( method, url, true )

			return request
		}

		/**
		 * Performs a http request. The host specified in the url must allow CORS requests (html5 and flash). Otherwise
		 * an uncatchable error will be thrown.
		 *
		 * @param method
		 * @param url
		 * @param data
		 * @param onLoad
		 * @param onError
		 */
		var performHttpRequest = function( method, url, data, onLoad, onError ) {
			if( !method ) {
				throw 'method is undefined.'
			}

			if( method !== 'GET' &&
				method !== 'POST' ) {

				throw 'The provided method is not supported.'
			}

			if( !url ) {
				throw 'url is undefined.'
			}

			var request = createCorsRequest( method, url, data, onLoad, onError )

			if( method === 'POST' ) {
				if( request.setRequestHeader ) {
					request.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' )
				}

				request.send( createParameters( data ) )

			} else {
				request.send()
			}
		}

		return performHttpRequest
	}
)
