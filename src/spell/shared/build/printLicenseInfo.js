define(
	'spell/shared/build/printLicenseInfo',
	[
		'spell/shared/build/hasValidLicense',

		'fs',
		'spell-license'
	],
	function(
		hasValidLicense,

		fs,
		license
	) {
		'use strict'


		var createStatus = function( publicKey, licenseData ) {
			return hasValidLicense( publicKey, licenseData ) ? 'valid' : 'invalid'
		}

		return function( isDevEnv, humanReadable, publicKey, licenseData, next ) {
			var payload = license.createPayload( licenseData )

			if( !payload ) {
				next( 'Error: License is corrupted.' )
			}

			var status = createStatus( publicKey, licenseData )

			if( humanReadable ) {
				console.log(
					'user name: ' + payload.uid + '\n' +
					'license id: ' + payload.lid + '\n' +
					'product id: ' + payload.pid + '\n' +
					'issue date: ' + payload.isd + '\n' +
					'validity period: ' + payload.days + '\n' +
					'status: ' + status
				)

			} else {
				var result = {
					status : status,
					payload : payload
				}

				console.log( JSON.stringify( result ) )
			}

			next()
		}
	}
)
