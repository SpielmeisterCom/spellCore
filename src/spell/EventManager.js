/**
 * @class spell.eventManager
 * @singleton
 */
define(
	'spell/EventManager',
	[
		'spell/data/forestMultiMap',
		'spell/Events',

		'spell/functions'
	],
	function(
		forestMultiMap,
		Events,

		_
	) {
		'use strict'


		/*
		 * private
		 */

		var wrapArray = function( x ) {
			return _.isArray( x ) ? x : [ x ]
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
				function( event ) {
					var handler = function( eventArgs ) {
						if( event.subscriber ) event.subscriber( eventArgs )

						eventManager.unsubscribe( event.scope, handler )

						lock()
					}

					eventManager.subscribe( event.scope, handler )
				}
			)
		}


		/*
		 * public
		 */

		function EventManager() {
			this.subscribers = forestMultiMap.create()
		}

		EventManager.prototype = {
			subscribe: function( scope, subscriber ) {
				var wrappedScope = wrapArray( scope )

				forestMultiMap.add(
					this.subscribers,
					wrappedScope,
					subscriber
				)

				this.publish( Events.SUBSCRIBE, [ wrappedScope, subscriber ] )
			},

			unsubscribe: function( scope, subscriber ) {
				var wrappedScope = wrapArray( scope )

				forestMultiMap.remove( this.subscribers, wrappedScope, subscriber )

				this.publish( Events.UNSUBSCRIBE, [ wrappedScope, subscriber ] )
			},

			unsubscribeAll: function( scope ) {
				var wrappedScope = wrapArray( scope )

				forestMultiMap.remove( this.subscribers, wrappedScope )

				this.publish( Events.UNSUBSCRIBE, [ wrappedScope ] )
			},

			publish: function( scope, eventArgs ) {
				var subscribersInScope = forestMultiMap.get( this.subscribers, wrapArray( scope ) ),
					wrappedEventArgs   = wrapArray( eventArgs )

				_.each( subscribersInScope, function( subscriber ) {
					subscriber.apply( undefined, wrappedEventArgs )
				} )

				return true
			},

			waitFor: function( scope, subscriber ) {
				waitForChainConfig = {
					events : [ {
						scope      : wrapArray( scope ),
						subscriber : subscriber
					} ]
				}

				return this
			},

			and: function( scope, subscriber ) {
				// check if pending chain call exists
				if( !waitForChainConfig ) throw 'A call to the method "and" must be chained to a previous call to "waitFor".'

				waitForChainConfig.events.push( {
					scope      : wrapArray( scope ),
					subscriber : subscriber
				} )

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
