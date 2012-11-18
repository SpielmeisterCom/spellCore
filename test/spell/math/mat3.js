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

				it("should be able to extract positive scales from a matrix that is only scaled", function() {
					var matrix = mat3.create(),
						scales = [
							[2.5, 6.4],
							[1,1],
							[0,0]
						],
						decomposedScale = vec2.create()

					for (var i=0; i<scales.length; i++) {
						var scale = scales[i]

						mat3.identity( matrix )
						mat3.scale( matrix, scale )
						mat3.rotateZ( matrix, 0 )
						mat3.translate( matrix, [0,0] )

						var rotation = mat3.decompose( matrix, decomposedScale )
						if (!vec2.equal( decomposedScale, scale )) {
							throw 'decomposed scale ' + vec2.str( decomposedScale ) + ' does not match the scale ' + vec2.str( scale ) + ' rotation: ' + rotation + ' matrix was ' + mat3.str( matrix )
						}
					}
				})

				it("should be able to extract negative scales from a matrix that is only scaled", function() {
					var matrix = mat3.create(),
						scales = [
							[-2.5, -6.4],
							[-1,-1],
							[0,0]
						],
						decomposedScale = vec2.create()

					for (var i=0; i<scales.length; i++) {
						var scale = scales[i]

						mat3.identity( matrix )
						mat3.scale( matrix, scale )
						mat3.rotateZ( matrix, 0 )
						mat3.translate( matrix, [0,0] )

						var rotation = mat3.decompose( matrix, decomposedScale )
						if (!vec2.equal( decomposedScale, scale )) {
							throw 'decomposed scale ' + vec2.str( decomposedScale ) + ' does not match the scale ' + vec2.str( scale ) + ' rotation: ' + rotation + ' matrix was ' + mat3.str( matrix )
						}
					}
				})

				it("should be able to extract mixed scales from a matrix that is only scaled", function() {
					var matrix = mat3.create(),
						scales = [
							[-2.5, 6.4],
							[1,-1],
							[0,0]
						],
						decomposedScale = vec2.create()

					for (var i=0; i<scales.length; i++) {
						var scale = scales[i]

						mat3.identity( matrix )
						mat3.scale( matrix, scale )
						mat3.rotateZ( matrix, 0 )
						mat3.translate( matrix, [0,0] )

						var rotation = mat3.decompose( matrix, decomposedScale )
						if (!vec2.equal( decomposedScale, scale )) {
							throw 'decomposed scale ' + vec2.str( decomposedScale ) + ' does not match the scale ' + vec2.str( scale ) + ' rotation: ' + rotation + ' matrix was ' + mat3.str( matrix )
						}
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

				it("should return the correct X-axis rotation matrix", function(){

					for (var angle = -2 * Math.PI; angle <= 2*Math.PI; angle += Math.PI/8 ) {

						//see http://en.wikipedia.org/wiki/Rotation_matrix
						var checkMatrix = [
							1,
							0,
							0,

							0,
							Math.cos( angle ),
							Math.sin( angle ),

							0,
							-Math.sin(angle),
							Math.cos(angle)
						]

						var matrix = mat3.createRotateXMatrix(angle)

						if (!mat3.equal(matrix, checkMatrix)) {
							throw 'expected ' + mat3.str(checkMatrix) + ' got ' + mat3.str(matrix)
						}
					}
				})

				it("should return the correct Y-axis rotation matrix", function(){

					for (var angle = -2 * Math.PI; angle <= 2*Math.PI; angle += Math.PI/8 ) {

						//see http://en.wikipedia.org/wiki/Rotation_matrix

						var checkMatrix = [
							Math.cos( angle ),
							0,
							-Math.sin( angle ),

							0,
							1,
							0,

							Math.sin( angle ),
							0,
							Math.cos( angle )
						]

						var matrix = mat3.createRotateYMatrix(angle)

						if (!mat3.equal(matrix, checkMatrix)) {
							throw 'expected ' + mat3.str(checkMatrix) + ' got ' + mat3.str(matrix)
						}
					}
				})

				it("should return the correct Z-axis rotation matrix", function(){

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

						var matrix = mat3.createRotateZMatrix(angle)

						if (!mat3.equal(matrix, checkMatrix)) {
							throw 'expected ' + mat3.str(checkMatrix) + ' got ' + mat3.str(matrix)
						}
					}
				})

				it("rotateX should rotate a identity 3x3-matrix around the X-axis correctly", function() {
					var matrix              = mat3.create(),
						checkMatrix         = mat3.create()

					for ( var angle=-2*Math.PI; angle<= 2*Math.PI; angle+=Math.PI/8 ) {
						//rotate left

						mat3.identity( checkMatrix )
						mat3.multiply( checkMatrix, mat3.createRotateXMatrix(angle) )

						mat3.identity( matrix )
						mat3.rotateX( matrix, angle )

						if (!mat3.equal(matrix, checkMatrix)) {
							throw 'did not rotate matrix correctly by ' + angle + ' expected ' + mat3.str( checkMatrix ) + ' got ' + mat3.str( matrix )
						}
					}
				})

				it("rotateY should rotate a identity 3x3-matrix around the Y-axis correctly", function() {
					var matrix              = mat3.create(),
						checkMatrix         = mat3.create()

					for ( var angle=-2*Math.PI; angle<= 2*Math.PI; angle+=Math.PI/8 ) {
						//rotate left

						mat3.identity( checkMatrix )
						mat3.multiply( checkMatrix, mat3.createRotateYMatrix(angle) )

						mat3.identity( matrix )
						mat3.rotateY( matrix, angle )

						if (!mat3.equal(matrix, checkMatrix)) {
							throw 'did not rotate matrix correctly by ' + angle + ' expected ' + mat3.str( checkMatrix ) + ' got ' + mat3.str( matrix )
						}
					}
				})

				it("rotateZ should rotate a identity 3x3-matrix around the Z-axis correctly", function() {
					var matrix              = mat3.create(),
						checkMatrix         = mat3.create()

					for ( var angle=-2*Math.PI; angle<= 2*Math.PI; angle+=Math.PI/8 ) {
						//rotate left

						mat3.identity( checkMatrix )
						mat3.multiply( checkMatrix, mat3.createRotateZMatrix(angle) )

						mat3.identity( matrix )
						mat3.rotateZ( matrix, angle )

						if (!mat3.equal(matrix, checkMatrix)) {
							throw 'did not rotate matrix correctly by ' + angle + ' expected ' + mat3.str( checkMatrix ) + ' got ' + mat3.str( matrix )
						}
					}
				})

				it("rotate should produce same results like calling rotateZ, rotateY, rotateX ", function() {
					var matrix              = mat3.create(),
						checkMatrix         = mat3.create()

					for ( var angle=-2*Math.PI; angle<= 2*Math.PI; angle+=Math.PI/8 ) {
						mat3.identity( checkMatrix )
						mat3.rotateZ( checkMatrix, angle )
						mat3.rotateY( checkMatrix, angle )
						mat3.rotateX( checkMatrix, angle )

						mat3.identity( matrix )
						mat3.rotate( matrix, angle, 0, 0, 1)
						mat3.rotate( matrix, angle, 0, 1, 0)
						mat3.rotate( matrix, angle, 1, 0, 0)

						if (!mat3.equal(matrix, checkMatrix)) {
							throw 'did not rotate matrix correctly by ' + angle + ' expected ' + mat3.str( checkMatrix ) + ' got ' + mat3.str( matrix )
						}
					}
				})

				it("should be able to extract the euler angle for the X-axis correctly", function() {
					var matrix              = mat3.create()

					for( var angle = -2*Math.PI; angle <= 2 * Math.PI; angle += Math.PI / 8 ) {
						mat3.identity( matrix )
						mat3.rotateX( matrix, angle )

						var decomposedRotation = mat3.getEulerX( matrix )

						if(Math.abs(angle-decomposedRotation) > FLOAT_EPSILON &&
							(Math.abs(angle-decomposedRotation)-2*Math.PI) > FLOAT_EPSILON) {
							throw 'expected ' + angle + ' got ' + decomposedRotation + ' difference ' + (angle-decomposedRotation)
						}
					}
				})

				it("should be able to extract the euler angle for the Y-axis correctly", function() {
					var matrix              = mat3.create()

					for( var angle = -2*Math.PI; angle <= 2 * Math.PI; angle += Math.PI / 8 ) {
						mat3.identity( matrix )
						mat3.rotateY( matrix, angle )

						var decomposedRotation = mat3.getEulerY( matrix )

						if(Math.abs(angle-decomposedRotation) > FLOAT_EPSILON &&
							(Math.abs(angle-decomposedRotation)-2*Math.PI) > FLOAT_EPSILON) {
							throw 'expected ' + angle + ' got ' + decomposedRotation + ' difference ' + (angle-decomposedRotation)
						}
					}
				})

				it("should be able to extract the euler angle for the Z-axis correctly", function() {
					var matrix              = mat3.create()

					for( var angle = -2*Math.PI; angle <= 2 * Math.PI; angle += Math.PI / 8 ) {
						mat3.identity( matrix )
						mat3.rotateZ( matrix, angle )

						var decomposedRotation = mat3.getEulerZ( matrix )

						if(Math.abs(angle-decomposedRotation) > FLOAT_EPSILON &&
							(Math.abs(angle-decomposedRotation)-2*Math.PI) > FLOAT_EPSILON) {
							throw 'expected ' + angle + ' got ' + decomposedRotation + ' difference ' + (angle-decomposedRotation)
						}
					}
				})

				it("should be able to extract the euler angles for the X,Y and Z-axis correctly", function() {
					var matrix              = mat3.create(),
						errors              = []

					for( var angleX = -Math.PI; angleX <= Math.PI; angleX += Math.PI / 8 ) {
						for( var angleY = -Math.PI/2; angleY <= Math.PI/2; angleY += Math.PI / 8 ) {
							for( var angleZ = -Math.PI; angleZ <= Math.PI; angleZ += Math.PI / 8 ) {

								mat3.identity( matrix )

								mat3.rotateZ( matrix, angleZ )
								mat3.rotateY( matrix, angleY )
								mat3.rotateX( matrix, angleX )

								var eulerX      = mat3.getEulerX( matrix ),
									eulerY      = mat3.getEulerY( matrix ),
									eulerZ      = mat3.getEulerZ( matrix )

								var angles = vec3.create([ angleX, angleY, angleZ ]),
									eulers = vec3.create([ eulerX, eulerY, eulerZ])


								if ( !vec3.equal(angles, eulers)) {
									errors.push('expected ' + vec3.str(angles) + ' got ' + vec3.str(eulers))

								}
							}
						}
					}

					if (errors.length > 0) {
						throw errors.join("\n")
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
					scales      = [
						[ 1, 1 ],
						[ -1, -1 ],
						[ -1, 1 ],
						[ 1, -1 ],
						[ 0, 1 ],
						[ 1, 0 ]
					],
					translations   = [
						[ 0,0 ],
						[ 1,-1 ],
						[ -1,1 ],
						[ 0,1 ],
						[ 1,0 ],
						[ 1,1 ],
						[ 15.3, -14 ]
					],
					checkScale = vec2.create(),
					checkAngle = new Number(),
					checkTranslation = vec2.create()


				for (var j=0; j<scales.length; j++) {
					var scale = scales[j]

					for (var i=0; i<translations.length; i++) {
						var translation = translations[i]

						for (var angle = -2 * Math.PI; angle <= 2*Math.PI; angle += Math.PI/4 ) {

							mat3.identity( matrixA )
							mat3.scale( matrixA, scale )
							mat3.rotateZ( matrixA, angle )
							mat3.translate( matrixA, translation )


							checkAngle = mat3.decompose( matrixA, checkScale, checkTranslation )

							mat3.identity( matrixB )
							mat3.scale( matrixB, checkScale )
							mat3.rotateZ( matrixB, checkAngle )
							mat3.translate( matrixB, checkTranslation )

							if ( !mat3.equal( matrixA, matrixB ) ) {
								var error = 'checked ' + vec2.str(scale) + ' rotation ' + angle + ' translation ' + vec2.str(translation) + ' matrix ' + mat3.str( matrixA ) + "\n" +
											'got ' + vec2.str(checkScale) + ' rotation ' + checkAngle + ' translation ' + vec2.str(checkTranslation) +  ' matrix ' + mat3.str( matrixB )

								throw error

							} else {
								var success = 'worked ' + vec2.str(scale) + ' rotation ' + angle + ' translation ' + vec2.str(translation) + ' matrix ' + mat3.str( matrixA ) + "\n"

								//console.log( success )
							}
						}
					}
				}
			})
		})

		}

		return mat3Test
	}


)