define(
	'spell/shared/util/platform/private/iap/android',
	function() {
		'use strict'


        var simulate = undefined

        var STATE = {
            succeeded: 0,
            alreadyPurchased: 1,
            notFulfilled: 2,
            notPurchased: 3
        }

        var onFailure
        var onPurchase

        NATIVE.events.registerHandler('billingPurchase', function( evt ) {
            console.log( "Got billingPurchase event:", JSON.stringify( evt ) )

            // If SKU event,
            var sku   = evt.sku,
                token = evt.token

            if (!sku || evt.failure) {
                var failure = evt.failure || "cancel"

                console.log( "Unable to purchase item", sku, ":", failure )

                if (typeof onFailure === "function") {
                    onFailure( failure, sku )
                }
            } else {
                NATIVE.plugins.sendEvent( "BillingPlugin", "consume", JSON.stringify({
                    token: token
                }))
            }
        })

        NATIVE.events.registerHandler( 'billingConsume', function( evt ) {
            console.log( "Got billingConsume event:", JSON.stringify( evt ) )

            // NOTE: Function is organized carefully for callback reentrancy

            var token = evt.token

            // If not failed,
            if ( !evt.failure ) {
                //Consume item
                console.log( "Consumed token", token )

                if ( typeof onPurchase === "function" ) {
                    onPurchase()
                }
            } else {
                console.log( "Failed to consume token", token )
            }
        })

		return {
			init: function( isDebug ) {
				simulate = isDebug
			},
            isProductActive: function( productId ) {
				return false
            },
            purchaseProduct: function( productId, successCallback, errorCallback ) {
                onFailure = errorCallback
                onPurchase = successCallback
                NATIVE.plugins.sendEvent( "BillingPlugin", "purchase", JSON.stringify({
                    "sku": productId
                }))
            }
		}
	}
)
