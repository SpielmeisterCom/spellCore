define(
	'spell/server/util/connect/createExtDirectBackEnd',
	[
		'mongodb',
		'querystring'
	],
	function(
		mongodb,
		querystring
	) {
		'use strict'


		/*
		 * private
		 */

		function parseMultipart(request, callback) {
			var parser = multipart.parser(),
				filesCount = 0,
				partsCount = 0,
				data = {};

			request.setEncoding('binary');
	//        var iconv = new Iconv('UTF-8', 'ISO-8859-1');

			parser.headers = request.headers;

			request.addListener("data", function(chunk) {
				parser.write(chunk);
			});

			request.addListener("end", function() {
				parser.close();
			});

			parser.onPartBegin = function(part) {
				request.pause();
				partsCount++;
				if (part.filename) {
					filesCount++;
					var gridStore = new mongodb.GridStore(GEN_DB, part.filename, "w");
						gridStore.open(function(err, gridStore) {
							if (err) {
								sys.puts(err);
							}
							request.resume();
						});
					data[part.name] = {
						filename: part.filename,
						stream: gridStore
					};
				} else {
					data[part.name] = '';
				}
			};

			parser.onData = function(chunk) {
				var part = parser.part;
				if (part.filename) {
					request.pause();
					data[part.name].stream.write(chunk, function(err, stream){
						request.resume();
					});
	//            } else {
	//                data[part.name] += iconv.convert(chunk).toString('utf8');
				}
			};

			parser.onEnd = function() {
				var i = 0;
				for (var n in data) {
					i++;
					if (data[n].filename) {
						data[n].stream.close(function(err) {
							if (err) sys.puts(err);
						});
					} else {
					}
					if (partsCount == i) {
						callback.call(null, data);
					}
				}
			};
		}

		function parseJson(request, callback) {
			request.setEncoding('utf8');
			var data = '';
			request.addListener('data', function(chunk) {
				data += chunk;
			});
			request.addListener('end', function() {
				var json;
				try {
					json = JSON.parse(data);
				} catch (e) {
				}
				if (!json) {
					json = querystring.parse(data);
				}
				callback.call(null, json);
			});
		}


		/*
		 * public
		 */

		return function( remotingUrl, remotingNamespace, remotingActions ) {
			Function.prototype.method = function(name, func) {
				this.prototype[name] = func;
				return this;
			};

			Function.method('remoting', function(cfg) {
				var that = this;
				var name = cfg.name || '';
				var len = cfg.len || 0;
				var form_handler = cfg.form_handler || false;
				if (!remotingActions[cfg.action]) {
					remotingActions[cfg.action] = {};
				}

				remotingActions[cfg.action][name] = {
					name: name,
					len: len,
					func: that,
					form_handler: form_handler
				};

				return function() {
					return that.apply(null, arguments);
				};
			});

			function get_api(request, response)  {
				var actions = {};
				for (var act in remotingActions) {
					actions[act] = [];
					for (var m in remotingActions[act]) {
						var cfg = remotingActions[act][m];
						actions[act].push({
							name: cfg.name,
							len: cfg.len,
							formHandler: cfg.form_handler
						});
					}
				}
				var config = {
					'url'       : remotingUrl,
					'namespace' : remotingNamespace,
					'type'      : 'remoting',
					'actions'   : actions
				}

				var api = JSON.stringify(config)
				response.writeHead(200, {'Content-Type': 'text/javascript'});
				response.end(api);
			}

			function router(request, response, next) {
				var contentType = request.headers['content-type'],
					onEndCallback = function(data) {
						var total_req = data.length,
							complited_req = 0,
							responses = [];

						if (!(data instanceof Array)) {
							data = [data];
						}

						for (var i in data) {
							var act_data = data[i];
							if (act_data['extAction']) {
								var extdirect_req = {
									action: act_data['extAction'],
									method: act_data['extMethod'],
									tid: act_data['extTID'],
									type: act_data['extType'],
									isForm: true,
									isUpload: act_data['extUpload'] == "true"
								}
							} else {
								extdirect_req = act_data;
							}

							var extdirect_res = extdirect_req;

							var action = extdirect_req.action;
							var method = extdirect_req.method;

							var mcfg = {};
							for( var t in remotingActions[action] ) {
								var config = remotingActions[action][t]
								if( config.name === method ) mcfg = config
							}

							if (extdirect_req.isForm) {
								var extdirect_post_data = act_data;
								delete extdirect_post_data.extAction;
								delete extdirect_post_data.extMethod;
								delete extdirect_post_data.extTID;
								delete extdirect_post_data.extType;
								delete extdirect_post_data.extUpload;
							} else {
								var extdirect_post_data = act_data.data;
							}

							try {
								var func = mcfg.func;
								var callback = function(extdirect_res){
									return function(result) {
										extdirect_res['result'] = result;
										responses.push(extdirect_res);
										complited_req++;
										if (complited_req == data.length) {
											if (!extdirect_res.isUpload) {
												response.writeHead(200, {'Content-type': 'application/json'});
											} else {
												response.writeHead(200, {'Content-type': 'text/html'});
											}
											response.end(JSON.stringify(responses), 'utf8');
										}
									}
								}.apply(null, [extdirect_res]);

								callback(
									func.call(
										callback,
										request,
										response,
										extdirect_post_data,
										next
									)
								)

							} catch(e) {
								return next( )
							}
						}
					};
				if (contentType.match(/multipart/i)) {
					parseMultipart(request, onEndCallback);
				} else {
					parseJson(request, onEndCallback);
				}
			}

			return {
				get_api : get_api,
				router : router
			}
		}
	}
)
