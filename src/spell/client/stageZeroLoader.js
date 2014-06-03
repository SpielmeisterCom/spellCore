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

/*
 UAParser.js - Lightweight JavaScript-based User-Agent string parser
 */
(function(window,undefined){"use strict";var EMPTY="",UNKNOWN="?",FUNC_TYPE="function",UNDEF_TYPE="undefined",OBJ_TYPE="object",MAJOR="major",MODEL="model",NAME="name",TYPE="type",VENDOR="vendor",VERSION="version",ARCHITECTURE="architecture",CONSOLE="console",MOBILE="mobile",TABLET="tablet";var util={has:function(str1,str2){return str2.toLowerCase().indexOf(str1.toLowerCase())!==-1},lowerize:function(str){return str.toLowerCase()}};var mapper={rgx:function(){for(var result,i=0,j,k,p,q,matches,match,args=arguments;i<args.length;i+=2){var regex=args[i],props=args[i+1];if(typeof result===UNDEF_TYPE){result={};for(p in props){q=props[p];if(typeof q===OBJ_TYPE){result[q[0]]=undefined}else{result[q]=undefined}}}for(j=k=0;j<regex.length;j++){matches=regex[j].exec(this.getUA());if(!!matches){for(p=0;p<props.length;p++){match=matches[++k];q=props[p];if(typeof q===OBJ_TYPE&&q.length>0){if(q.length==2){if(typeof q[1]==FUNC_TYPE){result[q[0]]=q[1].call(this,match)}else{result[q[0]]=q[1]}}else if(q.length==3){if(typeof q[1]===FUNC_TYPE&&!(q[1].exec&&q[1].test)){result[q[0]]=match?q[1].call(this,match,q[2]):undefined}else{result[q[0]]=match?match.replace(q[1],q[2]):undefined}}else if(q.length==4){result[q[0]]=match?q[3].call(this,match.replace(q[1],q[2])):undefined}}else{result[q]=match?match:undefined}}break}}if(!!matches)break}return result},str:function(str,map){for(var i in map){if(typeof map[i]===OBJ_TYPE&&map[i].length>0){for(var j=0;j<map[i].length;j++){if(util.has(map[i][j],str)){return i===UNKNOWN?undefined:i}}}else if(util.has(map[i],str)){return i===UNKNOWN?undefined:i}}return str}};var maps={browser:{oldsafari:{major:{1:["/8","/1","/3"],2:"/4","?":"/"},version:{"1.0":"/8",1.2:"/1",1.3:"/3","2.0":"/412","2.0.2":"/416","2.0.3":"/417","2.0.4":"/419","?":"/"}}},device:{sprint:{model:{"Evo Shift 4G":"7373KT"},vendor:{HTC:"APA",Sprint:"Sprint"}}},os:{windows:{version:{ME:"4.90","NT 3.11":"NT3.51","NT 4.0":"NT4.0",2000:"NT 5.0",XP:["NT 5.1","NT 5.2"],Vista:"NT 6.0",7:"NT 6.1",8:"NT 6.2",8.1:"NT 6.3",RT:"ARM"}}}};var regexes={browser:[[/(opera\smini)\/((\d+)?[\w\.-]+)/i,/(opera\s[mobiletab]+).+version\/((\d+)?[\w\.-]+)/i,/(opera).+version\/((\d+)?[\w\.]+)/i,/(opera)[\/\s]+((\d+)?[\w\.]+)/i],[NAME,VERSION,MAJOR],[/\s(opr)\/((\d+)?[\w\.]+)/i],[[NAME,"Opera"],VERSION,MAJOR],[/(kindle)\/((\d+)?[\w\.]+)/i,/(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?((\d+)?[\w\.]+)*/i,/(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?((\d+)?[\w\.]*)/i,/(?:ms|\()(ie)\s((\d+)?[\w\.]+)/i,/(rekonq)((?:\/)[\w\.]+)*/i,/(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron)\/((\d+)?[\w\.-]+)/i],[NAME,VERSION,MAJOR],[/(trident).+rv[:\s]((\d+)?[\w\.]+).+like\sgecko/i],[[NAME,"IE"],VERSION,MAJOR],[/(yabrowser)\/((\d+)?[\w\.]+)/i],[[NAME,"Yandex"],VERSION,MAJOR],[/(comodo_dragon)\/((\d+)?[\w\.]+)/i],[[NAME,/_/g," "],VERSION,MAJOR],[/(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?((\d+)?[\w\.]+)/i],[NAME,VERSION,MAJOR],[/(dolfin)\/((\d+)?[\w\.]+)/i],[[NAME,"Dolphin"],VERSION,MAJOR],[/((?:android.+)crmo|crios)\/((\d+)?[\w\.]+)/i],[[NAME,"Chrome"],VERSION,MAJOR],[/version\/((\d+)?[\w\.]+).+?mobile\/\w+\s(safari)/i],[VERSION,MAJOR,[NAME,"Mobile Safari"]],[/version\/((\d+)?[\w\.]+).+?(mobile\s?safari|safari)/i],[VERSION,MAJOR,NAME],[/webkit.+?(mobile\s?safari|safari)((\/[\w\.]+))/i],[NAME,[MAJOR,mapper.str,maps.browser.oldsafari.major],[VERSION,mapper.str,maps.browser.oldsafari.version]],[/(konqueror)\/((\d+)?[\w\.]+)/i,/(webkit|khtml)\/((\d+)?[\w\.]+)/i],[NAME,VERSION,MAJOR],[/(navigator|netscape)\/((\d+)?[\w\.-]+)/i],[[NAME,"Netscape"],VERSION,MAJOR],[/(swiftfox)/i,/(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?((\d+)?[\w\.\+]+)/i,/(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/((\d+)?[\w\.-]+)/i,/(mozilla)\/((\d+)?[\w\.]+).+rv\:.+gecko\/\d+/i,/(uc\s?browser|polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|qqbrowser)[\/\s]?((\d+)?[\w\.]+)/i,/(links)\s\(((\d+)?[\w\.]+)/i,/(gobrowser)\/?((\d+)?[\w\.]+)*/i,/(ice\s?browser)\/v?((\d+)?[\w\._]+)/i,/(mosaic)[\/\s]((\d+)?[\w\.]+)/i],[NAME,VERSION,MAJOR]],cpu:[[/(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i],[[ARCHITECTURE,"amd64"]],[/((?:i[346]|x)86)[;\)]/i],[[ARCHITECTURE,"ia32"]],[/windows\s(ce|mobile);\sppc;/i],[[ARCHITECTURE,"arm"]],[/((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i],[[ARCHITECTURE,/ower/,"",util.lowerize]],[/(sun4\w)[;\)]/i],[[ARCHITECTURE,"sparc"]],[/(ia64(?=;)|68k(?=\))|arm(?=v\d+;)|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i],[ARCHITECTURE,util.lowerize]],device:[[/\((ipad|playbook);[\w\s\);-]+(rim|apple)/i],[MODEL,VENDOR,[TYPE,TABLET]],[/(hp).+(touchpad)/i,/(kindle)\/([\w\.]+)/i,/\s(nook)[\w\s]+build\/(\w+)/i,/(dell)\s(strea[kpr\s\d]*[\dko])/i],[VENDOR,MODEL,[TYPE,TABLET]],[/\((ip[honed|\s\w*]+);.+(apple)/i],[MODEL,VENDOR,[TYPE,MOBILE]],[/(blackberry)[\s-]?(\w+)/i,/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|huawei|meizu|motorola)[\s_-]?([\w-]+)*/i,/(hp)\s([\w\s]+\w)/i,/(asus)-?(\w+)/i],[VENDOR,MODEL,[TYPE,MOBILE]],[/\((bb10);\s(\w+)/i],[[VENDOR,"BlackBerry"],MODEL,[TYPE,MOBILE]],[/android.+((transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+))/i],[[VENDOR,"Asus"],MODEL,[TYPE,TABLET]],[/(sony)\s(tablet\s[ps])/i],[VENDOR,MODEL,[TYPE,TABLET]],[/(nintendo)\s([wids3u]+)/i],[VENDOR,MODEL,[TYPE,CONSOLE]],[/((playstation)\s[3portablevi]+)/i],[[VENDOR,"Sony"],MODEL,[TYPE,CONSOLE]],[/(sprint\s(\w+))/i],[[VENDOR,mapper.str,maps.device.sprint.vendor],[MODEL,mapper.str,maps.device.sprint.model],[TYPE,MOBILE]],[/(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i,/(zte)-(\w+)*/i,/(alcatel|geeksphone|huawei|lenovo|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]+)*/i],[VENDOR,[MODEL,/_/g," "],[TYPE,MOBILE]],[/\s((milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?(:?\s4g)?))[\w\s]+build\//i,/(mot)[\s-]?(\w+)*/i],[[VENDOR,"Motorola"],MODEL,[TYPE,MOBILE]],[/android.+\s((mz60\d|xoom[\s2]{0,2}))\sbuild\//i],[[VENDOR,"Motorola"],MODEL,[TYPE,TABLET]],[/android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n8000|sgh-t8[56]9))/i],[[VENDOR,"Samsung"],MODEL,[TYPE,TABLET]],[/((s[cgp]h-\w+|gt-\w+|galaxy\snexus))/i,/(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i,/sec-((sgh\w+))/i],[[VENDOR,"Samsung"],MODEL,[TYPE,MOBILE]],[/(sie)-(\w+)*/i],[[VENDOR,"Siemens"],MODEL,[TYPE,MOBILE]],[/(maemo|nokia).*(n900|lumia\s\d+)/i,/(nokia)[\s_-]?([\w-]+)*/i],[[VENDOR,"Nokia"],MODEL,[TYPE,MOBILE]],[/android\s3\.[\s\w-;]{10}((a\d{3}))/i],[[VENDOR,"Acer"],MODEL,[TYPE,TABLET]],[/android\s3\.[\s\w-;]{10}(lg?)-([06cv9]{3,4})/i],[[VENDOR,"LG"],MODEL,[TYPE,TABLET]],[/((nexus\s4))/i,/((nexus\s5))/i,/(lg)[e;\s-\/]+(\w+)*/i],[[VENDOR,"LG"],MODEL,[TYPE,MOBILE]],[/(mobile|tablet);.+rv\:.+gecko\//i],[TYPE,VENDOR,MODEL]],engine:[[/(presto)\/([\w\.]+)/i,/(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i,/(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,/(icab)[\/\s]([23]\.[\d\.]+)/i],[NAME,VERSION],[/rv\:([\w\.]+).*(gecko)/i],[VERSION,NAME]],os:[[/(windows)\snt\s6\.2;\s(arm)/i,/(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i],[NAME,[VERSION,mapper.str,maps.os.windows.version]],[/(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i],[[NAME,"Windows"],[VERSION,mapper.str,maps.os.windows.version]],[/\((bb)(10);/i],[[NAME,"BlackBerry"],VERSION],[/(blackberry)\w*\/?([\w\.]+)*/i,/(tizen)\/([\w\.]+)/i,/(android|webos|palm\os|qnx|bada|rim\stablet\sos|meego)[\/\s-]?([\w\.]+)*/i],[NAME,VERSION],[/(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i],[[NAME,"Symbian"],VERSION],[/mozilla.+\(mobile;.+gecko.+firefox/i],[[NAME,"Firefox OS"],VERSION],[/(nintendo|playstation)\s([wids3portablevu]+)/i,/(mint)[\/\s\(]?(\w+)*/i,/(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk)[\/\s-]?([\w\.-]+)*/i,/(hurd|linux)\s?([\w\.]+)*/i,/(gnu)\s?([\w\.]+)*/i],[NAME,VERSION],[/(cros)\s[\w]+\s([\w\.]+\w)/i],[[NAME,"Chromium OS"],VERSION],[/(sunos)\s?([\w\.]+\d)*/i],[[NAME,"Solaris"],VERSION],[/\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i],[NAME,VERSION],[/(ip[honead]+)(?:.*os\s*([\w]+)*\slike\smac|;\sopera)/i],[[NAME,"iOS"],[VERSION,/_/g,"."]],[/(mac\sos\sx)\s?([\w\s\.]+\w)*/i],[NAME,[VERSION,/_/g,"."]],[/(haiku)\s(\w+)/i,/(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i,/(macintosh|mac(?=_powerpc)|plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos)/i,/(unix)\s?([\w\.]+)*/i],[NAME,VERSION]]};var UAParser=function(uastring){var ua=uastring||(window&&window.navigator&&window.navigator.userAgent?window.navigator.userAgent:EMPTY);if(!(this instanceof UAParser)){return new UAParser(uastring).getResult()}this.getBrowser=function(){return mapper.rgx.apply(this,regexes.browser)};this.getCPU=function(){return mapper.rgx.apply(this,regexes.cpu)};this.getDevice=function(){return mapper.rgx.apply(this,regexes.device)};this.getEngine=function(){return mapper.rgx.apply(this,regexes.engine)};this.getOS=function(){return mapper.rgx.apply(this,regexes.os)};this.getResult=function(){return{ua:this.getUA(),browser:this.getBrowser(),engine:this.getEngine(),os:this.getOS(),device:this.getDevice(),cpu:this.getCPU()}};this.getUA=function(){return ua};this.setUA=function(uastring){ua=uastring;return this};this.setUA(ua)};if(typeof exports!==UNDEF_TYPE){if(typeof module!==UNDEF_TYPE&&module.exports){exports=module.exports=UAParser}exports.UAParser=UAParser}else{window.UAParser=UAParser;if(typeof define===FUNC_TYPE&&define.amd){define(function(){return UAParser})}if(typeof window.jQuery!==UNDEF_TYPE){var $=window.jQuery;var parser=new UAParser;$.ua=parser.getResult();$.ua.get=function(){return parser.getUA()};$.ua.set=function(uastring){parser.setUA(uastring);var result=parser.getResult();for(var prop in result){$.ua[prop]=result[prop]}}}}})(this);

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
		IS_MOBILE_SAFARI = !!navigator.platform.match( /^(iPad|iPod|iPhone)$/ ),
		IS_MOBILE_CHROME = !!navigator.userAgent.match( /Chrome\/[.0-9]* Mobile/ ),
		MODE = {
			DEPLOYED : 'deployed',
			DEVELOPMENT_EMBEDDED : 'development_embedded',
			DEVELOPMENT_STANDALONE : 'development_standalone'
		}

	if( typeof INCLUDED_SUB_TARGETS === 'undefined' ) {
		var INCLUDED_SUB_TARGETS = undefined
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

	var isHtml5Windows = function() {
		return typeof( Windows ) !== 'undefined'
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
				isWebGlCapable() &&
                !isHtml5Windows() ) {

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

	var resizeFlashObject = function( flashObject, screenSize ) {
		flashObject.width = screenSize[ 0 ]
		flashObject.height = screenSize[ 1 ]
		flashObject.processResize( screenSize )
	}

	var loadFlashExecutable = function( config, verbose ) {
		if( verbose ) printLoading()

		// create dom structure shim
		var spellNodeId     = config.id,
			screenNode      = createChildNode( spellNodeId, config.id + '-screen' ),
			screenFlashNode = createChildNode( screenNode.id, screenNode.id + '-flash' )

		config.libraryUrl = 'library'

		// Flash calls this function to signal that the platform adapter initialization is almost complete.
		window.signalInitDone = function() {
			delete window.signalInitDone

			var flashObject = swfobject.getObjectById( screenFlashNode.id )

			if( flashObject && flashObject.initDone ) {
				resizeFlashObject( flashObject, createScreenSize( spellNodeId ) )
				flashObject.initDone()

			} else {
				throw 'Could not call "flashObject.initDone()".'
			}
		}

		var processflashObjectCreated = function( event ) {
			if( !event.success ) {
				throw 'Failed to embed swf.'

				return
			}

			if( verbose ) printLaunching()

			var flashObject = event.ref

			window.addEventListener(
				'resize',
				function() {
					resizeFlashObject( flashObject, createScreenSize( spellNodeId ) )
				}
			)
		}

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
			processflashObjectCreated
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

	var showMessage = function( id, message ) {
		document.getElementById( id ).innerHTML = '<p style="color: #FFFFFF">' + message + '</p>'
	}

	window.spell = {
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
