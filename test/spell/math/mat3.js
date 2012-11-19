define(
	"test/spell/math/mat3",
	[
		"spell/math/vec2",
		"spell/math/vec3",
		"spell/math/mat3"
	],
	function(
		vec2,
		vec3,
		mat3
		) {
		"use strict"

		var mat3Test = function( describe, it ) {
			var FLOAT_EPSILON = 0.000001

			describe("spell.math.mat3", function() {
				it("should create an empty matrix correctly", function() {
						var matrix = mat3.create()
						if(
							matrix[0] !== 0 ||
							matrix[1] !== 0 ||
							matrix[2] !== 0 ||

							matrix[3] !== 0 ||
							matrix[4] !== 0 ||
							matrix[5] !== 0 ||

							matrix[6] !== 0 ||
							matrix[7] !== 0 ||
							matrix[8] !== 0) {

							throw 'wrong empty matrix'
						}
					})

				it("should create an matrix from another matrix correctly", function() {
						var matrix = mat3.create([1,2,3,4,5,6,7,8,9])
						if(
							matrix[0] !== 1 ||
							matrix[1] !== 2 ||
							matrix[2] !== 3 ||

							matrix[3] !== 4 ||
							matrix[4] !== 5 ||
							matrix[5] !== 6 ||

							matrix[6] !== 7 ||
							matrix[7] !== 8 ||
							matrix[8] !== 9) {

							throw 'wrong new matrix'
						}
					})

	            it("should implement the str function correctly", function() {
						var matrix      = mat3.create( [1,2,3,4,5,6,7,8,9] ),
							matrixStr   = mat3.str( matrix),
							correctStr  = '[1, 2, 3, 4, 5, 6, 7, 8, 9]'

						if (matrixStr !== correctStr) {
							throw 'mat3.str( matrix ) produced ' + matrixStr + ' but ' + correctStr + ' was excpected'
						}
					})

				it("should implement the equal function correctly", function() {
						var matrixA = mat3.create( [1,2,3,4,5,6,7,8,9] ),
							matrixB = mat3.create( [1,2,3,4,5,6,7,8,9] )

						if(!mat3.equal( matrixA, matrixB )) {
							throw 'matrixA ' + mat3.str( matrixA ) + ' is not equal matrixB ' + mat3.str( matrixB )
						}

						//checkout within EPSILON
						matrixA[0] += FLOAT_EPSILON
						matrixA[1] += FLOAT_EPSILON
						matrixA[2] += FLOAT_EPSILON
						matrixA[3] += FLOAT_EPSILON
						matrixA[4] += FLOAT_EPSILON
						matrixA[5] += FLOAT_EPSILON
						matrixA[6] += FLOAT_EPSILON
						matrixA[7] += FLOAT_EPSILON
						matrixA[8] += FLOAT_EPSILON

						if(!mat3.equal( matrixA, matrixB )) {
							throw 'within EPSILON: matrixA ' + mat3.str( matrixA ) + ' is not equal matrixB ' + mat3.str( matrixB )
						}

						//check beyond EPSILON
						matrixA[0] += FLOAT_EPSILON
						matrixA[1] += FLOAT_EPSILON
						matrixA[2] += FLOAT_EPSILON
						matrixA[3] += FLOAT_EPSILON
						matrixA[4] += FLOAT_EPSILON
						matrixA[5] += FLOAT_EPSILON
						matrixA[6] += FLOAT_EPSILON
						matrixA[7] += FLOAT_EPSILON
						matrixA[8] += FLOAT_EPSILON

						if(mat3.equal( matrixA, matrixB )) {
							throw 'beyond EPSILON: matrixA ' + mat3.str( matrixA ) + ' is not equal matrixB ' + mat3.str( matrixB )
						}

					})

				it("should implement the set function correctly", function() {
						var matrixA = mat3.create([1,2,3,4,5,6,7,8,9]),
							matrixB = mat3.create([9,8,7,6,5,4,3,2,1])

						mat3.set(matrixA, matrixB)

						if (!mat3.equal(matrixA, matrixB)) {
							throw 'matrixA does not equal matrixB'
						}
					})

				it("should implement setDiagonalValues and setDiagonalVec3 correctly", function() {
					var matrixA     = mat3.create(),
						matrixB     = mat3.create(),
						checkMatrix = [ 1, 0, 0, 0, 2, 0, 0, 0, 3 ]


					mat3.setDiagonalValues( matrixA, 1, 2, 3 )
					mat3.setDiagonalVec3( matrixB, [ 1, 2, 3 ])

					if (!mat3.equal(checkMatrix, matrixA)) {
						throw 'expected ' + mat3.str(checkMatrix ) + ' got ' + mat3.str(matrixA)
					}

					if (!mat3.equal(checkMatrix, matrixB)) {
						throw 'expected ' + mat3.str(checkMatrix ) + ' got ' + mat3.str(matrixB)
					}

				})

				it("should set 3x3-identity matrix correctly", function() {
						var matrix = mat3.create()
						mat3.identity( matrix )

						if(!mat3.equal( [1,0,0, 0,1,0, 0,0,1], matrix)) {
							throw 'identity 3x3-matrix is wrong ' + mat3.str( matrix )
						}
					})

				it("should return the correct scale matrix", function() {

					var matrix = mat3.createScaleMatrix( 1, 2, 3 ),
						checkMatrix = [1, 0, 0, 0, 2, 0, 0, 0, 3]


					if (!mat3.equal(checkMatrix, matrix)) {
						throw 'expected ' + mat3.str(checkMatrix ) + ' got ' + mat3.str(matrix)

					}
				})

				it("should set the scale correctly for any matrix for a vec2", function() {
					var matrix = mat3.create(),
						matrixB = mat3.create(),
						testMatrix = mat3.create([1,2,3,4,5,6,7,8,9]),
						vector = vec2.create([2.5, -4.5]),
						scaleMatrix = mat3.createScaleMatrix(vector[0], vector[1], 1),
						checkMatrix = mat3.create()

					mat3.multiply( testMatrix, scaleMatrix, checkMatrix )


					mat3.set( testMatrix, matrix)
					mat3.scale( matrix, vector )

					if(!mat3.equal( matrix, checkMatrix )) {
						throw 'mat3.scale( matrix, vector ) syntax produced wrong result expected ' + mat3.str(checkMatrix) + ' got ' + mat3.str( matrix )
					}

					mat3.set( testMatrix, matrix)
					var anotherMatrix = mat3.scale( matrix, vector )

					if(!mat3.equal( anotherMatrix, checkMatrix )) {
						throw 'anotherMatrix = mat3.scale( matrix, vector ) produced a wrong result ' + mat3.str( anotherMatrix )
					}

					mat3.set( testMatrix, matrix)
					var anotherMatrix = mat3.scale( matrix, vector, matrixB )
					if(!mat3.equal( anotherMatrix, checkMatrix )) {
						throw 'anotherMatrix = mat3.scale( matrix, vector, matrixB ) produced a wrong result ' + mat3.str( matrixB )
					}

				})

				it("should correctly multiply with other 3x3 matrices", function() {
					var matrixA = mat3.create( [12.2, 3, 6, 1, -4, 7, 2, 5, 8] ),
						matrixB = mat3.create( [-8, 3, 6, 1, 4, 7, 2, 5, 2.4]),
						expectedResultA = mat3.create( [ -82.6, -6, 21, 30.2, 22, 90, 34.2, -2, 66.2 ]),
						expectedResultB = mat3.create( [ -82.6, 78.6, 108.6, 2, 22, -5.2, 5, 66, 66.2 ]),
						result  = mat3.create()


					//Multiply A*B
					mat3.multiply(matrixA, matrixB, result)

					if (!mat3.equal(result, expectedResultA)) {
						throw 'Multiplying A*B failed. expected ' + mat3.str(expectedResultA) + ' got ' + mat3.str( result )
					}

					//Multiply B*A
					mat3.multiply(matrixB, matrixA, result)

					if (!mat3.equal(result, expectedResultB)) {
						throw 'Multiplying B*A failed. expected ' + mat3.str(expectedResultB) + ' got ' + mat3.str( result )
					}


				})

				it("should return the correct rotation matrix", function(){

					for (var angle = -2 * Math.PI; angle <= 2*Math.PI; angle += Math.PI/8 ) {

						//see http://en.wikipedia.org/wiki/Rotation_matrix
						var checkMatrix = [
							Math.cos( angle ),
							Math.sin( angle ),
							0,

							-Math.sin( angle ),
							Math.cos( angle ),
							0,

							0,
							0,
							1
						]

						var matrix = mat3.createRotateMatrix(angle)

						if (!mat3.equal(matrix, checkMatrix)) {
							throw 'expected ' + mat3.str(checkMatrix) + ' got ' + mat3.str(matrix)
						}
					}
				})

				it("rotate should rotate a identity 3x3-matrix around correctly", function() {
					var matrix              = mat3.create(),
						checkMatrix         = mat3.create()

					for ( var angle=-2*Math.PI; angle<= 2*Math.PI; angle+=Math.PI/8 ) {
						//rotate left

						mat3.identity( checkMatrix )
						mat3.multiply( checkMatrix, mat3.createRotateMatrix(angle) )

						mat3.identity( matrix )
						mat3.rotate( matrix, angle )

						if (!mat3.equal(matrix, checkMatrix)) {
							throw 'did not rotate matrix correctly by ' + angle + ' expected ' + mat3.str( checkMatrix ) + ' got ' + mat3.str( matrix )
						}
					}
				})

				it("should create a correct translate matrix", function() {
					var matrix = mat3.createTranslateMatrix(12, -4),
						checkMatrix = [ 1, 0, 0, 0, 1, 0, 12, -4, 1 ]

					if (!mat3.equal(matrix, checkMatrix)) {
						throw 'expected ' + mat3.str(checkMatrix) + ' got ' + mat3.str(matrix)
					}
				})

				it("translating the identity 3x3-matrix should be the same as the translate matrix", function() {
					var matrix  = mat3.create(),
						translateMatrix = mat3.createTranslateMatrix(12, -4)

					mat3.identity(matrix)
					mat3.translate(matrix, [12, -4])

 					if (!mat3.equal(matrix, translateMatrix)) {
						throw 'expected ' + mat3.str(translateMatrix) + ' got ' + mat3.str(matrix)
					}
				})


			it("should compose and decompose for a combined translate, scale, rotation correctly", function() {
				var matrixA      = mat3.create(),
					matrixB      = mat3.create(),
					invMatrix    = mat3.create(),
					scales      = [
						[ 1.1, 1.2 ],
						[ -1.3, -1.4 ],
						[ -1, 1 ],
						[ -1, -1 ],
						[ 1, -1.5 ]//,
					//	[ 0, 1 ],
					//	[ 1, 0 ]
					],
					translations   = [
						[ 0,0 ],
						[ 1,-1 ],
						[ -1,1 ],
						[ 0,1 ],
						[ 1,0 ],
						[ 1,1 ],
						[ 15.3, -14 ],
						[ -115.32, -13 ]
					],
					skew = vec2.create(),
					checkScale = vec2.create(),
					checkTranslation = vec2.create(),
					checkSkews = vec2.create(),
					errors = [ ]


				for (var j=0; j<scales.length; j++) {
					var scale = scales[j]

					for (var i=0; i<translations.length; i++) {
						var translation = translations[i]

						for (var angle = -2 * Math.PI; angle <= 2*Math.PI; angle += Math.PI/2 ) {

							mat3.identity( matrixA )
							mat3.scale( matrixA, scale )
							//mat3.skew( matrixA, skew )
							mat3.rotate( matrixA, angle )
							mat3.translate( matrixA, translation )


							mat3.decompose( matrixA, checkScale, checkSkews, checkTranslation )


							mat3.identity( matrixB )
							mat3.scale( matrixB, checkScale )
							mat3.skew( matrixB, checkSkews )
							//mat3.rotate( matrixB, 0 )
							mat3.translate( matrixB, checkTranslation )

							if ( !mat3.equal( matrixA, matrixB ) ) {
								var error = 'checked scale ' + vec2.str(scale) + ' angle ' + angle + ' translation ' + vec2.str(translation) + ' matrix ' + mat3.str( matrixA ) + "\n" +
											'got     scale ' + vec2.str(checkScale) + ' skews ' + vec2.str( checkSkews ) + ' translation ' + vec2.str(checkTranslation) +  ' matrix ' + mat3.str( matrixB ) + "\n"

								errors.push( error )

							} else {
								var success = 'worked ' + vec2.str(scale) + ' rotation ' + angle + ' translation ' + vec2.str(translation) + ' matrix ' + mat3.str( matrixA ) + "\n"

								//console.log( success )
							}
						}
					}
				}


				if (errors.length) {
					throw errors.join("\n")
				}
			})
		})

		}

		return mat3Test
	}


)