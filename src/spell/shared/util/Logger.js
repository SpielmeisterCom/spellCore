
define(
	'spell/shared/util/Logger',
	[
		'spell/shared/util/platform/log',
		'spell/functions'
	],
	function(
		platformLog,
		_
	) {
		'use strict'


		var LOG_LEVEL_DEBUG  = 0,
			LOG_LEVEL_INFO   = 1,
			LOG_LEVEL_WARN   = 2,
			LOG_LEVEL_ERROR  = 3,
			LOG_LEVEL_SILENT = 4


		var logLevels = [
			'DEBUG',
			'INFO',
			'WARN',
			'ERROR',
			'SILENT'
		]

		var validate = function( logLevel ) {
			if( logLevel < 0 ||
				logLevel > 4 ) {

				throw 'Log level ' + logLevel + ' is not supported.'
			}
		}

		var createMessage = function( level, text ) {
			return logLevels[ level ] + ' - ' + text
		}

		/**
		 * @class spell.shared.util.Logger
		 *
		 * The following log levels are available: LOG_LEVEL_DEBUG (0), LOG_LEVEL_INFO (1), LOG_LEVEL_WARN (2), LOG_LEVEL_ERROR (3), LOG_LEVEL_SILENT (4). The
		 * log level is used for filtering the logged messages. For example setting the log level to "LOG_LEVEL_WARN" (2) causes all messages with a lower level
		 * to be discarded without being logged. The default log level is LOG_LEVEL_INFO (1). If you want to disable all logging set the log level to
		 * "LOG_LEVEL_SILENT" (4).
		 *
		 *
		 * @constructor
		 *
		 * Creates a new Logger Instance.
		 *
		 * @param {Number} level sets the current log level
		 */
		var Logger = function( level ) {
			validate( level )

			this.currentLogLevel     = level || LOG_LEVEL_INFO
			this.sendMessageToEditor = undefined
		}

		Logger.prototype = {
			LOG_LEVEL_DEBUG : LOG_LEVEL_DEBUG,

			LOG_LEVEL_INFO : LOG_LEVEL_INFO,

			LOG_LEVEL_WARN : LOG_LEVEL_WARN,

			LOG_LEVEL_ERROR : LOG_LEVEL_ERROR,

			LOG_LEVEL_SILENT : LOG_LEVEL_SILENT,

			/**
			 * Sets the callback that establishes forwarding of log messages to the editor.
			 *
			 * @param {Function} fn
			 */
			setSendMessageToEditor : function( fn ) {
				this.sendMessageToEditor = fn
			},

			/**
			 * Sets the current log level.
			 *
			 * @param {Number} level
			 */
			setLogLevel : function( level ) {
				validate( level )

				this.currentLogLevel = level
			},

			/**
			 * Logs the supplied text with the supplied level.
			 *
			 * @param {Number} level
			 * @param {String} text
			 */
			log : function( level, text ) {
				if( arguments.length === 1 ) {
					text = level
					level = LOG_LEVEL_DEBUG
				}

				if( level < this.currentLogLevel ) return

				if( this.sendMessageToEditor ) {
					this.sendMessageToEditor(
						'spell.debug.consoleMessage',
						{
							level : logLevels[ level ],
							text : text
						}
					)
				}

				platformLog( createTimeStamp() + ' ' + createMessage( level, text ) )
			},

			/**
			 * Logs the supplied message with log level LOG_LEVEL_DEBUG.
			 *
			 * @param {String} message
			 */
			debug : function( message ) {
				this.log( LOG_LEVEL_DEBUG, message )
			},

			/**
			 * Logs the supplied message with log level LOG_LEVEL_INFO.
			 *
			 * @param {String} message
			 */
			info : function( message ) {
				this.log( LOG_LEVEL_INFO, message )
			},

			/**
			 * Logs the supplied message with log level LOG_LEVEL_WARN.
			 *
			 * @param {String} message
			 */
			warn : function( message ) {
				this.log( LOG_LEVEL_WARN, message )
			},

			/**
			 * Logs the supplied message with log level LOG_LEVEL_ERROR.
			 *
			 * @param {String} message
			 */
			error : function( message ) {
				this.log( LOG_LEVEL_ERROR, message )
			}
		}

		return Logger
	}
)
