define(
	'spell/client/util/createAssets',
	[
		'spell/shared/util/createLibraryFilePath',
		'spell/shared/util/input/keyCodes',

		'spell/functions'
	],
	function(
		createLibraryFilePath,
		keyCodes,

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

		return function( assetDefinitions ) {
			// in a first pass all assets which do not depend on other assets are created
			var assets = _.reduce(
				assetDefinitions,
				function( memo, assetDefinition, resourceName ) {
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

					memo[ createAssetId( type, resourceName ) ] = asset

					return memo
				},
				{}
			)

			// in a second pass all assets that reference other assets are created
			return _.reduce(
				assetDefinitions,
				function( memo, assetDefinition, resourceName ) {
					var type = assetDefinition.subtype

					if( type === 'animation' ) {
						memo[ createAssetId( type, resourceName ) ] = createAnimationAsset( memo, assetDefinition )
					}

					return memo
				},
				assets
			)
		}
	}
)
