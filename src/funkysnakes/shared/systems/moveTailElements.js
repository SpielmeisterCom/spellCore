define(
	"funkysnakes/shared/systems/moveTailElements",
	[
		"funkysnakes/shared/config/constants",
		"funkysnakes/shared/util/speedOf",

		"spell/math/vec3",

		'spell/shared/util/platform/underscore'
	],
	function(
		constants,
		speedOf,

		vec3,

		_
	) {
		"use strict"


		var pastPositionsDistance = constants.pastPositionsDistance
		var tailElementDistance   = constants.tailElementDistance
		var distanceTailToShip    = constants.distanceTailToShip


		var updatePastPositions = function( head, dtInSeconds ) {
			head.body.distanceCoveredSinceLastSavedPosition += speedOf( head ) * dtInSeconds

			if( head.body.distanceCoveredSinceLastSavedPosition <= pastPositionsDistance ) return


			head.body.distanceCoveredSinceLastSavedPosition = 0

			head.body.pastPositions.unshift( vec3.create( head.position ) )

			var numberOfRequiredPastPositions =
				Math.ceil( ( ( head.amountTailElements.value + 1 ) * tailElementDistance + distanceTailToShip ) / pastPositionsDistance )

			while( head.body.pastPositions.length > numberOfRequiredPastPositions ) {
				head.body.pastPositions.pop()
			}
		}

		var updateTailElementPositions = function( tailElements, positionOfHead, pastPositions ) {
			var tailElementLength = _.size( tailElements )
			if( tailElementLength === 0 || pastPositions.length < 2 ) return


			var distanceToNextSearchedPosition = distanceTailToShip // absolute distance from the beginning of the tail
			var distanceCoveredInTail = 0 // absolute distance from the beginning of the tail
			var i = 0;
			var currentTailElementIndex = 0
			var currentPosition = positionOfHead
			var nextPosition = pastPositions[ i ]


			while(
				( i < pastPositions.length - 1 ) &&
				( currentTailElementIndex < tailElementLength )
			) {
				var delta = vec3.create()
				vec3.subtract( nextPosition, currentPosition, delta )

				var distanceBetweenPositions = vec3.length( delta )
				distanceCoveredInTail += distanceBetweenPositions

				// if this is false the searched position is even further back in the tail
				if( distanceCoveredInTail > distanceToNextSearchedPosition ) {
					// relative position between the two past positions
					var u = ( distanceCoveredInTail - distanceToNextSearchedPosition ) / distanceBetweenPositions
					var tailElement = tailElements[ currentTailElementIndex ]

					vec3.lerp(
						nextPosition,
						currentPosition,
						u,
						tailElement.position
					)

					distanceToNextSearchedPosition += tailElementDistance
					currentTailElementIndex++
				}

				i++
				currentPosition = pastPositions[ i ]
				nextPosition = pastPositions[ i + 1 ]
			}
		}


		return function(
			dtInSeconds,
			heads,
			tailElements
		) {
			_.each( heads, function( head ) {
				updatePastPositions( head, dtInSeconds )
				updateTailElementPositions( tailElements[ head.body.id ], head.position, head.body.pastPositions )
			} )
		}
	}
)
