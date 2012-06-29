define(
	'spell/client/util/createAssets',
	[
		'spell/shared/util/platform/underscore'
	],
	function(
		_
	) {
		'use strict'


		/*
		 * private
		 */

		var createAppearanceAsset = function( config ) {
			return config
		}

		var createFrameOffset = function( frameWidth, frameHeight, numX, numY, frameId ) {
			return [
				( frameId % numX ) * frameWidth,
				Math.floor( frameId / numX ) * frameHeight
			]
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
				type :          asset.type,
				resourceId :    spriteSheetAsset.resourceId,
				frameWidth :    frameWidth,
				frameHeight :   frameHeight,
				frameDuration : asset.config.duration / numFrames,
				frameOffsets :  _.map( asset.config.frameIds, function( frameId ) { return createFrameOffsetPartial( numX, numY, frameId ) } ),
				numFrames :     numFrames,
				looped :        asset.config.looped
			}
		}


		/*
		 * public
		 */

		return function( assets ) {
			return _.reduce(
				assets,
				function( memo, asset, id, assets ) {
					if( asset.type === 'appearance' ) {
						memo[ id ] = createAppearanceAsset( asset )

					} else if( asset.type === 'animation' ) {
						memo[ id ] = createAnimationAsset( assets, asset )

					} else {
						memo[ id ] = asset
					}

					return memo
				},
				{}
			)
		}
	}
)
