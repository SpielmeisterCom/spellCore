define(
	'spell/component/visualObject',
	function() {
		'use strict'


		var visualObject = function( spell ) {
			this._layer = 1
			this._pass = 'world'
			this._opacity = 1
			this._worldOpacity = 1
		}

		visualObject.prototype = {
//          Commented out because for compatibility to iOS 5.1
//			get layer() {
//				return this._layer
//			},
//			set layer( x ) {
//				this._layer = x
//			},
//			get pass() {
//				return this._pass
//			},
//			set pass( x ) {
//				this._pass = x
//			},
//			get opacity() {
//				return this._opacity
//			},
//			set opacity( x ) {
//				this._opacity = x
//			},
//			get worldOpacity() {
//				return this._worldOpacity
//			},
//			set worldOpacity( x ) {
//				this._worldOpacity = x
//			},
//			get worldLayer() {
//				return this._worldLayer
//			},
//			set worldLayer( worldLayer ) {
//				this._worldLayer = worldLayer
//			}
		}

		return visualObject
	}
)
