define(
	'spell/shared/util/platform/private/iap/target/windows',
    [
        'spell/Defines'
    ],
    function(
        Defines
        ) {
        'use strict'

        var STATE = Defines.IAP.STATE

        var currentApp, licenseInformation

		return {
			init: function( isDebug ) {
                currentApp         = isDebug ? Windows.ApplicationModel.Store.CurrentAppSimulator : Windows.ApplicationModel.Store.CurrentApp
                licenseInformation = currentApp.licenseInformation
			},
//            isProductActive: function( productId ) {
//                var product = licenseInformation.productLicenses.lookup( productId )
//                return product && product.isActive
//            },
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
