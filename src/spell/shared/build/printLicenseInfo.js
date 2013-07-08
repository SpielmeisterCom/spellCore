define(
	'spell/shared/build/printLicenseInfo',
	[
		'spell/cli/Products',
		'spell/shared/build/hasValidLicense',

		'fs',
		'spell-license'
	],
	function(
		Products,
		hasValidLicense,

		fs,
		license
	) {
		'use strict'


		var createStatus = function( publicKey, licenseData ) {
			return hasValidLicense( publicKey, licenseData ) ? 'valid' : 'invalid'
		}

		var createFeatureList = function( features ) {
			return _.map(
				features,
				function( feature ) {
					return feature.name + ': ' + ( feature.included ? 'yes' : 'no' )
				}

			). join( ', ' )
		}

		return function( isDevEnv, humanReadable, publicKey, licenseData, next ) {
			var payload = license.createPayload( licenseData )

			if( !payload ) {
				next( 'Error: License is corrupted.' )
			}

			var status = createStatus( publicKey, licenseData )

			var product = Products[ payload.pid ]

			if( !product ) {
				next( 'Error: Unknown product id "' + payload.pid + '". License might be corrupted.' )
			}

			if( humanReadable ) {
				console.log(
					'user name: ' + payload.uid + '\n' +
					'license id: ' + payload.lid + '\n' +
					'product id: ' + payload.pid + '\n' +
					'    ' + createFeatureList( product.features ) + '\n' +
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
