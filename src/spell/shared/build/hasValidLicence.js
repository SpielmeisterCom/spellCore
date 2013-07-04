define(
	'spell/shared/build/hasValidLicence',
	[
		'spell-licence'
	],
	function(
		licence
	) {
		'use strict'


		return function( publicKey, licenceData ) {
			if( !licenceData ) {
				return false
			}

			var hasValidSignature = licence.verify( publicKey, licenceData )

			if( !hasValidSignature ) {
				return
			}

			var payload = licence.createPayload( licenceData )

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
