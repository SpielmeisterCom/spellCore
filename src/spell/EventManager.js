/**
 * The EventManager offers access to the engine internal message bus. It can be used to implement observer behavior.
 *
 * @class spell.eventManager
 * @singleton
 */
define(
	'spell/EventManager',
	[
		'spell/data/forestMultiMap',

		'spell/functions'
	],
	function(
		forestMultiMap,

		_
	) {
		'use strict'


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


		function EventManager() {
			this.subscribers = forestMultiMap.create()
		}

		EventManager.prototype = {
			/**
			 * Subscribes a subscriber to the specified event scope.
			 *
			 * Example:
			 *
			 *     var processTransformCreated = function( component, entityId ) {
			 *         ...
			 *     }
			 *
			 *     spell.eventManager.subscribe(
			 *         [ spell.eventManager.EVENT.COMPONENT_CREATED, 'spell.component.2d.transform' ],
			 *         processTransformCreated
			 *     )
			 *
			 * @param {String|String[]} scope can either be a string or an array of strings specifying the event scope
			 * @param {Function} subscriber the callback function
			 */
			subscribe : function( scope, subscriber ) {
				var wrappedScope = wrapArray( scope )

				forestMultiMap.add(
					this.subscribers,
					wrappedScope,
					subscriber
				)

				this.publish( this.EVENT.SUBSCRIBE, [ wrappedScope, subscriber ] )
			},

			/**
			 * Unsubscribes a subscriber from the specified event scope.
			 *
			 * Example:
			 *
			 *     var processTransformCreated = function( component, entityId ) {
			 *         ...
			 *     }
			 *
			 *     spell.eventManager.unsubscribe(
			 *         [ spell.eventManager.EVENT.COMPONENT_CREATED, 'spell.component.2d.transform' ],
			 *         processTransformCreated
			 *     )
			 *
			 * @param {String|String[]} scope can either be a string or an array of strings specifying the event scope
			 * @param {Function} subscriber the callback function
			 */
			unsubscribe : function( scope, subscriber ) {
				var wrappedScope = wrapArray( scope )

				forestMultiMap.remove( this.subscribers, wrappedScope, subscriber )

				this.publish( this.EVENT.UNSUBSCRIBE, [ wrappedScope, subscriber ] )
			},

			/**
			 * Unsubscribes all subscribers from the specified event scope.
			 *
			 * Example:
			 *
			 *     spell.eventManager.unsubscribeAll(
			 *         [ spell.eventManager.EVENT.COMPONENT_CREATED, 'spell.component.2d.transform' ]
			 *     )
			 *
			 * @param {String|String[]} scope can either be a string or an array of strings specifying the event scope
			 */
			unsubscribeAll : function( scope ) {
				var wrappedScope = wrapArray( scope )

				forestMultiMap.remove( this.subscribers, wrappedScope )

				this.publish( this.EVENT.UNSUBSCRIBE, [ wrappedScope ] )
			},

			/**
			 * Publishes the event to all subscribers which are subscribed to the specified event scope.
			 *
			 * Example:
			 *
			 *     spell.eventManager.publish( spell.eventManager.EVENT.SERVER_CONNECTION_ESTABLISHED, [ response.status ] )
			 *
			 * @param {String|String[]} scope can either be a string or an array of strings specifying the event scope
			 * @param {Array} eventArgs an array of event arguments
			 */
			publish : function( scope, eventArgs ) {
				var subscribersInScope = forestMultiMap.get( this.subscribers, wrapArray( scope ) ),
					wrappedEventArgs   = wrapArray( eventArgs )

				_.each( subscribersInScope, function( subscriber ) {
					subscriber.apply( undefined, wrappedEventArgs )
				} )

				return true
			},

			waitFor : function( scope, subscriber ) {
				waitForChainConfig = {
					events : [ {
						scope      : wrapArray( scope ),
						subscriber : subscriber
					} ]
				}

				return this
			},

			and : function( scope, subscriber ) {
				// check if pending chain call exists
				if( !waitForChainConfig ) throw 'A call to the method "and" must be chained to a previous call to "waitFor".'

				waitForChainConfig.events.push( {
					scope      : wrapArray( scope ),
					subscriber : subscriber
				} )

				return this
			},

			resume : function( callback ) {
				// check if pending chain call exists, return otherwise
				if( !waitForChainConfig ) throw 'A call to the method "resume" must be chained to a previous call to "waitFor" or "and".'

				waitForChainConfig.callback = callback

				registerWaitForChain( this, waitForChainConfig )

				waitForChainConfig = false
			},

			/**
			 * Map of supported events.
			 */
			EVENT : {
				SERVER_CONNECTION_ESTABLISHED : 0,
				MESSAGE_RECEIVED : 1,
				CLOCK_SYNC_ESTABLISHED : 2,
				COMPONENT_CREATED : 3,
				COMPONENT_UPDATED : 4,
				ENTITY_CREATED : 5,
				ENTITY_DESTROYED : 6,
				ASSET_UPDATED : 7,
				SUBSCRIBE : 8,
				UNSUBSCRIBE : 9,
				RESOURCE_PROGRESS : 10,
				RESOURCE_LOADING_COMPLETED : 11,
				AVAILABLE_SCREEN_SIZE_CHANGED : 12,
				SCREEN_RESIZE : 13
			}
		}

		return EventManager
	}
)
