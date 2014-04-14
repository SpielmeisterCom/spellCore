/*
 * SpellJS Stage Zero Loader
 */

/*
    Head JS     The only script in your <HEAD>
    Copyright   Tero Piirainen (tipiirai)
    License     MIT / http://bit.ly/mit-license
    Version     0.99

    http://headjs.com
*/(function(f,w){function m(){}function g(a,b){if(a){"object"===typeof a&&(a=[].slice.call(a));for(var c=0,d=a.length;c<d;c++)b.call(a,a[c],c)}}function v(a,b){var c=Object.prototype.toString.call(b).slice(8,-1);return b!==w&&null!==b&&c===a}function k(a){return v("Function",a)}function h(a){a=a||m;a._done||(a(),a._done=1)}function n(a){var b={};if("object"===typeof a)for(var c in a)a[c]&&(b={name:c,url:a[c]});else b=a.split("/"),b=b[b.length-1],c=b.indexOf("?"),b={name:-1!==c?b.substring(0,c):b,url:a};return(a=p[b.name])&&a.url===b.url?a:p[b.name]=b}function q(a){var a=a||p,b;for(b in a)if(a.hasOwnProperty(b)&&a[b].state!==r)return!1;return!0}function s(a,b){b=b||m;a.state===r?b():a.state===x?d.ready(a.name,b):a.state===y?a.onpreload.push(function(){s(a,b)}):(a.state=x,z(a,function(){a.state=r;b();g(l[a.name],function(a){h(a)});j&&q()&&g(l.ALL,function(a){h(a)})}))}function z(a,b){var b=b||m,c;/\.css[^\.]*$/.test(a.url)?(c=e.createElement("link"),c.type="text/"+(a.type||"css"),c.rel="stylesheet",c.href=a.url):(c=e.createElement("script"),c.type="text/"+(a.type||"javascript"),c.src=a.url);c.onload=c.onreadystatechange=function(a){a=a||f.event;if("load"===a.type||/loaded|complete/.test(c.readyState)&&(!e.documentMode||9>e.documentMode))c.onload=c.onreadystatechange=c.onerror=null,b()};c.onerror=function(){c.onload=c.onreadystatechange=c.onerror=null;b()};c.async=!1;c.defer=!1;var d=e.head||e.getElementsByTagName("head")[0];d.insertBefore(c,d.lastChild)}function i(){e.body?j||(j=!0,g(A,function(a){h(a)})):(f.clearTimeout(d.readyTimeout),d.readyTimeout=f.setTimeout(i,50))}function t(){e.addEventListener?(e.removeEventListener("DOMContentLoaded",t,!1),i()):"complete"===e.readyState&&(e.detachEvent("onreadystatechange",t),i())}var e=f.document,A=[],B=[],l={},p={},E="async"in e.createElement("script")||"MozAppearance"in e.documentElement.style||f.opera,C,j,D=f.head_conf&&f.head_conf.head||"head",d=f[D]=f[D]||function(){d.ready.apply(null,arguments)},y=1,x=3,r=4;d.load=E?function(){var a=arguments,b=a[a.length-1],c={};k(b)||(b=null);g(a,function(d,e){d!==b&&(d=n(d),c[d.name]=d,s(d,b&&e===a.length-2?function(){q(c)&&h(b)}:null))});return d}:function(){var a=arguments,b=[].slice.call(a,1),c=b[0];if(!C)return B.push(function(){d.load.apply(null,a)}),d;c?(g(b,function(a){if(!k(a)){var b=n(a);b.state===w&&(b.state=y,b.onpreload=[],z({url:b.url,type:"cache"},function(){b.state=2;g(b.onpreload,function(a){a.call()})}))}}),s(n(a[0]),k(c)?c:function(){d.load.apply(null,b)})):s(n(a[0]));return d};d.js=d.load;d.test=function(a,b,c,e){a="object"===typeof a?a:{test:a,success:b?v("Array",b)?b:[b]:!1,failure:c?v("Array",c)?c:[c]:!1,callback:e||m};(b=!!a.test)&&a.success?(a.success.push(a.callback),d.load.apply(null,a.success)):!b&&a.failure?(a.failure.push(a.callback),d.load.apply(null,a.failure)):e();return d};d.ready=function(a,b){if(a===e)return j?h(b):A.push(b),d;k(a)&&(b=a,a="ALL");if("string"!==typeof a||!k(b))return d;var c=p[a];if(c&&c.state===r||"ALL"===a&&q()&&j)return h(b),d;(c=l[a])?c.push(b):l[a]=[b];return d};d.ready(e,function(){q()&&g(l.ALL,function(a){h(a)});d.feature&&d.feature("domloaded",!0)});if("complete"===e.readyState)i();else if(e.addEventListener)e.addEventListener("DOMContentLoaded",t,!1),f.addEventListener("load",i,!1);else{e.attachEvent("onreadystatechange",t);f.attachEvent("onload",i);var u=!1;try{u=null==f.frameElement&&e.documentElement}catch(F){}u&&u.doScroll&&function b(){if(!j){try{u.doScroll("left")}catch(c){f.clearTimeout(d.readyTimeout);d.readyTimeout=f.setTimeout(b,50);return}i()}}()}setTimeout(function(){C=!0;g(B,function(b){b()})},300)})(window);

// provide a console stub if no window.console is available
if( !window.console ) {
	window.console = {
		log : function() {}
	}
}

;( function( document ) {
	var DEFAULT_CONTAINER_ID = 'spell',
		IS_MOBILE_SAFARI = !!navigator.platform.match( /^(iPad|iPod|iPhone)$/ ),
		IS_MOBILE_CHROME = !!navigator.userAgent.match( /Chrome\/[.0-9]* Mobile/ ),
		MODE = {
			DEPLOYED : 'deployed',
			DEVELOPMENT_EMBEDDED : 'development_embedded',
			DEVELOPMENT_STANDALONE : 'development_standalone'
		}

	var getOffset = function( element ) {
		if( !element.getBoundingClientRect ) {
			return [ 0, 0 ]
		}

		var box = element.getBoundingClientRect()

		var body    = document.body
		var docElem = document.documentElement

		var scrollTop  = window.pageYOffset || docElem.scrollTop || body.scrollTop
		var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft

		var clientTop  = docElem.clientTop || body.clientTop || 0
		var clientLeft = docElem.clientLeft || body.clientLeft || 0

		var top  = box.top + scrollTop - clientTop
		var left = box.left + scrollLeft - clientLeft

		return [ Math.round( left ), Math.round( top ) ]
	}

	var createScreenSize = function( id ) {
		var offset = getOffset( document.getElementById( id ) )

		return [ window.innerWidth - offset[ 0 ], window.innerHeight - offset[ 1 ] ]
	}

	var arrayContains = function( array, value ) {
		if( !array ) return false

		return array.indexOf( value ) > -1
	}

	var getUrlParameters = function() {
		var url = window.location.href
		var map = {}

		url.replace(
			/[?&]+([^=&]+)=([^&]*)/gi,
			function( match, key, value ) {
				map[ key ] = value
			}
		)

		return map
	}

	var normalizeConfig = function( config ) {
		for( var key in config ) {
			config[ key ] = config[ key ].toString()
		}
	}

	/*
	 * Overrides config values set by script with those provided in the url.
	 *
	 * @param config
	 */
	var setUrlParameters = function( config ) {
		var parameters = getUrlParameters()

		for( var name in parameters ) {
			var value = parameters[ name ]

			config[ name ] = value === 'false' || value === 'true' ?
				value === 'true' :
				value
		}
	}

	var hasContainer = function( id ) {
		return !!( id ? document.getElementById( id ) : document.getElementById( DEFAULT_CONTAINER_ID ) )
	}

	var isHtml5AudioSupported = function() {
		if( IS_MOBILE_SAFARI || IS_MOBILE_CHROME ) {
			return false
		}

		var elem              = document.createElement( 'audio' ),
			audioObjSupported = !!elem.canPlayType

		if( !audioObjSupported ) return false

		var supportedFormats = [ 'audio/ogg; codecs="vorbis"', 'audio/mpeg' ]

		if( supportsOnlySingleChannelAudio() ) return false

		for( var i = 0; i < supportedFormats.length; i++ ) {
			try {
				if( '' != elem.canPlayType( supportedFormats[ i ] ).replace( /^no$/,'' ) ) {
					return true
				}

			} catch( e ) {}
		}

		return false
	}

	var isHtml5WinPhone = function() {
		return window.external && typeof(window.external.notify ) !== 'undefined'
	}

	var isWebAudioSupported = function() {
		if( IS_MOBILE_SAFARI ||
			IS_MOBILE_CHROME ||
			!window.webkitAudioContext ) {

			return false
		}

		try {
			var test   = new webkitAudioContext(),
				buffer = test.createBufferSource()

			return ( typeof( buffer.start) == 'function' ) ? true : false

		} catch ( e ) {
			return false
		}
	}

	var isHtml5Capable = function() {
		var notCapable = isLessThanBrowser( 'Firefox', 18 ) ||
			isLessThanBrowser( 'IE', 10 ) ||
			!isCanvas2dCapable() // all other browsers must at least provide a canvas-2d implementation

		return !notCapable
	}

	var isLessThanBrowser = function( name, minimumVersion ) {
		var match = name === 'Safari' ?
				navigator.userAgent.match( /.*Version\/(\d+)\S*\s(Safari)/ ) :
				name === 'IE' ?
					navigator.userAgent.match( /.*MSIE (\d+)/ ) :
					navigator.userAgent.match( new RegExp( '.*' + name + '\\/(\\d+)' ) )

		if( !match ) return false

		var version = parseInt( match[ 1 ], 10 )

		return version < minimumVersion
	}

	var isCanvas2dCapable = function() {
		var canvasElement = document.createElement( 'canvas' )

		return canvasElement.getContext &&
			!!canvasElement.getContext( '2d' )
	}

	var isWebGlCapable = function() {
		var gl,
			contextNames = [ 'webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl' ],
			attributes   = { alpha: false },
			isSupported  = false,
			canvas       = document.createElement( 'canvas' )

		for( var i = 0; i < contextNames.length; i++ ) {
			try {
				gl = canvas.getContext( contextNames[ i ], attributes )

			} catch( e ) {}

			if( gl ) {
				isSupported = true
				break
			}
		}

		delete canvas
		delete gl

		return isSupported
	}

	var detectBrowserLanguage = function() {
		var language = navigator.language || navigator.userLanguage || ''

		return language.split( '-' ).shift().toLowerCase()
	}

	var setDefaults = function( config ) {
		if( !config.id ) {
			config.id = 'spell'
		}

		if( !config.target ) {
			if( isHtml5Capable() ) {
				config.target = 'html5'
			}
		}

		if( config.target === 'html5' ) {
			if( !config.renderingBackEnd &&
				isWebGlCapable() ) {

				config.renderingBackEnd = 'webgl'
			}

			if( !config.audioBackEnd ) {
				config.audioBackEnd = isWebAudioSupported() ?
					'web' :
					isHtml5AudioSupported() ?
						'html5' :
						isHtml5WinPhone() ?
							'winPhone' :
							'dummy'
			}
		}

		if( !config.verbose ) {
			config.verbose = false
		}

		if( !config.mode ) {
			config.mode = MODE.DEPLOYED
		}

		if( ( config.detectLanguage === undefined ||
			config.detectLanguage === true ) &&
			!config.currentLanguage ) {

			config.currentLanguage = detectBrowserLanguage()
		}
	}

	var supportsOnlySingleChannelAudio = function() {
		return arrayContains( navigator.userAgent, 'IEMobile/9.0' ) ||
			arrayContains( navigator.userAgent, 'IEMobile/10.0' )
	}

	var loadHtml5Executable = function( config, spellObject, onInitialized, debugMessageCallback ) {
		var isModeDeployed    = config.mode === MODE.DEPLOYED
		var isModeDevelopment = !isModeDeployed

		var startHtml5Executable = function() {
			var engineInstance = require( 'spell/client/main', config )

			if( isModeDevelopment &&
				debugMessageCallback ) {

				addDebugAPI( spellObject, engineInstance, debugMessageCallback )
			}

			if( isModeDeployed ) {
				engineInstance.start( spell.applicationModule, spell.cache )
			}

			if( onInitialized ) {
				onInitialized( engineInstance )
			}
		}

		var args = [ 'html5/spell.js' ]

		if( isModeDeployed ) {
			args.push( 'html5/data.js' )
		}

		args.push( startHtml5Executable )

		head.js.apply( null, args )
	}

	var addDebugAPI = function( spellObject, engineInstance, debugMessageCallback ) {
		engineInstance.setSendMessageToEditor( debugMessageCallback )

		spellObject.sendDebugMessage = function( message ) {
			engineInstance.sendDebugMessage( message )
		}
	}

	var createChildNode = function( containerId, childId ) {
		var container = document.getElementById( containerId ),
			child     = document.createElement( 'div' )

		child.id = childId

		container.appendChild( child )

		return child
	}

	var showMessage = function( id, message ) {
		document.getElementById( id ).innerHTML = '<p style="color: #FFFFFF">' + message + '</p>'
	}

	var spell = window.spell = {
		start : function( config, onInitialized, debugMessageCallback ) {
			if( !config ) {
				config = {}
			}

			normalizeConfig( config )
			setUrlParameters( config )
			setDefaults( config )

			if( !hasContainer( config.id ) ) {
				throw 'Could not find dom node with id "' + config.id + '". Please provide a valid id.'
			}

			if( !isHtml5Capable() ) {
				showMessage( config.id, 'Your browser does not meet the minimum requirements to run SpellJS.' )

				return
			}

			loadHtml5Executable( config, spell, onInitialized, debugMessageCallback )
		},
		addToCache : function( x ) {
			this.cache = x
		},
		setApplicationModule : function( x ) {
			this.applicationModule = x
		}
	}
} )( document )
