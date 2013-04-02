NEEDJS_BUILD = src/need.js
SPELL_COMMON_OPTIONS = -s src -m spell/client/main -i spell/client/runtimeModule,spell/shared/util/platform/private
SPELL_COMMON_BUILD = build/spell.common.js
SPELL_HTML5_OPTIONS = -s src -m spell/client/main -i spell/client/runtimeModule,spell/shared/util/platform/private -e spell/shared/util/platform/private
SPELL_HTML5_BUILD = build/spell.html5.js
SPELL_UTIL_OPTIONS = -s src -m spell/server/build/dependencies -i "fs,mkdirp,path,uglify-js,amd-helper,flob,child_process,xmlbuilder,os,underscore.string,rimraf,zipstream,util"
SPELL_UTIL_INCLUDE_BUILD = build/spell.util.js
SPELL_ENGINE_INCLUDE_DEV_BUILD = build/spell.dev.js
SPELL_ENGINE_INCLUDE_DEPLOY_BUILD = build/spell.deploy.js
NODE = ../nodejs/node
NODE_PATH = $$(../nodejs/node --which)

.PHONY: cli-js
cli-js:
	# creating the javascript includes for the command line tool 
	mkdir -p build

	cat spellcli-deploy-begin.js >build/spell.cli.js.tmp
	$(NODE) tools/n.js -s src -m spell/cli/developmentTool -i "fs,mkdirp,path,uglify-js,amd-helper,flob,child_process,xmlbuilder,os,underscore.string,rimraf,zipstream,util,commander" >>build/spell.cli.js.tmp
	cat spellcli-deploy-end.js >>build/spell.cli.js.tmp

	$(NODE) tools/n.js mangle build/spell.cli.js.tmp >build/spell.cli.js --no-anonymization
	rm build/spell.cli.js.tmp


.PHONY: cli
cli: cli-js
	# creating cli executable
	mv build/spell.cli.js ../nodejs-src/lib/_third_party_main.js

	#patch includes in _third_party_main.js
	sed -i 's/uglify-js/uglifyjs/g' ../nodejs-src/lib/_third_party_main.js  

	#integrate requirejs
	tail -n +2 ../../node_modules/requirejs/bin/r.js >../nodejs-src/lib/requirejs.js

	#integrate mkdirp
	cp ../../node_modules/mkdirp/index.js ../nodejs-src/lib/mkdirp.js

	#integrate uglify-js
	cp ../../node_modules/uglify-js/uglify-js.js ../nodejs-src/lib/uglifyjs.js
	cp ../../node_modules/uglify-js/lib/process.js ../nodejs-src/lib/uglifyjs_process.js
	cp ../../node_modules/uglify-js/lib/parse-js.js ../nodejs-src/lib/uglifyjs_parsejs.js
	cp ../../node_modules/uglify-js/lib/squeeze-more.js ../nodejs-src/lib/uglifyjs_squeezemore.js
	cp ../../node_modules/uglify-js/lib/consolidator.js ../nodejs-src/lib/uglifyjs_consolidator.js
	sed -i 's/\.\/lib\/parse-js/uglifyjs_parsejs/g' ../nodejs-src/lib/*.js
	sed -i 's/\.\/parse-js/uglifyjs_parsejs/g' ../nodejs-src/lib/*.js
	sed -i 's/\.\/lib\/process/uglifyjs_process/g' ../nodejs-src/lib/*.js
	sed -i 's/\.\/process/uglifyjs_process/g' ../nodejs-src/lib/*.js
	sed -i 's/\.\/lib\/squeeze-more/uglifyjs_squeezemore/g' ../nodejs-src/lib/*.js
	sed -i 's/\.\/squeeze-more/uglifyjs_squeezemore/g' ../nodejs-src/lib/*.js
	sed -i 's/\.\/lib\/consolidator/uglifyjs_consolidator/g' ../nodejs-src/lib/*.js
	sed -i 's/\.\/consolidator/uglifyjs_consolidator/g' ../nodejs-src/lib/*.js

	#integrate underscore
	cp ../../node_modules/underscore/underscore.js ../nodejs-src/lib/underscore.js

	#integrate falafel
	cp ../../node_modules/falafel/index.js ../nodejs-src/lib/falafel.js

	#integrate esprima
	cp ../../node_modules/falafel/node_modules/esprima/esprima.js ../nodejs-src/lib/esprima.js

	#integrate amd-helper
	cp ../../node_modules/amd-helper/lib/index.js ../nodejs-src/lib/amdhelper.js
	cp ../../node_modules/amd-helper/lib/createModuleHeader.js ../nodejs-src/lib/amdhelper_createModuleHeader.js
	cp ../../node_modules/amd-helper/lib/extractModuleHeader.js ../nodejs-src/lib/amdhelper_extractModuleHeader.js
	cp ../../node_modules/amd-helper/lib/loadModule.js ../nodejs-src/lib/amdhelper_loadModule.js
	cp ../../node_modules/amd-helper/lib/loadModules.js ../nodejs-src/lib/amdhelper_loadModules.js
	cp ../../node_modules/amd-helper/lib/traceDependencies.js ../nodejs-src/lib/amdhelper_traceDependencies.js
	sed -i 's/amd-helper/amdhelper/g' ../nodejs-src/lib/*.js
	sed -i 's/.\/extractModuleHeader/amdhelper_extractModuleHeader/g' ../nodejs-src/lib/*.js
	sed -i 's/.\/loadModule/amdhelper_loadModule/g' ../nodejs-src/lib/*.js
	sed -i 's/.\/createModuleHeader/amdhelper_createModuleHeader/g' ../nodejs-src/lib/*.js
	sed -i 's/.\/traceDependencies/amdhelper_traceDependencies/g' ../nodejs-src/lib/*.js

	#integrate flob
	cp ../../node_modules/flob/lib/index.js ../nodejs-src/lib/flob.js
	cp ../../node_modules/flob/lib/byTypes.js ../nodejs-src/lib/flob_byTypes.js
	cp ../../node_modules/flob/lib/sync.js ../nodejs-src/lib/flob_sync.js
	sed -i 's/.\/byTypes/flob_byTypes/g' ../nodejs-src/lib/flob.js
	sed -i 's/.\/sync/flob_sync/g' ../nodejs-src/lib/flob.js

	#integrate glob
	cp ../../node_modules/glob/glob.js ../nodejs-src/lib/glob.js

	#integrate graceful-fs (dependency for glob)
	cp ../../node_modules/glob/node_modules/graceful-fs/graceful-fs.js ../nodejs-src/lib/gracefulfs.js
	sed -i 's/graceful-fs/gracefulfs/g' ../nodejs-src/lib/*.js

	#integrate minimatch (dependency for glob)
	cp ../../node_modules/glob/node_modules/minimatch/minimatch.js ../nodejs-src/lib/minimatch.js

	#integrate lru-cache (dependency for minimatch)
	cp ../../node_modules/glob/node_modules/minimatch/node_modules/lru-cache/lib/lru-cache.js ../nodejs-src/lib/lrucache.js
	sed -i 's/lru-cache/lrucache/g' ../nodejs-src/lib/*.js

	#integrate inherits
	cp ../../node_modules/glob/node_modules/inherits/inherits.js ../nodejs-src/lib/inherits.js

	#integrate underscore.string
	cp ../../node_modules/underscore.string/lib/underscore.string.js ../nodejs-src/lib/underscorestring.js
	sed -i 's/underscore.string/underscorestring/g' ../nodejs-src/lib/*.js

	#integrate xmlbuilder
	cp ../../node_modules/xmlbuilder/lib/index.js ../nodejs-src/lib/xmlbuilder.js
	cp ../../node_modules/xmlbuilder/lib/XMLBuilder.js ../nodejs-src/lib/xmlbuilder_XMLBuilder.js
	cp ../../node_modules/xmlbuilder/lib/XMLFragment.js ../nodejs-src/lib/xmlbuilder_XMLFragment.js
	sed -i 's/.\/XMLBuilder/xmlbuilder_XMLBuilder/g' ../nodejs-src/lib/xmlbuilder*.js
	sed -i 's/.\/XMLFragment/xmlbuilder_XMLFragment/g' ../nodejs-src/lib/xmlbuilder*.js

	#integrate rimraf
	cp ../../node_modules/rimraf/rimraf.js ../nodejs-src/lib/rimraf.js

	#integrate zipstream
	cp ../../node_modules/zipstream/zipstream.js ../nodejs-src/lib/zipstream.js
	cp ../../node_modules/zipstream/crc32.js ../nodejs-src/lib/zipstream_crc32.js
	sed -i 's/.\/crc32/zipstream_crc32/g' ../nodejs-src/lib/zipstream.js

	#integrate commander
	cp ../../node_modules/commander/lib/commander.js ../nodejs-src/lib/commander.js

	#compile nodejs
	cd ../nodejs-src && ./configure && make -j4
	cp ../nodejs-src/out/Release/node build/spellcli

	#strip symbols from new copiled file
	strip build/spellcli
	../upx/upx -9 build/spellcli

.PHONY: dev
dev : $(SPELL_ENGINE_INCLUDE_DEV_BUILD) $(SPELL_ENGINE_INCLUDE_DEPLOY_BUILD)

.PHONY: deploy
deploy: clean $(SPELL_ENGINE_INCLUDE_DEPLOY_BUILD) cli
	# deleting unminified source files
	rm $(SPELL_ENGINE_INCLUDE_DEV_BUILD)

	cp -R library  build/

	#copy html templates to build directory
	cp -R htmlTemplate build/

.PHONY: $(SPELL_ENGINE_INCLUDE_DEPLOY_BUILD)
$(SPELL_ENGINE_INCLUDE_DEPLOY_BUILD): $(SPELL_ENGINE_INCLUDE_DEV_BUILD)
	# build engine include for deployment mode
	$(NODE) tools/n.js mangle $(SPELL_ENGINE_INCLUDE_DEV_BUILD) > $(SPELL_ENGINE_INCLUDE_DEPLOY_BUILD)
	$(NODE) tools/n.js mangle build/spell.loader.js > build/spell.loader.minified.js --no-anonymization
	mv build/spell.loader.minified.js build/spell.loader.js

.PHONY: $(SPELL_ENGINE_INCLUDE_DEV_BUILD)
$(SPELL_ENGINE_INCLUDE_DEV_BUILD): libs
	# build engine includes for development mode
	mkdir -p build
	cat $(NEEDJS_BUILD) $(SPELL_COMMON_BUILD) $(SPELL_HTML5_BUILD) > $(SPELL_ENGINE_INCLUDE_DEV_BUILD)

libs:
	mkdir -p build
	$(NODE) tools/n.js $(SPELL_COMMON_OPTIONS) > $(SPELL_COMMON_BUILD)
	$(NODE) tools/n.js $(SPELL_HTML5_OPTIONS) > $(SPELL_HTML5_BUILD)
	$(NODE) tools/n.js $(SPELL_UTIL_OPTIONS) > $(SPELL_UTIL_INCLUDE_BUILD)
	cp src/spell/client/stageZeroLoader.js build/spell.loader.js

.PHONY: clean
clean:
	rm -rf build/*

.PHONY: docs
docs:
	jsduck --config docs/jsduck_conf.json
	cp docs/css/*.css docs/generated/resources/css
	cp docs/images/* docs/generated/resources/images
	cp docs/favicon.ico docs/generated/favicon.ico

