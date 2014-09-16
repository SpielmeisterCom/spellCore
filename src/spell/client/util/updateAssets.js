define(
	'spell/client/util/updateAssets',
	[
		'spell/shared/util/createId',
		'spell/shared/util/createAssetId',
		'spell/shared/util/input/keyCodes',

		'spell/functions'
	],
	function(
		createId,
		createAssetId,
		keyCodes,

		_
	) {
		'use strict'


		var createFrameOffset = function( spriteSheetAsset, frameId ) {
            if(spriteSheetAsset.version == 1) {
                var frameWidth      = spriteSheetAsset.config.frameWidth,
                    frameHeight     = spriteSheetAsset.config.frameHeight,
                    innerPadding    = spriteSheetAsset.config.innerPadding || 0,
                    numX            = Math.floor( spriteSheetAsset.config.textureWidth / ( frameWidth + innerPadding * 2 ) ),
                    numY            = Math.floor( spriteSheetAsset.config.textureHeight / ( frameHeight + innerPadding * 2 ) )

                if( !innerPadding ) innerPadding = 0

                frameWidth  += innerPadding * 2
                frameHeight += innerPadding * 2

                return [
                        ( frameId % numX ) * frameWidth + innerPadding,
                        Math.floor( frameId / numX ) * frameHeight + innerPadding
                ]

            } else if (spriteSheetAsset.version == 2) {

                var frame = spriteSheetAsset.frames[ frameId ]
                if(frame) {
                    return [
                        frame.frame.x, frame.frame.y
                    ]
                } else {
                    throw 'Could not find frame ' + frameId
                }
            }
		}

        var createSourceFrameDimension = function( spriteSheetAsset, frameId ) {
            if(spriteSheetAsset.version == 1) {
                return [
                    spriteSheetAsset.config.frameWidth,
                    spriteSheetAsset.config.frameHeight
                ]

            } else if (spriteSheetAsset.version == 2) {
                var frame = spriteSheetAsset.frames[ frameId ]
                if(frame) {
                    return [
                        frame.frame.w, frame.frame.h
                    ]
                } else {
                    throw 'Could not find frame ' + frameId
                }
            }
        }

        var createDestinationFrameDimension = function( spriteSheetAsset, frameId ) {
            var frame = spriteSheetAsset.frames[ frameId ]
            if(frame) {
                return [
                    frame.sourceSize.w, frame.sourceSize.h
                ]
            } else {
                throw 'Could not find frame ' + frameId
            }
        }

		var createTilemapAsset = function( assetManager, asset ) {
			var spriteSheetAssetId = asset.assetId,
				spriteSheetAsset   = assetManager.get( spriteSheetAssetId )

			if( !spriteSheetAsset ) {
				return
			}

			return {
				type                : asset.subtype,
				resourceId          : spriteSheetAsset.resourceId,
				spriteSheet         : spriteSheetAsset,
				config              : asset.config,
				tilemapDimensions   : [ asset.config.width, asset.config.height ],
				tilemapData         : asset.config.tileLayerData
			}
		}

		var createAnimationAsset = function( assetManager, asset ) {
			var spriteSheetAssetId = asset.assetId,
				spriteSheetAsset   = assetManager.get( spriteSheetAssetId )

			if( !spriteSheetAsset ) {
				return
			}

            var frameWidth      = spriteSheetAsset.config.frameWidth,
                frameHeight     = spriteSheetAsset.config.frameHeight,
                numFrames       = _.size( asset.config.frameIds )

            if(asset.version == 1 && spriteSheetAsset.version == 1) {
                return {
                    type                        : asset.subtype,
                    resourceId                  : spriteSheetAsset.resourceId,
                    frameDuration               : asset.config.duration / numFrames,
                    frameOffsets                : _.map( asset.config.frameIds, function( frameId ) { return createFrameOffset( spriteSheetAsset, frameId ) } ),
                    frameSourceDimensions       : _.map( asset.config.frameIds, function( frameId ) { return createSourceFrameDimension( spriteSheetAsset, frameId ) } ),
                    frameDestinationDimensions  : _.map( asset.config.frameIds, function( frameId ) { return createSourceFrameDimension( spriteSheetAsset, frameId ) } ),
                    frameTrimOffset             : _.map( asset.config.frameIds, function( frameId ) {
                        return [
                           0,
                           0
                        ]
                    } ),
                    numFrames                   : numFrames
                }

            } else if( asset.version == 2 && spriteSheetAsset.version == 2) {
                return {
                    type                        : asset.subtype,
                    resourceId                  : spriteSheetAsset.resourceId,
                    frameDuration               : asset.config.duration / numFrames,
                    frameOffsets                : _.map( asset.config.frameIds, function( frameId ) { return createFrameOffset( spriteSheetAsset, frameId ) } ),
                    frameSourceDimensions       : _.map( asset.config.frameIds, function( frameId ) { return createSourceFrameDimension( spriteSheetAsset, frameId ) } ),
                    frameDestinationDimensions  : _.map( asset.config.frameIds, function( frameId ) { return createDestinationFrameDimension( spriteSheetAsset, frameId ) } ),
                    frameTrimOffset             : _.map( asset.config.frameIds, function( frameId ) {
                        var frame = spriteSheetAsset.frames[ frameId ]
                        return [
                            frame.spriteSourceSize.x,
                            frame.sourceSize.h - frame.spriteSourceSize.h - frame.spriteSourceSize.y
                        ]
                    } ),
                    numFrames                   : numFrames
                }
            } else {
                throw "unknown animation asset version or animation asset / spritesheet asset version mismatch"
            }
		}

		var createInputMapAsset = function( asset ) {
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
            if(asset.version == 1) {
                var frameWidth      = asset.config.frameWidth || 1,
                    frameHeight     = asset.config.frameHeight || 1,
                    innerPadding    = asset.config.innerPadding || 0,
                    numX            = Math.floor( asset.config.textureWidth / ( frameWidth + innerPadding * 2 ) ),
                    numY            = Math.floor( asset.config.textureHeight / ( frameHeight + innerPadding * 2 ) ),
                    numFrames       = numX * numY

                // create a lookup table to lookup the subtextures
                var frameOffsets = []

                for( var i = 0; i < numFrames; i++ ) {
                    frameOffsets.push( createFrameOffset( asset, i ) )
                }

                return {
                    version         : asset.version,
                    frameDimensions : [ frameWidth, frameHeight ],
                    frameOffsets    : frameOffsets,
                    frameMaxX       : numX,
                    frameMaxY       : numY,
                    config          : asset.config,
                    type            : asset.subtype
                }
            } else if (asset.version == 2) {
                return {
                    version         : asset.version,
                    config          : asset.config,
                    frames          : asset.config.frames,
                    type            : asset.subtype
                }
            } else {
                throw "Unknown version for spritesheet version"
            }

		}

		var addResourceId = function( asset, assetDefinition ) {
			var file = assetDefinition.file

			if( !file ) {
				return
			}

			asset.resourceId = createId( assetDefinition.namespace, assetDefinition.name )
		}


		return function( assetManager, newAssetDefinitions, overwriteExisting ) {
			var filteredAssetDefinitions = overwriteExisting ?
				newAssetDefinitions :
				_.filter(
					newAssetDefinitions,
					function( assetDefinition ) {
						return !assetManager.has( createAssetId( assetDefinition.subtype, assetDefinition.namespace, assetDefinition.name ) )
					}
				)

			// in a first pass all assets which do not depend on other assets are created
			_.each(
				filteredAssetDefinitions,
				function( assetDefinition ) {
					var asset,
						type    = assetDefinition.subtype,
						assetId = createAssetId( type, assetDefinition.namespace, assetDefinition.name )

					if( type === 'appearance' ) {
						asset = {
							type : type
						}

					} else if( type === 'sound' ) {
						asset = {
							type : type,
							isMusic : !!assetDefinition.config.isMusic
						}

					} else if( type === 'spriteSheet' ) {
						asset = createSpriteSheetAsset( assetDefinition )

					} else if( type === 'font') {

						asset = {
							config : assetDefinition.config,
							type : type
						}

					} else if( type === 'inputMap' ) {
						asset = createInputMapAsset( assetDefinition )

					} else if( type === 'keyFrameAnimation' ) {
						asset = createKeyFrameAnimationAsset( assetDefinition )

					} else if( type === 'translation' ) {
						asset = {
							config : assetDefinition.config,
							type : type
						}
					}

					addResourceId( asset, assetDefinition )

					if( asset ) {
						asset.assetId = assetId
					}

					assetManager.add( assetId, asset )
				}
			)

			// in a second pass all assets that reference other assets are created
			_.each(
				newAssetDefinitions,
				function( assetDefinition ) {
					var type = assetDefinition.subtype

					if( type === 'animation' ) {
						var animationAsset = createAnimationAsset( assetManager, assetDefinition )

						if( animationAsset ) {
							assetManager.add(
								createAssetId(
									type,
									assetDefinition.namespace,
									assetDefinition.name
								),
								animationAsset
							)
						}

					} else if ( type === '2dTileMap') {
						var tileMapAsset = createTilemapAsset( assetManager, assetDefinition )

						if( tileMapAsset ) {
							assetManager.add(
								createAssetId(
									type,
									assetDefinition.namespace,
									assetDefinition.name
								),
								tileMapAsset
							)
						}
					}
				}
			)
		}
	}
)
