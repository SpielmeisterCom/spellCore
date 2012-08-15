define(
	'spell/client/util/createAssets',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		/*
		 * private
		 */

		var createAssetId = function( type, resourceName ) {
			var baseName = resourceName.match( /(.*)\.[^.]+$/ )[ 1 ]

			return type + ':' + baseName.replace( /\//g, '.' )
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
				type            : asset.type,
				resourceId      : spriteSheetAsset.resourceId,
				frameDimensions : [ frameWidth, frameHeight ],
				frameDuration   : asset.config.duration / numFrames,
				frameOffsets    : _.map( asset.config.frameIds, function( frameId ) { return createFrameOffsetPartial( numX, numY, frameId ) } ),
				numFrames       : numFrames,
				looped          : asset.config.looped
			}
		}


		/*
		 * public
		 */

		return function( assetDefinitions ) {
			// in a first pass all assets which do not depend on other assets are created
			var assets = _.reduce(
				assetDefinitions,
				function( memo, assetDefinition, resourceName ) {
					var assetId = createAssetId( assetDefinition.type, resourceName )

					if( assetDefinition.type === 'appearance') {
						memo[ assetId ] = {
							resourceId : assetDefinition.file,
							type       : assetDefinition.type
						}

					} else if( assetDefinition.type === 'spriteSheet' ||
						assetDefinition.type === 'font') {

						memo[ assetId ] = {
							config     : assetDefinition.config,
							resourceId : assetDefinition.file,
							type       : assetDefinition.type
						}
					}

					return memo
				},
				{}
			)

			// in a second pass all assets that reference other assets are created
			return _.reduce(
				assetDefinitions,
				function( memo, assetDefinition, resourceName ) {
					var assetId = createAssetId( assetDefinition.type, resourceName )

					if( assetDefinition.type === 'animation' ) {
						memo[ assetId ] = createAnimationAsset( memo, assetDefinition )
					}

					return memo
				},
				assets
			)
		}
	}
)
