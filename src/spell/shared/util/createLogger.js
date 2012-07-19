define(
	'spell/shared/util/createLogger',
	[
		'spell/shared/util/platform/log'
	],
	function(
		log
	) {
		'use strict'


		return function() {
			var LOG_LEVEL_DEBUG = 0,
				LOG_LEVEL_INFO  = 1,
				LOG_LEVEL_WARN  = 2,
				LOG_LEVEL_ERROR = 3

			var sendMessageToEditor

			var logLevels = [
				'DEBUG',
				'INFO',
				'WARN',
				'ERROR'
			]

			var currentLogLevel = LOG_LEVEL_INFO


			var setLogLevel = function( level ) {
				currentLogLevel = level
			}

			var setSendMessageToEditor = function( fn ) {
				sendMessageToEditor = fn
			}

			var getTimeStamp = function() {
				var now = new Date()

				return '[' + now.toDateString() + ' ' + now.toLocaleTimeString() + ']'
			}

			var createMessage = function( level, text ) {
				if( level < 0 ||
					level > 3 ) {

					throw 'Log level ' + logLevels[ level ] + ' is not supported.'
				}

				if( level < currentLogLevel ) return

				return logLevels[ level ] + ' - ' + text
			}

			var logWrapper = function( level, text ) {
				if( sendMessageToEditor ) {
					sendMessageToEditor(
						'spell.debug.consoleMessage',
						{
							level : logLevels[ level ],
							text : text
						}
					)
				}

				log( getTimeStamp() + ' ' + createMessage( level, text ) )
			}

			var debug = function( message ) {
				logWrapper( LOG_LEVEL_DEBUG, message )
			}

			var info = function( message ) {
				logWrapper( LOG_LEVEL_INFO, message )
			}

			var warn = function( message ) {
				logWrapper( LOG_LEVEL_WARN, message )
			}

			var error = function( message ) {
				logWrapper( LOG_LEVEL_ERROR, message )
			}

			return {
				LOG_LEVEL_DEBUG        : LOG_LEVEL_DEBUG,
				LOG_LEVEL_INFO         : LOG_LEVEL_INFO,
				LOG_LEVEL_WARN         : LOG_LEVEL_WARN,
				LOG_LEVEL_ERROR        : LOG_LEVEL_ERROR,
				setSendMessageToEditor : setSendMessageToEditor,
				setLogLevel            : setLogLevel,
				log                    : logWrapper,
				debug                  : debug,
				info                   : info,
				warn                   : warn,
				error                  : error
			}
		}
	}
)
