define(
	'spell/shared/build/hasValidLicense',
	[
		'spell-license'
	],
	function(
		license
	) {
		'use strict'


		return function( publicKey, licenseData ) {
			if( !licenseData ) {
				return false
			}

			var hasValidSignature = license.verify( publicKey, licenseData )

			if( !hasValidSignature ) {
				return
			}

			var payload = license.createPayload( licenseData )

			if( !payload ) {
				return
			}

			var nowInUnixtime            = Math.ceil( new Date().getTime() / 1000 ),
				issueDateInUnixtime      = Math.ceil( new Date( payload.isd ).getTime() / 1000 ),
				validityPeriodInUnixtime = payload.days * 24 * 60 * 60,
				isInValidityPeriod       = nowInUnixtime < issueDateInUnixtime + validityPeriodInUnixtime

			return isInValidityPeriod
		}
	}
)
