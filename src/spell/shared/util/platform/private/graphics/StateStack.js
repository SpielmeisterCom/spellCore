define(
	'spell/shared/util/platform/private/graphics/StateStack',
	[
		'spell/shared/util/platform/private/nativeType/createFloatArray',

		'spell/math/mat3',
		'spell/functions'
	],
	function(
		createFloatArray,

		mat3,
		_
	) {
		'use strict'


		/*
		 * private
		 */

		var createState = function( opacity, color, lineColor, matrix, viewMatrix ) {
			return {
				opacity     : opacity,
				color       : color,
				lineColor   : lineColor,
				matrix      : matrix,
				viewMatrix  : viewMatrix
			}
		}

		var createDefaultState = function() {
			var opacity     = 1.0,
				color       = createFloatArray( 4 ),
				lineColor   = createFloatArray( 4 ),
				matrix      = mat3.create(),
				viewMatrix  = mat3.create()

			color[ 0 ] = 1.0
			color[ 1 ] = 1.0
			color[ 2 ] = 1.0
			color[ 3 ] = 1.0

			lineColor[ 0 ] = 1.0
			lineColor[ 1 ] = 1.0
			lineColor[ 2 ] = 1.0
			lineColor[ 3 ] = 1.0

			mat3.identity( matrix )
			mat3.identity( viewMatrix )

			return createState( opacity, color, lineColor, matrix, viewMatrix )
		}

		var copyState = function( source, target ) {
			target.opacity = source.opacity

			target.color[ 0 ] = source.color[ 0 ]
			target.color[ 1 ] = source.color[ 1 ]
			target.color[ 2 ] = source.color[ 2 ]
			target.color[ 3 ] = source.color[ 3 ]

			target.lineColor[ 0 ] = source.lineColor[ 0 ]
			target.lineColor[ 1 ] = source.lineColor[ 1 ]
			target.lineColor[ 2 ] = source.lineColor[ 2 ]
			target.lineColor[ 3 ] = source.lineColor[ 3 ]

			mat3.set( source.matrix, target.matrix )
			mat3.set( source.viewMatrix, target.viewMatrix )
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
