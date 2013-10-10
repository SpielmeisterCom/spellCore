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

/*	SWFObject v2.2 <http://code.google.com/p/swfobject/>
	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
*/
var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O.ActiveXObject!=D){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?"ActiveX":"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();

// dom shim - place all functions for accessing the dom from flash here
;( function( document ) {
	spell_setDimensions = function( id, width, height ) {
		var node = document.getElementById( id )

		node.style.width = width + 'px'
		node.style.height = height + 'px'
	}
} )( document )

// provide a console stub if no window.console is available
if( !window.console ) {
	window.console = {
		log : function() {}
	}
}

;( function( document ) {
	var MIN_FLASH_PLAYER_VERSION = '10.1.0',
		DEFAULT_CONTAINER_ID = 'spell',
		MODE = {
			DEPLOYED : 'deployed',
			DEVELOPMENT_EMBEDDED : 'development_embedded',
			DEVELOPMENT_STANDALONE : 'development_standalone'
		}

	if( typeof INCLUDED_SUB_TARGETS === 'undefined' ) {
		var INCLUDED_SUB_TARGETS = undefined
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

	var isWebAudioSupported = function() {
		if( !window.webkitAudioContext ) return false

		try {
			var test = new webkitAudioContext()

			return true

		} catch ( e ) {
			return false
		}
	}

	var isHtml5Capable = function() {
		var notCapable = isLessThanBrowser( 'Chrome', 22 ) ||
			isLessThanBrowser( 'Firefox', 18 ) ||
			isLessThanBrowser( 'Safari', 6 ) ||
			isLessThanBrowser( 'IE', 10 ) ||
			!isCanvas2dCapable() // all other browsers must at least provide a canvas-2d implementation

		return !notCapable
	}

	var isLessThanBrowser = function( name, minimumVersion ) {
		var match = name === 'Safari' ?
				navigator.userAgent.match( /.*Version\/(\d+).*Safari/ ) :
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
			canvasElement.getContext( '2d' )
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

	var isFlashCapable = function() {
		return swfobject.hasFlashPlayerVersion( MIN_FLASH_PLAYER_VERSION )
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

			} else if( isFlashCapable() ) {
				config.target = 'flash'
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

	var isBrowserCapable = function( config ) {
		if( config.target === 'html5' &&
			isHtml5Capable() ) {

			return true

		} else if( config.target === 'flash' &&
			isFlashCapable() ) {

			return true
		}

		return false
	}

	var supportsOnlySingleChannelAudio = function() {
		return arrayContains( navigator.userAgent, 'IEMobile/9.0' ) ||
			arrayContains( navigator.userAgent, 'IEMobile/10.0' )
	}

	var checkSubTargetAvailability = function( target ) {
		if( !INCLUDED_SUB_TARGETS ) {
			return true
		}

		if( !arrayContains( INCLUDED_SUB_TARGETS, target ) ) {
			throw 'Error: Invalid sub-target. The requested sub-target "' + target + '" was not included in the build. Please make sure that the build includes the required sub-targets.'
		}
	}

	var process = function( spellObject, config, onInitialized, debugMessageCallback ) {
		if( !config.target ) {
			throw 'Error: Invalid config. Property \'target\' is not defined.'
		}

		if( config.target !== 'html5' &&
			config.target !== 'flash' ) {

			throw 'Error: Invalid config. Value \'' + config.target + '\' for property \'target\' is not supported.'
		}

		if( config.verbose ) {
			console.log( 'stage-zero-loader: chose ' + config.target + ' target' )
		}

		if( config.target === 'html5' ) {
			checkSubTargetAvailability( 'html5' )

			loadHtml5Executable( config, spellObject, onInitialized, debugMessageCallback )

		} else if( config.target === 'flash' ) {
			checkSubTargetAvailability( 'flash' )

			loadFlashExecutable( config, config.verbose )
		}
	}

	var loadHtml5Executable = function( config, spellObject, onInitialized, debugMessageCallback ) {
		var isModeDeployed    = config.mode === MODE.DEPLOYED
		var isModeDevelopment = !isModeDeployed

		var startHtml5Executable = function() {
			if( config.verbose ) printLaunching()

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

		if( config.verbose ) printLoading()

		var args = [ 'html5/spell.js' ]

		if( isModeDeployed ) {
			args.push( 'html5/data.js' )
		}

		args.push( startHtml5Executable )

		head.js.apply( null, args )
	}

	var loadFlashExecutable = function( config, verbose ) {
		if( verbose ) printLoading()

		// create dom structure shim
		var screenNode      = createChildNode( config.id, config.id + '-screen' )
		var screenFlashNode = createChildNode( screenNode.id, screenNode.id + '-flash' )

		config.libraryUrl = 'library'

		swfobject.embedSWF(
			'flash/spell.swf',
			screenFlashNode.id,
			'100%',
			'100%',
			MIN_FLASH_PLAYER_VERSION,
			'playerProductInstall.swf',
			config,
			null,
			null,
			function() { if( verbose ) printLaunching() }
		)
	}

	var addDebugAPI = function( spellObject, engineInstance, debugMessageCallback ) {
		engineInstance.setSendMessageToEditor( debugMessageCallback )

		spellObject.sendDebugMessage = function( message ) {
			engineInstance.sendDebugMessage( message )
		}
	}

	var printLoading = function() {
		console.log( 'stage-zero-loader: loading executable' )
	}

	var printLaunching = function() {
		console.log( 'stage-zero-loader: launching executable' )
	}

	var createChildNode = function( containerId, childId ) {
		var container = document.getElementById( containerId ),
			child     = document.createElement( 'div' )

		child.id = childId

		container.appendChild( child )

		return child
	}

	var isValidProtocol = function() {
		var isFileProtocol = window.location.protocol == 'file:'

		//In node-webkit the file protocol is allowed
		return !isFileProtocol || ( isFileProtocol && ( typeof process == 'object' ) )
	}

	var showMessage = function( id, message ) {
		document.getElementById( id ).innerHTML = '<p style="color: #FFFFFF">' + message + '</p>'
	}

	window.spell = {
		start : function( config, onInitialized, debugMessageCallback ) {
			if( !config ) config = {}

			setUrlParameters( config )
			setDefaults( config )

			if( !hasContainer( config.id ) ) {
				throw 'Could not find dom node with id "' + config.id + '". Please provide a valid id.'
			}

			if( config.mode == MODE.DEPLOYED &&
				!isValidProtocol() ) {

				throw 'Protocol "file:" is not supported. Please use "http:" instead.'
			}

			if( !isBrowserCapable( config ) ) {
				showMessage( config.id, 'Your browser does not meet the minimum requirements to run SpellJS.' )

				return
			}

			process( this, config, onInitialized, debugMessageCallback )
		},
		addToCache : function( x ) {
			this.cache = x
		},
		setApplicationModule : function( x ) {
			this.applicationModule = x
		}
	}
} )( document )
