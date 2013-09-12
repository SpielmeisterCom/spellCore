define(
	'spell/client/development/createComponentMessageHandler',
	[
		'spell/client/development/createMessageDispatcher',
		'spell/client/development/library/loadAsset'
	],
	function(
		createMessageDispatcher,
		loadAsset
	) {
		'use strict'


		return function( spell ) {
			var updateComponent = function( payload ) {
				var success = spell.entityManager.updateComponent( payload.entityId, payload.componentId, payload.config )

				if( !success ) {
					spell.console.error( 'Could not update component "' + payload.componentId + '" in entity ' + payload.entityId + '.' )
				}
			}

			return createMessageDispatcher( {
				add : function( payload ) {
					spell.entityManager.addComponent( payload.entityId, payload.componentId )
				},
				remove : function( payload ) {
					spell.entityManager.removeComponent( payload.entityId, payload.componentId )
				},
				update : function( payload ) {
					var assetId = payload.config.assetId

					if( assetId ) {
						loadAsset(
							spell,
							assetId,
							function( loadedFiles ) {
								spell.assetManager.injectResources( loadedFiles )

								spell.entityManager.updateAssetReferences( assetId, spell.assetManager.get( assetId ) )

								updateComponent( payload )
							}
						)

					} else {
						updateComponent( payload )
					}
				}
			} )
		}
	}
)
