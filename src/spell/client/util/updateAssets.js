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

		var createFrameOffset = function( frameWidth, frameHeight, numX, numY, frameId ) {
			return [
				( frameId % numX ) * frameWidth,
				Math.floor( frameId / numX ) * frameHeight
			]
		}

		var createTilemapAsset = function( assets, asset ) {
			var spriteSheetAssetId = asset.assetId,
				spriteSheetAsset   = assets[ spriteSheetAssetId ]

			if( !spriteSheetAsset ) throw 'Error: Could not find asset with id \'' + spriteSheetAssetId + '\'.'

			var frameWidth  = spriteSheetAsset.config.frameWidth,
				frameHeight = spriteSheetAsset.config.frameHeight,
				numX        = Math.floor( spriteSheetAsset.config.textureWidth / frameWidth ),
				numY        = Math.floor( spriteSheetAsset.config.textureHeight / frameHeight ),
				numFrames   = numX * numY

			// create a lookup table to lookup the subtextures
			var frameOffsets = []

			for( var i = 0; i < numFrames; i++ ) {
				frameOffsets[ i ] = createFrameOffset( frameWidth, frameHeight, numX, numY, i )
			}

			return {
				type                : asset.subtype,
				resourceId          : spriteSheetAsset.resourceId,
				frameDimensions     : [ frameWidth, frameHeight ],
				tilemapDimensions   : [ asset.config.width, asset.config.height ],
				tilemapData         : asset.config.tileLayerData,
				frameOffsets        : frameOffsets
			}
		}

		var createAnimationAsset = function( assets, asset ) {
			var spriteSheetAssetId = asset.assetId,
				spriteSheetAsset   = assets[ spriteSheetAssetId ]

			if( !spriteSheetAsset ) throw 'Error: Could not find asset with id \'' + spriteSheetAssetId + '\'.'

			var frameWidth  = spriteSheetAsset.config.frameWidth,
				frameHeight = spriteSheetAsset.config.frameHeight,
				numX        = Math.floor( spriteSheetAsset.config.textureWidth / frameWidth ),
				numY        = Math.floor( spriteSheetAsset.config.textureHeight / frameHeight ),
				numFrames   = _.size( asset.config.frameIds),
				createFrameOffsetPartial = _.bind( createFrameOffset, null, frameWidth, frameHeight )

			return {
				type            : asset.subtype,
				resourceId      : spriteSheetAsset.resourceId,
				frameDimensions : [ frameWidth, frameHeight ],
				frameDuration   : asset.config.duration / numFrames,
				frameOffsets    : _.map( asset.config.frameIds, function( frameId ) { return createFrameOffsetPartial( numX, numY, frameId ) } ),
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
						type = assetDefinition.subtype

					if( type === 'appearance') {
						asset = {
							type : type
						}

					} else if( type === 'spriteSheet' ||
						type === 'font') {

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

					assets[ createAssetId( type, assetDefinition.namespace, assetDefinition.name ) ] = asset
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
