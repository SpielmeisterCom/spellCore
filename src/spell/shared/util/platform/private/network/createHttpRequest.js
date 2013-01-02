define(
	'spell/shared/util/platform/private/network/createHttpRequest',
	function() {
		'use strict'


		function createCorsRequest( method, url ) {
			var request = new XMLHttpRequest()

			if( 'withCredentials' in request ) {
				request.open( method, url, true )

			} else if( typeof XDomainRequest !== 'undefined' ) {
				request = new XDomainRequest()
				request.open( method, url )

			} else {
				request = null
			}

			return request
		}

		return function( url, type, onLoad, onError, parameters ) {
			if( !url ) {
				throw '"url" is undefined.'
			}

			if( type !== 'get' ) {
				throw '"type" is undefined.'
			}

			if( type !== 'get' ) {
				throw 'The provided type is not supported.'
			}

			if( !onLoad ) {
				throw '"onLoad" is undefined.'
			}

			var request = createCorsRequest( 'get', url )

			request.onreadystatechange = function() {
				if( this.readyState == 4 &&
					this.status == 200 ) {

					onLoad( this.responseText )
				}
			}

			request.send( null )
		}
	}
)
