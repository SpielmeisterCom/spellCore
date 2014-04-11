define(
	'spell/shared/util/platform/private/store/windows',
	[
	],
	function(
		) {
		'use strict'

        var currentApp, licenseInformation

        var STATE = {
            succeeded: 0,
            alreadyPurchased: 1,
            notFulfilled: 2,
            notPurchased: 3
        }

		return {
			init: function( isDebug ) {
                currentApp         = isDebug ? Windows.ApplicationModel.Store.CurrentAppSimulator : Windows.ApplicationModel.Store.CurrentApp
                licenseInformation = currentApp.licenseInformation
			},
            isProductActive: function( productId ) {
                var product = licenseInformation.productLicenses.lookup( productId )
                return product && product.isActive
            },
            purchaseProduct: function( productId, successCallback, errorCallback ) {
                currentApp.requestProductPurchaseAsync( productId ).done(
                    function( purchaseResults ) {
                        if( STATE.succeeded === purchaseResults.status ) {
                            successCallback()
                        } else {
                            errorCallback( purchaseResults.status )
                        }
                    },
                    function( error ) {
                        errorCallback( error.message )
                    }
                )
            }
		}
	}
)
