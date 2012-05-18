define(
	'spell/shared/util/EventManager',
	[
		'spell/shared/util/forestMultiMap',
		'spell/shared/util/Events',

		'spell/shared/util/platform/underscore'
	],
	function(
		forestMultiMap,
		Events,

		_
	) {
		'use strict'


		/**
		 * private
		 */

		var normalize = function( scope ) {
			return ( _.isArray( scope ) ? scope : [ scope ] )
		}

		var waitForChainConfig = false

		var registerWaitForChain = function( eventManager, config ) {
			var callback = config.callback

			// the lock is released after the n-th call ( n := config.events.length )
			var lock = _.after(
				config.events.length,
				function() {
					callback()
				}
			)

			// wire up all events to probe the lock
			_.each(
				config.events,
				function( scope ) {
					eventManager.subscribe( scope, lock )
				}
			)
		}


		/**
		 * public
		 */

		function EventManager() {
			this.subscribers = forestMultiMap.create()
		}

		EventManager.prototype = {
			subscribe: function(
				scope,
				subscriber
			) {
				scope = normalize( scope )

				forestMultiMap.add(
					this.subscribers,
					scope,
					subscriber
				)

				this.publish( Events.SUBSCRIBE, [ scope, subscriber ] )
			},

			unsubscribe: function(
				scope,
				subscriber
			) {
				scope = normalize( scope )

				forestMultiMap.remove(
					this.subscribers,
					scope,
					subscriber
				)

				this.publish( Events.UNSUBSCRIBE, [ scope, subscriber ] )
			},

			publish: function(
				scope,
				eventArgs
			) {
				scope = normalize( scope )

				var subscribersInScope = forestMultiMap.get(
					this.subscribers,
					scope
				)

				_.each( subscribersInScope, function( subscriber ) {
					subscriber.apply( undefined, eventArgs )
				} )

				return true
			},

			waitFor: function( scope ) {
				waitForChainConfig = {
					events : [ scope ]
				}

				return this
			},

			and: function( scope ) {
				// check if pending chain call exists
				if( !waitForChainConfig ) throw 'A call to the method "and" must be chained to a previous call to "waitFor".'


				waitForChainConfig.events.push( scope )

				return this
			},

			resume: function( callback ) {
				// check if pending chain call exists, return otherwise
				if( !waitForChainConfig ) throw 'A call to the method "resume" must be chained to a previous call to "waitFor" or "and".'


				waitForChainConfig.callback = callback

				registerWaitForChain( this, waitForChainConfig )

				waitForChainConfig = false
			}
		}

		return EventManager
	}
)
