define(
	'spell/shared/build/printLicenceInfo',
	[
		'spell/shared/build/hasValidLicence',

		'fs',
		'spell-licence'
	],
	function(
		hasValidLicence,

		fs,
		licence
	) {
		'use strict'


		var createStatus = function( publicKey, licenceData ) {
			return hasValidLicence( publicKey, licenceData ) ? 'valid' : 'invalid'
		}

		return function( isDevEnv, humanReadable, publicKey, licenceData, next ) {
			var payload = licence.createPayload( licenceData ),
				status  = createStatus( publicKey, licenceData )

			if( humanReadable ) {
				console.log(
					'user name: ' + payload.uid + '\n' +
					'licence id: ' + payload.lid + '\n' +
					'product id: ' + payload.pid + '\n' +
					'issue date: ' + payload.isd + '\n' +
					'validity period: ' + payload.days + '\n' +
					'status: ' + status
				)

			} else {
				var result = {
					status : status,
					payload : licence.createPayload( licenceData )
				}

				console.log( JSON.stringify( result ) )
			}

			next()
		}
	}
)
