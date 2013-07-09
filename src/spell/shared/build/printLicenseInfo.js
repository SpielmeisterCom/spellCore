define(
	'spell/shared/build/printLicenseInfo',
	[
		'spell-license'
	],
	function(
		license
	) {
		'use strict'


		var COLUMN_WIDTH = 25

		var createLine = function( key, value ) {
			var result    = key + ' : ',
				numSpaces = Math.max( COLUMN_WIDTH - result.length, 0 )

			for( var i = 0, n = numSpaces; i < n; i++ ) {
				result += ' '
			}

			result += value

			return result
		}

		var createFeatureList = function( features ) {
			return _.map(
				features,
				function( feature ) {
					return createLine( '  * ' + feature.name, feature.included ? 'yes' : 'no' )
				}
			).join( '\n' )
		}

		return function( isDevEnv, humanReadable, licenseInfo, next ) {
			var payload = licenseInfo.payload

			var message = humanReadable ?
				createLine( 'username', payload.uid ) + '\n' +
				createLine( 'license id', payload.lid ) + '\n' +
				createLine( 'product id', payload.pid ) + '\n' +
				createLine( 'product features', '' ) + '\n' +
				createFeatureList( licenseInfo.productFeatures ) + '\n' +
				createLine( 'issue date', payload.isd ) + '\n' +
				createLine( 'validity period (days)', payload.days ) + '\n' +
				createLine( 'status', licenseInfo.isValid ? 'valid' : 'not valid' )	:
				JSON.stringify( licenseInfo )

			console.log( message )

			next()
		}
	}
)
