define(
    'spell/shared/util/platform/private/iap/Manager',
	[
        'spell/shared/util/platform/private/environment/isHtml5TeaLeaf',
        'spell/shared/util/platform/private/environment/isHtml5WinStore',
        'spell/shared/util/platform/private/environment/isHtml5Ejecta',
        'spell/shared/util/platform/private/iap/target/android',
        'spell/shared/util/platform/private/iap/target/web',
        'spell/shared/util/platform/private/iap/target/windows',

        'spell/Defines',
        'spell/functions'
	],
	function(
        isHtml5TeaLeaf,
        isHtml5WinStore,
        isHtml5Ejecta,
        androidIap,
        webIap,
        windowsIap,

        Defines,
        _
	) {
		'use strict'


        var STORAGE_KEY = 'iap',
            STATE       = Defines.IAP.STATE

        var createStoreKey = function( productId ) {
            return STORAGE_KEY + '.' + productId
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

        var onPurchaseSuccess = function( productId, callback ) {
            if( !callback ) throw new Error( 'Missing purchaseSuccess callback' )

            this.storage.set( createStoreKey( productId ), true )

            callback()
        }

        var onError = function( callback, message ) {
            if( !callback ) throw new Error( 'Missing onPurchaseError callback' )
            callback( message )
        }

        IapManager.prototype = {
            init: function( storage ) {
                this.iap.init( storage )
                this.storage = storage
            },
            purchase: function( productId, successCallback, errorCallback ) {
                //Consume direktly all purchases. no sync will be made. if your offline you cant buy things. if you remove your app, your items will be removed
                if( !this.hasProduct( productId ) ) {
                    this.iap.purchaseProduct(
                        productId,
                        _.bind( onPurchaseSuccess, this, productId, successCallback ),
                        _.bind( onError, this, errorCallback )
                    )
                } else {
                    errorCallback( STATE.alreadyPurchased )
                }
            },
            consume: function( productId, successCallback, errorCallback ) {
                if( !successCallback ) throw new Error( 'Missing consumeSuccess callback' )
                if( !errorCallback ) throw new Error( 'Missing consumeError callback' )

                if( this.hasProduct( productId ) ) {
                    this.storage.clear( createStoreKey( productId ) )
                    successCallback()

                } else {
                    errorCallback( )
                }
            },
			hasProduct: function( productId ) {
                var product = this.storage.get( createStoreKey( productId ) )

                return product === true
			}
		}

		return IapManager
	}
)
