define(
	'spell/asset/constructAssets',
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


		var createFrameOffset = function( frameWidth, frameHeight, numX, numY, frameId, innerPadding ) {
			if( !innerPadding ) innerPadding = 0

			frameWidth  += innerPadding * 2
			frameHeight += innerPadding * 2

			return [
				( frameId % numX ) * frameWidth + innerPadding,
				Math.floor( frameId / numX ) * frameHeight + innerPadding
			]
		}

		var eachAnimatedAttribute = function( animate, iterator ) {
			return _.each(
				animate,
				function( attributes ) {
					_.each( attributes, iterator )
				}
			)
		}

		var createAsset = function( subtype ) {
			return {
				type            : subtype,
				resources       : [],
				resourceFiles   : []
			}
		}

		var createAppearanceAsset = function( libraryId, libraryRecord, language, qualityLevel ) {
			var asset               = createAsset( 'appearance' ),
				config              = libraryRecord.config,
				isLocalized         = config.localized || false,
				qualityLevelSuffix  = config.qualityLevels ? '.' + qualityLevel : '',
				languageToExtension = config.localization,
				filePath            = libraryId.replace( /\./g, '/' )

			if( isLocalized ) {
				var fileExtension       = languageToExtension[ currentLanguage ],
					localizedFileName   = asset.name + '.' + currentLanguage + qualityLevelSuffix + '.' + fileExtension

				filePath                += '/' + localizedFileName


			} else {
				filePath                += qualityLevelSuffix + config.extension
			}

			asset.resourceFiles.push( filePath )

			return asset
		}

		var createSoundAsset = function( libraryRecord, language, qualityLevel ) {
			return {
				type            : libraryRecord.type,
				isMusic         : !!libraryRecord.config.isMusic
			}
		}

		var createSpriteSheetAsset = function( libraryRecord, language, qualityLevel ) {
			var frameWidth      = libraryRecord.config.frameWidth || 1,
				frameHeight     = libraryRecord.config.frameHeight || 1,
				innerPadding    = libraryRecord.config.innerPadding || 0,
				numX            = Math.floor( libraryRecord.config.textureWidth / ( frameWidth + innerPadding * 2 ) ),
				numY            = Math.floor( libraryRecord.config.textureHeight / ( frameHeight + innerPadding * 2 ) ),
				numFrames       = numX * numY

			// create a lookup table to lookup the subtextures
			var frameOffsets = []

			for( var i = 0; i < numFrames; i++ ) {
				frameOffsets.push( createFrameOffset( frameWidth, frameHeight, numX, numY, i, innerPadding ) )
			}

			return {
				frameDimensions : [ frameWidth, frameHeight ],
				frameOffsets    : frameOffsets,
				frameMaxX       : numX,
				frameMaxY       : numY,
				config          : libraryRecord.config,
				type            : libraryRecord.subtype
			}
		}

		var createFontAsset = function( libraryRecord, language, qualityLevel ) {
			return {
				config          : libraryRecord.config,
				type            : libraryRecord.subtype
			}
		}

		var createInputMapAsset = function( libraryRecord, language, qualityLevel ) {
			return _.reduce(
				asset.config,
				function( memo, action, key ) {
					memo[ keyCodes[ key ] ] = action

					return memo
				},
				{}
			)
		}

		var createKeyFrameAnimationAsset = function( libraryRecord, language, qualityLevel ) {
			var config = libraryRecord.config

			// determine and add length of attribute animations
			eachAnimatedAttribute(
				config.animate,
				function( attribute ) {
					attribute.length = _.last( attribute.keyFrames ).time
				}
			)

			return {
				animate : config.animate,
				type    : libraryRecord.subtype,
				length  : config.length
			}
		}

		var createTranslationAsset = function( libraryRecord, language, qualityLevel ) {
			return {
				config  : assetDefinition.config,
				type    : libraryRecord.subtype
			}
		}

		var createAnimationAsset = function( libraryRecord, language, qualityLevel ) {
			var spriteSheetAssetId = asset.assetId,
				spriteSheetAsset   = assetManager.get( spriteSheetAssetId )

			if( !spriteSheetAsset ) {
				return
			}

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

		var createTilemapAsset = function( libraryRecord, language, qualityLevel ) {
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

		var assetHandler = {
			'appearance'            :       createAppearanceAsset,
			'sound'                 :       createSoundAsset,
			'spriteSheet'           :       createSpriteSheetAsset,
			'font'                  :       createFontAsset,
			'inputMap'              :       createInputMapAsset,
			'keyFrameAnimation'     :       createKeyFrameAnimationAsset,
			'translation'           :       createTranslationAsset,
			'animation'             :       createAnimationAsset,
			'2dTileMap'             :       createTilemapAsset
		}

		return function( libraryRecords, language, qualityLevel ) {

			var assetMap = {}

			_.each( libraryRecords, function( libraryRecord, libraryId ) {
				var type        = libraryRecord.type,
					subtype     = libraryRecord.subtype

				if( type != 'asset' ) {
					throw 'Error: Only libraryRecords with type asset allowed'
				}

				if( !subtype || !assetHandler[ subtype ] ) {
					throw 'Error: Asset subtype ' + subtype + ' is not supported'
				}

				var handler = assetHandler[ subtype ]

				assetMap[ libraryId ] = handler(
					libraryId,
					libraryRecord,
					language,
					qualityLevel
				)
			})

			return assetMap
		}
	}
)
