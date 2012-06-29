define(
	'funkysnakes/client/systems/ProgressPatternUpdater',
	[
		'spell/shared/util/Events',
		'spell/shared/util/math',
		'spell/shared/util/random/XorShift32',

		'glmatrix/vec3',
		'spell/shared/util/platform/underscore'
	],
	function(
		Events,
		math,
		XorShift32,

		vec3,
		_
	) {
		'use strict'


		/*
		 * private
		 */

		var progress = 0,
			lastProgress = 0,
			lastCreatedIndex = 0,
			amountRectanglesPerLine = 6,
			amountRectangles = amountRectanglesPerLine * amountRectanglesPerLine,
			sizeRectangle   = 25,
			gapRectangle    = 15,
			offsetRectangle = sizeRectangle + gapRectangle,
			posXPattern     = 400,
			posYPattern     = 300,
			minColor        = 0.2,
			maxColor        = 0.95,
			prng            = new XorShift32( 3497589 )


		var createRectangle = function( entityManager, index ) {
			var x = Math.floor( index / amountRectanglesPerLine ),
				y = index % amountRectanglesPerLine

			entityManager.createEntity(
				'coloredRectangle',
				[ {
					appearance: {
						color : [ prng.nextBetween( minColor, maxColor ),prng.nextBetween( minColor, maxColor ), prng.nextBetween( minColor, maxColor ), 1.0 ],
						scale : [ sizeRectangle, sizeRectangle ]
					},
					position : [ posXPattern + x * offsetRectangle, posYPattern + y * offsetRectangle, 0 ]
				} ]
			)
		}


		/*
		 * public
		 */

		var ProgressPatternUpdater = function( eventManager, entityManager ) {
			this.eventManager  = eventManager
			this.entityManager = entityManager

			eventManager.subscribe(
				[ Events.RESOURCE_PROGRESS, 'gameZoneResources' ],
				function( value ) {
					progress = value
				}
			)
		}

		var process = function() {
			if( progress === lastProgress ) return

			var index = Math.round( progress * ( amountRectangles ) )

			_.each(
				_.range( lastCreatedIndex, index ),
				_.bind(
					function( indexToCreate ) {
						createRectangle( this.entityManager, indexToCreate )
					},
					this
				)
			)

			lastProgress = progress
			lastCreatedIndex = index
		}

		ProgressPatternUpdater.prototype = {
			process : process
		}

		return ProgressPatternUpdater
	}
)
