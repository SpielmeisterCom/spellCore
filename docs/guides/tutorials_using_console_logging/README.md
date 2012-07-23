# Using console logging

This guide explains the logging functionality provided by the framework.


## The Logger class

The SpellJS API includes a logging class called [Logger](#!/api/spell.shared.util.Logger). While it is possible to instanciate the class yourself it is usually
not necessary to do so. The spell globals object provides an instance of the class through its *logger* member.

The class has support for different log levels which can be used to filter logged messages depending on the current mode of operation. For example when
certain messages are logged with the debug log level it is ensured that these messages are only shown to developers who run debug builds of a project.

<pre><code>
// accessing the logger instance
var logger = globals.logger

// logging some generic information
logger.info( "generic information" )

// logging messages related to development
logger.debug( "debugging information" )
logger.error( "a critical error" )
</code></pre>


## Why accessing the native console is restricted

Access to the native console object is restricted in order to ensure the portability of custom code created by developers.
