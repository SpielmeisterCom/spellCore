define(
	'spell/shared/build/printLicenceInfo',
	[
		'spell-licence',

		'fs',
		'spell/functions'
	],
	function(
		licence,

		fs,
		_
	) {
		'use strict'


		return function( isDevEnv, humanReadable, licenceFilePath, licenceDataBase64, next ) {
			var licenceData = ''

			if( licenceDataBase64 ) {
				licenceData = new Buffer( licenceDataBase64, 'base64' ).toString()

			} else {
				if( licenceFilePath &&
					fs.existsSync( licenceFilePath ) ) {

					licenceData = fs.readFileSync( licenceFilePath )

				} else {
					next( 'Error: Could not open licence file.' )
				}
			}

			var payload = licence.createPayload( licenceData )

			if( humanReadable ) {
				console.log(
					'user name: ' + payload.uid + '\n' +
					'licence id: ' + payload.lid + '\n' +
					'product id: ' + payload.pid + '\n' +
					'issue date: ' + payload.isd + '\n' +
					'validity period: ' + payload.days
				)

			} else {
				var result = {
					status : 'valid',
					payload : licence.createPayload( licenceData )
				}

				console.log( JSON.stringify( result ) )
			}

			next()
		}
	}
)
