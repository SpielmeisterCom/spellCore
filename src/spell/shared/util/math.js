define(
	"spell/shared/util/math",
	function(
	) {
		"use strict"


		var clamp = function( value, lowerBound, upperBound ) {
			if ( value < lowerBound) return lowerBound;
			if ( value > upperBound) return upperBound;

			return value;
		}

		var isInInterval = function( value, lowerBound, upperBound ) {
			return ( value >= lowerBound && value <= upperBound )
		}


		return {
			clamp : clamp,
			isInInterval : isInInterval
		}
	}
)
