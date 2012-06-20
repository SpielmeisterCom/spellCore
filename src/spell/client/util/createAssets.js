define(
	'spell/client/util/createAssets',
	[
		'spell/shared/util/platform/underscore'
	],
	function(
		_
	) {
		'use strict'


		/**
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

		var createAnimatedAppearanceAsset = function( asset ) {
			var numX = Math.floor( asset.config.textureWidth / asset.config.frameWidth ),
				numY = Math.floor( asset.config.textureHeight / asset.config.frameHeight ),
				createFrameOffsetPartial = _.bind( createFrameOffset, null, asset.config.frameWidth, asset.config.frameHeight )

			return _.reduce(
				asset.config.animations,
				function( memo, animation, animationId ) {
					memo.animations[ animationId ] = {
						frameDuration : animation.frameDuration,
						loop          : animation.loop,
						numFrames     : _.size( animation.frameIds ),
						offsets       : _.map( animation.frameIds, function( frameId ) { return createFrameOffsetPartial( numX, numY, frameId ) } )
					}

					return memo
				},
				{
					type : asset.type,
					resourceId : asset.resourceId,
					frameWidth : asset.config.frameWidth,
					frameHeight : asset.config.frameHeight,
					animations : {}
				}
			)
		}


		/**
		 * public
		 */

		return function( assets ) {
			return _.reduce(
				assets,
				function( memo, asset, id ) {
					if( asset.type === 'appearance' ) {
						memo[ id ] = createAppearanceAsset( asset )

					} else if( asset.type === 'animatedAppearance' ) {
						memo[ id ] = createAnimatedAppearanceAsset( asset )

					} else {
						throw 'Error: Unknown asset type \'' + asset.type + '\'.'
					}

					return memo
				},
				{}
			)
		}
	}
)
