define(
	'spell/server/util/connect/extDirect',
	[
		'spell/server/util/connect/createExtDirectBackEnd'
	],
	function(
		createExtDirectBackEnd
	) {
		'use strict'


		/**
		 * Returns a middleware module for the connect webserver that handles extDirect requests
		 */
		return function( remotingUrl, remotingNamespace, remotingActions ) {
			var extDirectBackEnd = createExtDirectBackEnd( remotingUrl, remotingNamespace, remotingActions )

			return function( req, res, next ) {
				if( req.url === '/router/' ) {
					extDirectBackEnd.router( req, res, next )

				} else if( req.url === '/api' ) {
					extDirectBackEnd.get_api( req, res )

				} else {
					next()
				}
			}
		}
	}
)
