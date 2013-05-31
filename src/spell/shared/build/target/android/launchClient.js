var EVENT_HANDLER = {},
	TICK_CALLBACK

GLOBAL.requestAnimationFrame = function( f ) {
    TICK_CALLBACK = f
}

GLOBAL.open = GLOBAL.open || GLOBAL.setLocation

// this function hides the splash screen (has nothing to do with resource loading)
NATIVE.doneLoading();

//<CONSOLE>
    GLOBAL.console = jsio('import base', {}).logging.get('console');
//</CONSOLE>

//<CONTEXT2D>
    var createdOnscreenCanvas = false,
        __globalScissor = false;

    var Context2D = function(opts) {
        this._stack = [];
        this._stackPos = 0;
        this.canvas = opts.canvas;


//        if (!opts.offscreen) {
            createdOnscreenCanvas = true;
            this.canvas.__gl_name = -1;
            this.canvas._src = 'onscreen';
  /*      } else {
            var textureData = NATIVE.gl.newTexture(this.canvas.width, this.canvas.height);
            this.canvas.__gl_name = textureData.__gl_name;
            this.canvas._src = textureData._src;
        }*/

        console.log('Creating 2d context with ' + this.canvas._width + 'x' + this.canvas._height );

        this._ctx = new NATIVE.gl.Context2D(this.canvas, this.canvas._src, this.canvas.__gl_name);

        //FIXME add globalalpha back to these
        this.updateState = function(src, dest) {
            /*
             obj.stroke = this.stroke;
             obj.patternQuality = this.patternQuality;
             obj.fillPattern = this.fillPattern;
             obj.strokePattern = this.strokePattern;
             */
            dest.font = src.font;
            dest.textAlign = src.textAlign;
            dest.textBaseline = src.textBaseline;
            dest.fillStyle = src.fillStyle;
            dest.strokeStyle = src.strokeStyle;
            /*
             obj.shadow = this.shadow;
             obj.shadowBlur = this.shadowBlur;
             obj.shadowOffsetX = this.shadowOffsetX;
             obj.shadowOffsetY = this.shadowOffsetY;
             */
            return dest;
        };

        for (var i = 0; i < 64; i++) {
            this._stack[i] = this.updateState(this, {});
        }

        this.getNativeCtx = function () { return this._ctx; }

        this.getElement = function(){
            return this.canvas;
        };

        this.textAlign = 'start';
        this.textBaseline = 'alphabetic';
        this.fillStyle = 'rgb(255,255,255)';
        this.strokeStyle = 'rgb(0,0,0)';

        this.destroy = function() {
            this._ctx.destroy();
        };

        this.show = function() {
            // TODO: NATIVE.gl.show();
        };

        this.hide = function() {
            // TODO: NATIVE.gl.hide();
        };

        this.clear = function() {
            this._ctx.clear();
        };

        this.swap = function(operations) {
            NATIVE.gl.flushImages();
        };

        this.loadIdentity = function() {
            this._ctx.loadIdentity();
        };

        this.save = function() {
            if (this._stack.length <= this._stackPos) {
                logger.log('expanding stack');
                this._stack.push({});
            }
            this.updateState(this, this._stack[this._stackPos++]);
            this._ctx.save();
        };

        this.restore = function() {
            this._ctx.restore();
            this.updateState(this._stack[this._stackPos--], this);
        };

        this.drawImage = function(img, x1, y1, w1, h1, x2, y2, w2, h2) {
            if (!img || !img.complete) { return; }
            var n = arguments.length,
                op = this.getCompositeOperationID();

            if (n == 3) {
                this._ctx.drawImage(img.__gl_name, img._src, 0, 0, img.width, img.height, x1, y1, img.width, img.height, op);
            } else if (n == 5) {
                this._ctx.drawImage(img.__gl_name, img._src, 0, 0, img.width, img.height, x1, y1, w1, h1, op);
            } else {
                this._ctx.drawImage(img.__gl_name, img._src, x1, y1, w1, h1, x2, y2, w2, h2, op);
            }
        };

        this.translate = function(x, y) { this._ctx.translate(x, y); }
        this.rotate = function(r) { this._ctx.rotate(r); }
        this.scale = function(x, y) { this._ctx.scale(x, y); }

        //FIXME the getter seems to crash v8 on android
        this.__defineSetter__(
            'globalAlpha',
            function(alpha) {
                this._ctx.setGlobalAlpha(alpha);
            }
        );

        this.__defineGetter__(
            'globalAlpha',
            function() {
                return this._ctx.getGlobalAlpha();
            }
        );

        var compositeOps = {
            'source-atop': 1337,
            'source-in': 1338,
            'source-out': 1339,
            'source-over': 1340,
            'destination-atop': 1341,
            'destination-in': 1342,
            'destination-out': 1343,
            'destination-over': 1344,
            'lighter': 1345,
            'xor': 1346,
            'copy': 1347
        };

        this._globalCompositeOperation = 'source-over';

        this.getCompositeOperationID = function() {
            return compositeOps[this.globalCompositeOperation] || 0;
        };

        this.setTransform = function(a, b, c, d, e, f) {
            this._ctx.loadIdentity();
            this.transform(a, b, c, d, e, f);
        }

        this.transform = function(a, b, c, d, e, f) {
            var n = arguments.length;

            if (n != 6) {
                console.log("Wrong tranform call with " + n + " parameters");
                return;

            }

            this._ctx.transform(a, b, c, d, e, f);

        }

        this.clearRect = function(x, y, width, height) {
            this._ctx.clearRect(x, y, width, height);
        };

        this.fillRect = function(x, y, width, height) {
            if (typeof this.fillStyle == 'object') {
                var img = this.fillStyle.img,
                    w = img.width, h = img.height,
                    wMax, hMax, xx, yy,
                    op = this.getCompositeOperationID();
                switch (this.fillStyle.repeatPattern) {
                    case 'repeat':
                        for (xx = 0; xx < width; xx += w) {
                            wMax = Math.min(w, width - xx);
                            for (yy = y; yy < height; yy += h) {
                                hMax = Math.min(h, height - yy);
                                this._ctx.drawImage(img.__gl_name, img._src, 0, 0, wMax, hMax, x + xx, y + yy, wMax, hMax, op);
                            }
                        }
                        break;
                    case 'repeat-x':
                        for (xx = 0; xx < width; xx += w) {
                            wMax = Math.min(w, width - xx);
                            this._ctx.drawImage(img.__gl_name, img._src, 0, 0, wMax, hMax, x + xx, y, wMax, hMax, op);
                        }
                        break;
                    case 'repeat-y':
                        for (yy = 0; yy < height; yy += h) {
                            hMax = Math.min(h, height - yy);
                            this._ctx.drawImage(img.__gl_name, img._src, 0, 0, wMax, hMax, x, y + yy, wMax, hMax, op);
                        }
                        break;
                    case 'no-repeat':
                    default:
                        wMax = Math.min(w, width);
                        hMax = Math.min(h, height);
                        this._ctx.drawImage(img.__gl_name, img._src, 0, 0, wMax, hMax, x, y, wMax, hMax, op);
                        break;
                }
            } else {
                this._ctx.fillRect(x, y, width, height, this.fillStyle, this.getCompositeOperationID());
            }
        };

        this.strokeRect = function(x, y, width, height) {
            this._ctx.strokeRect(x, y, width, height, this.strokeStyle, this.lineWidth || 1, this.getCompositeOperationID());
        };

        this.createPattern = function(img, repeatPattern) {
            return {
                img: img,
                repeatPattern: repeatPattern
            };
        };

        this._checkPath = function() {
            if (!this._path) {
                this._path = [];
            }
            if (this._pathIndex === undefined) {
                this._pathIndex = 0;
            }
            return (this._pathIndex > 0);
        };

        this.beginPath = function() {
            this._pathIndex = 0;
        };

        this.moveTo = this.lineTo = function(x, y) {
            this._checkPath();
            this._path[this._pathIndex] = {x:x, y:y};
            this._pathIndex++;
        };

        this.pointSprite = null;
        this.pointSpriteStep = 2;
        this.drawPointSprites = function (x1, y1, x2, y2) {
            this._ctx.drawPointSprites(this.pointSprite.src, this.lineWidth || 5, this.pointSpriteStep || 2, this.strokeStyle, x1, y1, x2, y2);
        }

        this.closePath = function() {};

        this.fill = function() {
            if (this._checkPath()) {
                this._ctx.fill(this._path, this._pathIndex, this.fillStyle, this.getCompositeOperationID());
            }
        };

        this.stroke = function() {
            if (this._checkPath()) {
                this._ctx.stroke(this._path, this._pathIndex, this.strokeStyle, this.getCompositeOperationID());
            }
        };

        this.fill = function () {}
        this.stroke = function () {}
    };
//</CONTEXT2D>

//<CANVAS>
    var Canvas = GLOBAL.HTMLCanvasElement = function() {
        this._width = 400;
        this._height = 400;
        this._offscreen = true;

        this.style = {};
        this._context2D = null;
        this.complete = true;

        this.__defineSetter__('width', function(width) {
            this._width = width;
            if (this._context2D) { this._resize(); }
        });

        this.__defineGetter__('width', function() { return this._width; });

        this.__defineSetter__('height', function(height) {
            this._height = height;
            if (this._context2D) { this._resize(); }
        });

        this.__defineGetter__('height', function() { return this._height; });

        this._resize = function() { console.log('resizing a rendered canvas is not yet implemented!' + ' new size ' + this._width + 'x' + this._height); }

        this.getContext = function(which) {
            if (which.toUpperCase() == '2D') {
                this.complete = true;
                return this._context2D || (this._context2D = new Context2D({
                    canvas: this,
                    offscreen: this._offscreen
                }));
            }
        }
    };
//</CANVAS>

//<EVENTHANDLER>
    handlers = {};

    NATIVE.events = {};
    NATIVE.events.registerHandler = function(name, handler) {
        handlers[name] = handler;
    }

    NATIVE.events.dispatchEvent = function(evt) {
        var e = evt;
        if (typeof e == 'string') {
            e = JSON.parse(e);
        }

        var handler = handlers[e.name];
        if (handler) {
            handler(e);
        }
    }


//</EVENTHANDLER>

//<IMAGELOADER>
    var loadingImages = [];

    NATIVE.gl.loadImage = function(image) {
        var texData = NATIVE.gl._loadImage(image._src);
        if (texData) {
            setTimeout(function() {
                image._onload(texData.width, texData.height, texData.name);
            }, 0);
        } else {
            if (!loadingImages[image._src]) {
                loadingImages[image._src] = [];
            }
            loadingImages[image._src].push(image);
        }
    }

    NATIVE.events.registerHandler('imageLoaded', function(evt) {

        var logURL = evt.url;
        if (logURL.substring(0, 11) == 'data:image/') {
            logURL = '<base64>';
        }

        logger.debug('imageLoaded:', logURL, evt.originalWidth + 'x' + evt.originalHeight, '(' + evt.width + 'x' + evt.height + ')');

        var images = loadingImages[evt.url];
        delete loadingImages[evt.url];

        if (images) {
            images.forEach(function(image) {
                image._onload(evt.originalWidth, evt.originalHeight, evt.glName);
                GLOBAL.GC && GC.app && GC.app.engine && GC.app.engine.needsRepaint();
            });
        }
    });

    NATIVE.events.registerHandler('imageError', function(evt) {
        var images = loadingImages[evt.url];
        if (images) {
            images.forEach(function(image) {
                if (image._onerror) {
                    image._onerror();
                }
            });
            delete images[evt.url];
        }
    });
//</IMAGELOADER>

//<IMAGESHIM>
var Image = function() {
        this._src   = undefined;
        this.width  = undefined;
        this.height = undefined;
        this.__gl_name = undefined;
        this.complete = false;


        this.destroy = function () {
            if (this.__gl_name) {
                NATIVE.gl.deleteTexture(this.__gl_name);
            }
        }

        this._onload = function(width, height, gl_name) {
            logger.log('onload called with', width, height, gl_name);
            this.complete = true;
            this.width = this.originalWidth = width;
            this.height = this.originalHeight = height;
            this.__gl_name = gl_name;

            this.onload && this.onload();
        }


        this.__defineSetter__('src', function(value) {
            if (!value) {
                logger.error('empty src set on an image!');
                //this._onerror();
                return;
            }

            this._src = value;
            NATIVE.gl.loadImage(this);
        });

        this.__defineGetter__('src', function() { return this._src; });
    }

GLOBAL.Image = Image;
//</IMAGESHIM>

//<INPUTS>
    var EVENT_MAP = {
        1: 'pointerdown',
        2: 'pointermove',
        3: 'pointerup'
    };

    NATIVE.timestep.InputEvent = function(id, evtType, x, y, root, target) {


        if(!EVENT_MAP[evtType]) {
            console.log('Unknown eventType ' + evtType);
            return;
        }

        var event = {
            type:       EVENT_MAP[evtType],
            pointerId:  id,
            button:     0,
            pageX:      x,
            pageY:      y
        }

        var handler = EVENT_HANDLER[ event['type'] ];

        if ( handler ) {
            handler( event );

        } else {
            console.log(' No event Handler found for ' + event['type'] );
        }
    };
//</INPUTS>

//<DOCUMENT>
    if (typeof document == 'undefined') {
        GLOBAL.document = {};
    }

    if (!document.createElement) {
        document.body = {
            appendChild: function() { }
        }

        document.createElement = function(type) {
            type = type.toUpperCase();

            if (type == "CANVAS") {
                return new Canvas();

            } else {
                return {};
            }
        }
    }
//</DOCUMENT>

//<XMLHttpRequest>
    var XMLHttpRequest = function() {
        var state = {
            "UNSENT": 0,
            "OPENED": 1,
            "HEADERS_RECEIVED": 2,
            "LOADING": 3,
            "DONE": 4
        };

        this.readyState = state.UNSENT;
        this.responseText = null;
        this._requestHeaders = {};
        this.__id = id;

        this.open = function(method, url, async) {
            this._method = method;
            this._url = '' + url;
            this._async = async || false;
            this.readyState = state.OPENED;
            this.status = 0;

            if (!this._async) {
                logger.warn("synchronous xhrs not supported");
            }
        }

        this.getResponseHeader = function(name) { return this._responseHeaders[name]; }

        this.getAllResponseHeaders = function () { return this._responseHeaders; }

        this.setRequestHeader = function(name, value) {
            this._requestHeaders[name] = value;
        }
        this.send = function(data) {
            this._data = data || "";
            xhrs[id++] = this;
            NATIVE.xhr.send(this._method, this._url, this._async, this._data, 0, this.__id, this._requestHeaders);
        }

        this.uploadFile = function (filename) {
            this._filename = filename;
            xhrs[id++] = this;
            NATIVE.xhr.uploadFile(this.__id, this._filename, this._url, this._async, this._requestHeaders);
        }

        this._onreadystatechange = function(state, status, response) {
            this.readyState = state;
            this.status = status;
            this.responseText = response || null;
            if (typeof this.onreadystatechange === 'function') {
                this.onreadystatechange();
            }
        }

        this.onreadystatechange = function() {}
    };

    var xhrs = {};
    var id = 0;

    GLOBAL.XMLHttpRequest = XMLHttpRequest;

    NATIVE.events.registerHandler('xhr', function(evt) {
        var xhr = xhrs[evt.id];
        if (xhr) {
            var headers = {};
            for(var i = 0, len = evt.headerKeys.length; i < len; i++) {
                headers[evt.headerKeys[i]] = evt.headerValues[i];
            }
            xhr._responseHeaders = headers;
            xhr._onreadystatechange(evt.state, evt.status, evt.response);
        }
        delete xhrs[evt.id];
    });

//</XMLHttpRequest>

//pretend that we support HTML5 Pointer API
GLOBAL.navigator.pointerEnabled = true;
GLOBAL.navigator.maxTouchPoints = 2;

GLOBAL.addEventListener = function(evtName) {
    console.log('TODO: implement evtHandler for window ' + evtName);
    //TODO: implement
}

document.addEventListener = function(evtName, handler) {
    console.log('Registered EventHandler ' + evtName + ' on the document object');
    EVENT_HANDLER[ evtName ] = handler;
}

GLOBAL.localStorage = {
	setItem : function( key, value ) {
		NATIVE.localStorage.setItem( key.toString(), value.toString() )
	},
	getItem : function( key ) {
		return NATIVE.localStorage.getItem( key.toString() || null )
	},
	removeItem : function( key ) {
		NATIVE.localStorage.removeItem( key.toString() )
	},
	clear : function() {
		NATIVE.localStorage.clear()
	},
	key : function() {
		logger.log( 'ERROR: localStorage.key() unimplemented' )

		return null
	}
};

if( !NATIVE.gl.initialized ) {
    NATIVE.gl.initialized = true
}


//gcapi/src/native/pauseResume.js:NATIVE.events.registerHandler('pause', bind(window, '__fireEvent', 'pagehide'));
//gcapi/src/native/pauseResume.js:NATIVE.events.registerHandler('resume', function() {
//gcapi/src/native/XMLHttpRequest.js:     NATIVE.events.registerHandler('xhr', function(evt) {
//gcapi/src/native/rotation.js:NATIVE.events.registerHandler('rotate', function(evt) {



NATIVE.onBackButton = function() {
    console.log('backButton');
}

NATIVE.onRotation = function() {
    console.log('rotation');
}

var started = false

NATIVE.screen.onResize = function( width, height ) {
	if( started ) {
		return

	} else {
		started = true
	}

	console.log( 'screen size is ' + width + 'x' + height )

	GLOBAL.innerWidth = width
	GLOBAL.innerHeight = height

	var config = {
		audioBackEnd :     'native',
		currentLanguage :  GLOBAL.navigator.language,
		id :               '',
		libraryUrl :       'resources/library',
		mode :             'deployed',
		platform :         'html5',
		renderingBackEnd : 'canvas-2d',
		screenSize :       [ width, height ],
		verbose :          true
	}

	var spell = GLOBAL.spell = {
		addToCache : function( x ) {
			this.cacheContent = x
		},
		setApplicationModule : function( x ) {
			this.applicationModule = x
		}
	}

	// loading engine library and application module
	NATIVE.eval(
		NATIVE.getFileSync( 'resources/spelljs/spell.js.mp3' ) + '\n' +
		NATIVE.getFileSync( 'resources/spelljs/data.js.mp3' )
	)

	var engineInstance = GLOBAL.require( 'spell/client/main', config )

	engineInstance.start( spell.applicationModule, spell.cacheContent )

	NATIVE.timer.start(
		function() {
			NATIVE.timestep.getEvents()

			if( TICK_CALLBACK ) {
				TICK_CALLBACK()
			}
		}
	)
}
