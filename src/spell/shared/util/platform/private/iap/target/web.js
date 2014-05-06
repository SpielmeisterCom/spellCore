define(
	'spell/shared/util/platform/private/iap/target/web',
	[
        'spell/Defines'
	],
	function(
        Defines
	) {
		'use strict'

        var STATE = Defines.IAP.STATE

        //TODO: Mockup, Only for debugging should be changed to paypal or something like that
        var purchases = {}

        var hasProduct = function( productId ) {
            var product = purchases[ productId ]

            return !!product
        }

		return {
			init: function( isDebug ) {
			},
            purchaseProduct: function( productId, successCallback, errorCallback ) {
                var purchased = confirm( "Want to buy '" + productId + "' ?" )

                if( purchased ) {
                    purchases[ productId ] = true
                    successCallback()

                } else {
                    errorCallback( STATE.notFulfilled )
                }
            }
		}
	}
)
