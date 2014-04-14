define(
	'spell/shared/util/platform/private/iap/android',
	[
	],
	function(
		) {
		'use strict'


        var simulate = undefined

        var STATE = {
            succeeded: 0,
            alreadyPurchased: 1,
            notFulfilled: 2,
            notPurchased: 3
        }

		return {
			init: function( isDebug ) {
				simulate = isDebug
			},
            isProductActive: function( productId ) {
				return false
            },
            purchaseProduct: function( productId, successCallback, errorCallback ) {
				//TODO: look at https://github.com/gameclosure/billing/blob/master/js/billing.js
				NATIVE.plugins.sendEvent("BillingPlugin", "purchase", JSON.stringify({
					"sku": productId
				}))
            }
		}
	}
)
