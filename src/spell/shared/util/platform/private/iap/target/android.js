define(
	'spell/shared/util/platform/private/iap/target/android',
	function() {
		'use strict'


        var simulate = false
        var readPurchases = false

        var onFailure
        var onPurchase

        var registerEvents = function() {
            NATIVE.events.registerHandler('billingPurchase', function( evt ) {
                console.log( "Got billingPurchase event: " + JSON.stringify( evt ) )

                // If SKU event,
                var sku   = evt.sku,
                    token = evt.token

                if (!sku || evt.failure) {
                    var failure = evt.failure || "cancel"

                    console.log( "Unable to purchase item " + sku + " : " + failure )

                    if (typeof onFailure === "function") {
                        onFailure( failure, sku )
                    }
                } else {
                    //TODO: Only consume if it is a consumable!
                    return
                    NATIVE.plugins.sendEvent( "BillingPlugin", "consume", JSON.stringify({
                        token: token
                    }))
                }
            })

            NATIVE.events.registerHandler( 'billingConsume', function( evt ) {
                console.log( "Got billingConsume event: " + JSON.stringify( evt ) )

                // NOTE: Function is organized carefully for callback reentrancy

                var token = evt.token

                // If not failed,
                if ( !evt.failure ) {
                    //Consume item
                    console.log( "Consumed token " + token )

                    if ( typeof onPurchase === "function" ) {
                        onPurchase()
                    }
                } else {
                    console.log( "Failed to consume token " + token )
                }
            })

            NATIVE.events.registerHandler( 'billingOwned', function( evt ) {
                console.log( "Got billingOwned event: " + JSON.stringify( evt ) )

                // If attempt failed,
                if ( evt.failure ) {
                    if (!readPurchases) {
                        syncOwnedItems()
                    }

                } else {
                    readPurchases = true

                    // Add owned items
                    var skus = evt.skus
                    var tokens = evt.tokens

                    if (skus && skus.length > 0) {
                        for (var ii = 0, len = skus.length; ii < len; ++ii) {
                            //TODO: Add sync the data
                            console.log( skus[ii] )
                            console.log( tokens[ii] )
                        }
                    }
                }
            })

            NATIVE.events.registerHandler( 'billingConnected', function( evt ) {
                console.log( "Got billingConnected event: " + JSON.stringify( evt ) )

                if( evt.connected && !readPurchases ) syncOwnedItems()
            })
        }

        var syncOwnedItems = function() {
            NATIVE.plugins.sendEvent( "BillingPlugin", "getPurchases", "{}" )
        }

		return {
			init: function( isDebug ) {
                registerEvents()

				simulate = isDebug
                NATIVE.plugins.sendEvent( "BillingPlugin", "isConnected", "{}" )

                syncOwnedItems()
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
