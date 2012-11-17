define(
	"test/spell/math/mat3",
	[
		"spell/math/vec2",
		"spell/math/mat3"
	],
	function(
		vec2,
		mat3
		) {
		"use strict"

		var mat3Test = function( describe, it ) {

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
					var FLOAT_EPSILON = 0.000001,
						matrixA = mat3.create( [1,2,3,4,5,6,7,8,9] ),
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

				it("should set 3x3-identity matrix correctly", function() {
					var matrix = mat3.create()
					mat3.identity( matrix )

					if(!mat3.equal( [1,0,0, 0,1,0, 0,0,1], matrix)) {
						throw 'identity 3x3-matrix is wrong ' + mat3.str( matrix )
					}
				})

				it("should set the scale correctly on the identity matrix for a positive vec2", function() {
					var matrix = mat3.create(),
						matrixB = mat3.create(),
						vector = vec2.create([2.5, 4.5]),
						checkMatrix = [2.5, 0, 0, 0, 4.5, 0, 0, 0, 1]

					mat3.identity( matrix )
					mat3.scale( matrix, vector, matrix )

					if(!mat3.equal( matrix, checkMatrix )) {
						throw 'mat3.scale( matrix, vector, matrix ) syntax produced wrong result ' + mat3.str( matrix )
					}

					mat3.identity( matrix )
					var anotherMatrix = mat3.scale( matrix, vector )
					if(!mat3.equal( anotherMatrix, checkMatrix )) {
						throw 'anotherMatrix = mat3.scale( matrix, vector ) produced a wrong result ' + mat3.str( anotherMatrix )
					}

					mat3.identity( matrix )
					var anotherMatrix = mat3.scale( matrix, vector, matrixB )
					if(!mat3.equal( anotherMatrix, checkMatrix )) {
						throw 'anotherMatrix = mat3.scale( matrix, vector, matrixB ) produced a wrong result ' + mat3.str( matrixB )
					}
			})

			it("should set the scale correctly for any matrix for any vec2", function() {
				var matrix = mat3.create(),
					matrixB = mat3.create(),
					testMatrix = mat3.create([1,2,3,4,5,6,7,8,9]),
					vector = vec2.create([2.5, -4.5]),
					checkMatrix = [ 2.5, -9,  3,  10,  -22.5,  6,  7,  8,  9]

				mat3.set( testMatrix, matrix)
				mat3.scale( matrix, vector, matrix )

				if(!mat3.equal( matrix, checkMatrix )) {
					throw 'mat3.scale( matrix, vector, matrix ) syntax produced wrong result ' + mat3.str( matrix )
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

			it("should be able to extract the scale from a matrix that is only scaled", function() {
				var matrix = mat3.create(),
					scale  = vec2.create([2.5, -6.4])

				mat3.identity( matrix )
				mat3.scale( matrix, scale )
				var decomposedScale = mat3.getScale( matrix )

				if (!vec2.equal( decomposedScale, scale )) {
					throw 'decomposed scale ' + vec2.str( decomposedScale ) + ' does not match the scale ' + vec2.str( scale ) + ' matrix was ' + mat3.str( matrix )
				}
			})

			it("should rotate a identity 3x3-matrix correctly", function() {
				var matrix              = mat3.create(),
					testValues          = [ Math.PI, -Math.PI, Math.PI/2, -Math.PI/2, Math.PI/4, -Math.PI/4, Math.PI+Math.PI/2, -Math.PI-Math.PI/2 ]

				for (var i=0; i<testValues.length; i++) {
					var phi = testValues[ i ]

					//rotate left
					var rotationMatrix = mat3.create([ Math.cos(-phi), Math.sin(-phi), 0, -Math.sin(-phi), Math.cos(-phi), 0, 0, 0, 1])
					var testMatrix = mat3.create()
					mat3.identity( testMatrix )
					mat3.multiply( testMatrix, rotationMatrix, testMatrix )

					mat3.identity( matrix )
					mat3.rotate( matrix, phi )

					if (!mat3.equal(matrix, testMatrix)) {
						throw 'did not rotate matrix correctly by ' + phi + ' expected ' + mat3.str( testMatrix ) + ' got ' + mat3.str( matrix )
					}
				}
			})

			it("should be able to extract the rotation from a 3x3-matrix correctly", function() {
				var matrix              = mat3.create(),
					testValues          = [ Math.PI, -Math.PI, Math.PI/2, -Math.PI/2, Math.PI/4, -Math.PI/4, Math.PI+Math.PI/2, -Math.PI-Math.PI/2 ]

				for (var i=0; i<testValues.length; i++) {
					var phi = testValues[ i ]

					//rotate left
					mat3.identity( matrix )
					mat3.rotate( matrix, phi )

					var decomposedRotation = mat3.getRotation( matrix )

					if (phi !== decomposedRotation) {
						throw 'could not extract rotation from 3x3 matrix expected ' + phi + ' got ' + decomposedRotation
					}
				}
			})

			it("should compose and decompose for a combined transform, scale, rotation correctly", function() {
				var matrix = mat3.create()
				mat3.identity( matrix )
			})
		})

		}

		return mat3Test
	}


)