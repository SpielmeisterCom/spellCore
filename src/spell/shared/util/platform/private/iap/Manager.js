define(
    'spell/shared/util/platform/private/iap/Manager',
	[
        'spell/shared/util/platform/private/environment/isHtml5TeaLeaf',
        'spell/shared/util/platform/private/environment/isHtml5WinStore',
        'spell/shared/util/platform/private/environment/isHtml5Ejecta',
        'spell/shared/util/platform/private/iap/target/android',
        'spell/shared/util/platform/private/iap/target/web',
        'spell/shared/util/platform/private/iap/target/windows'
	],
	function(
        isHtml5TeaLeaf,
        isHtml5WinStore,
        isHtml5Ejecta,
        androidIap,
        webIap,
        windowsIap
	) {
		'use strict'

        var STATE = {
            succeeded: 0,
            alreadyPurchased: 1,
            notFulfilled: 2,
            notPurchased: 3
        }

        var factory = function() {

            if( isHtml5TeaLeaf ) {
                return androidIap

            } else if( isHtml5Ejecta ) {
                return {}

            } else if( isHtml5WinStore ) {
                return windowsIap

            } else {
                return webIap
            }
        }

        var IapManager = function() {
            this.iap = factory()
        }

        var onPurchaseSuccess = function( callback ) {
            callback()
        }

        var onError = function( callback, message ) {
            callback( message )
        }

        var syncPurchasedProducts = function( storage ) {

        }

        var storage,
            STORAGE_KEY = 'iap'

        IapManager.prototype = {
            init: function( storage ) {
                this.iap.init( storage )
                this.storage = storage
            },
            purchase: function( productId, successCallback, errorCallback ) {
                this.iap.purchaseProduct(
                    productId,
                    function() {
                        onPurchaseSuccess( successCallback )
                    },
                    function( message ) {
                        onError( errorCallback, message )
                    }
                )
            },
            consume: function( productId ) {

            },
			hasProduct: function( productId ) {

			}
		}

		return IapManager
	}
)
