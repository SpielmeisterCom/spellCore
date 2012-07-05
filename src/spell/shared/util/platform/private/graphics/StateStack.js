define(
	'spell/shared/util/platform/private/graphics/StateStack',
	[
		'spell/shared/util/platform/private/nativeType/createFloatArray',

		'spell/math/mat4',
		'spell/functions'
	],
	function(
		createFloatArray,

		mat4,
		_
	) {
		'use strict'


		/*
		 * private
		 */

		var createState = function( opacity, fillStyleColor, matrix ) {
			return {
				opacity : opacity,
				color   : fillStyleColor,
				matrix  : matrix
			}
		}

		var createDefaultState = function() {
			var opacity        = 1.0,
				fillStyleColor = createFloatArray( 4 ),
				matrix         = mat4.create()

			fillStyleColor[ 0 ] = 1.0
			fillStyleColor[ 1 ] = 1.0
			fillStyleColor[ 2 ] = 1.0
			fillStyleColor[ 3 ] = 1.0

			mat4.identity( matrix )

			return createState( opacity, fillStyleColor, matrix )
		}

		var copyState = function( source, target ) {
			target.opacity = source.opacity

			target.color[ 0 ] = source.color[ 0 ]
			target.color[ 1 ] = source.color[ 1 ]
			target.color[ 2 ] = source.color[ 2 ]
			target.color[ 3 ] = source.color[ 3 ]

			mat4.set( source.matrix, target.matrix )
		}


		/*
		 * public
		 */

		var StateStack = function( depth ) {
			this.depth = depth
			this.stack = _.range( depth )
			this.index = 0

			// initializing stack
			for( var i = 0, stack = this.stack; i < depth; i++ ) {
				stack[ i ] = createDefaultState()
			}
		}

		StateStack.prototype = {
			pushState : function() {
				var index = this.index,
					stack = this.stack

				if( index === this.depth -1 ) throw 'Can not push state. Maximum state stack depth of ' + this.depth + ' was reached.'


				copyState( stack[ index ], stack[ ++this.index ] )
			},
			popState : function() {
				var index = this.index

				if( index > 0 ) {
					this.index--

				} else {
					throw 'Can not pop state. The state stack is already depleted.'
				}
			},
			getTop : function() {
				return this.stack[ this.index ]
			}
		}

		return StateStack
	}
)
