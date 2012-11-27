define(
	'spell/client/util/updateAssets',
	[
		'spell/shared/util/createAssetId',
		'spell/shared/util/createLibraryFilePath',
		'spell/shared/util/input/keyCodes',

		'spell/functions'
	],
	function(
		createAssetId,
		createLibraryFilePath,
		keyCodes,

		_
	) {
		'use strict'


		/*
		 * private
		 */

		var createFrameOffset = function( frameWidth, frameHeight, numX, numY, frameId, innerPadding ) {
			if( !innerPadding ) innerPadding = 0

			frameWidth  += innerPadding * 2
			frameHeight += innerPadding * 2

			return [
				( frameId % numX ) * frameWidth + innerPadding,
				Math.floor( frameId / numX ) * frameHeight + innerPadding
			]
		}

		var createTilemapAsset = function( assets, asset ) {
			var spriteSheetAssetId = asset.assetId,
				spriteSheetAsset   = assets[ spriteSheetAssetId ]

			if( !spriteSheetAsset ) throw 'Error: Could not find asset with id \'' + spriteSheetAssetId + '\'.'

			return {
				type                : asset.subtype,
				resourceId          : spriteSheetAsset.resourceId,
				spriteSheet         : spriteSheetAsset,
				tilemapDimensions   : [ asset.config.width, asset.config.height ],
				tilemapData         : asset.config.tileLayerData
			}
		}

		var createAnimationAsset = function( assets, asset ) {
			var spriteSheetAssetId = asset.assetId,
				spriteSheetAsset   = assets[ spriteSheetAssetId ]

			if( !spriteSheetAsset ) throw 'Error: Could not find asset with id \'' + spriteSheetAssetId + '\'.'

			var frameWidth      = spriteSheetAsset.config.frameWidth,
				frameHeight     = spriteSheetAsset.config.frameHeight,
				innerPadding    = spriteSheetAsset.config.innerPadding || 0,
				numX            = Math.floor( spriteSheetAsset.config.textureWidth / ( frameWidth + innerPadding * 2 ) ),
				numY            = Math.floor( spriteSheetAsset.config.textureHeight / ( frameHeight + innerPadding * 2 ) ),
				numFrames       = _.size( asset.config.frameIds ),
				createFrameOffsetPartial = _.bind( createFrameOffset, null, frameWidth, frameHeight )

			return {
				type            : asset.subtype,
				resourceId      : spriteSheetAsset.resourceId,
				frameDimensions : [ frameWidth, frameHeight ],
				frameDuration   : asset.config.duration / numFrames,
				frameOffsets    : _.map( asset.config.frameIds, function( frameId ) { return createFrameOffsetPartial( numX, numY, frameId, innerPadding ) } ),
				numFrames       : numFrames
			}
		}

		var createKeyToActionMapAsset = function( asset ) {
			return _.reduce(
				asset.config,
				function( memo, action, key ) {
					memo[ keyCodes[ key ] ] = action

					return memo
				},
				{}
			)
		}
		var eachAnimatedAttribute = function( animate, iterator ) {
			return _.each(
				animate,
				function( attributes ) {
					_.each( attributes, iterator )
				}
			)
		}

		var createKeyFrameAnimationAsset = function( asset ) {
			var config = asset.config

			// determine and add length of attribute animations
			eachAnimatedAttribute(
				config.animate,
				function( attribute ) {
					attribute.length = _.last( attribute.keyFrames ).time
				}
			)

			return {
				animate : config.animate,
				type    : asset.subtype,
				length  : config.length
			}
		}

		var createSpriteSheetAsset = function( asset ) {
			var frameWidth      = asset.config.frameWidth,
				frameHeight     = asset.config.frameHeight,
				innerPadding    = asset.config.innerPadding || 0,
				numX            = Math.floor( asset.config.textureWidth / (frameWidth + innerPadding*2) ),
				numY            = Math.floor( asset.config.textureHeight / (frameHeight + innerPadding*2) ),
				numFrames       = numX * numY

			// create a lookup table to lookup the subtextures
			var frameOffsets = []

			for( var i = 0; i < numFrames; i++ ) {
				frameOffsets[ i ] = createFrameOffset( frameWidth, frameHeight, numX, numY, i, innerPadding )
			}

			return {
				frameDimensions : [ frameWidth, frameHeight ],
				frameOffsets    : frameOffsets,
				frameMaxX       : numX,
				frameMaxY       : numY,
				numFrames       : numFrames,
				config          : asset.config,
				type            : asset.subtype
			}
		}

		var injectResource = function( asset, resources, resourceId ) {
			if( !asset.resourceId ) return

			var resource = resources[ asset.resourceId ]

			if( !resource ) throw 'Error: Could not resolve resource id \'' + asset.resourceId + '\'.'

			asset.resource = resource
		}

		var addResourceId = function( asset, assetDefinition ) {
			var file = assetDefinition.file

			if( !file ) return

			asset.resourceId = createLibraryFilePath( assetDefinition.namespace, file )
		}


		/*
		 * public
		 */

		return function( assets, newAssetDefinitions ) {
			// in a first pass all assets which do not depend on other assets are created
			_.each(
				newAssetDefinitions,
				function( assetDefinition ) {
					var asset,
						type    = assetDefinition.subtype,
						assetId = createAssetId( type, assetDefinition.namespace, assetDefinition.name)

					if( type === 'appearance' || type === 'sound' ) {
					asset = {
						type : type
					}

					} else if( type === 'spriteSheet' ) {
						asset = createSpriteSheetAsset( assetDefinition )

					} else if( type === 'font') {

						asset = {
							config : assetDefinition.config,
							type   : type
						}

					} else if( type === 'keyToActionMap' ) {
						asset = createKeyToActionMapAsset( assetDefinition )

					} else if( type === "keyFrameAnimation" ) {
						asset = createKeyFrameAnimationAsset( assetDefinition )
					}

					addResourceId( asset, assetDefinition )

					if (asset) {
						asset.assetId  = assetId
					}

					assets[ assetId ] = asset
				}
			)

			// in a second pass all assets that reference other assets are created
			_.each(
				newAssetDefinitions,
				function( assetDefinition ) {
					var type = assetDefinition.subtype

					if( type === 'animation' ) {
						assets[ createAssetId( type, assetDefinition.namespace, assetDefinition.name ) ] = createAnimationAsset( assets, assetDefinition )

					} else if ( type === '2dTileMap') {
						assets[ createAssetId( type, assetDefinition.namespace, assetDefinition.name ) ] = createTilemapAsset( assets, assetDefinition )
					}
				}
			)
		}
	}
)
