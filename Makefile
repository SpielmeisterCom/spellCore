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

	cat spellcli-deploy-begin.js >build/spellcli.js.tmp
	$(NODE) tools/n.js -s src -m spell/cli/developmentTool -i "fs,mkdirp,path,uglify-js,amd-helper,flob,child_process,xmlbuilder,os,underscore.string,rimraf,zipstream,util,commander" >>build/spellcli.js.tmp
	cat spellcli-deploy-end.js >>build/spellcli.js.tmp

	$(NODE) tools/n.js mangle build/spellcli.js.tmp >build/spellcli.js --no-anonymization
	rm build/spellcli.js.tmp


.PHONY: cli
cli: cli-js
	# creating cli executable
	cp $(NODE_PATH) build
	cp spellcli build

.PHONY: dev
dev : $(SPELL_ENGINE_INCLUDE_DEV_BUILD) $(SPELL_ENGINE_INCLUDE_DEPLOY_BUILD)

.PHONY: deploy
deploy: clean $(SPELL_ENGINE_INCLUDE_DEPLOY_BUILD) cli
	rm $(SPELL_ENGINE_INCLUDE_DEV_BUILD)
	cp -R library  build/

	#copy html templates to build directory
	cp -R htmlTemplate build/

	#cleaning html templates
	rm build/htmlTemplate/spellEdShim.html

.PHONY: $(SPELL_ENGINE_INCLUDE_DEPLOY_BUILD)
$(SPELL_ENGINE_INCLUDE_DEPLOY_BUILD): $(SPELL_ENGINE_INCLUDE_DEV_BUILD)
	# build engine include for deployment mode
	$(NODE) tools/n.js mangle $(SPELL_ENGINE_INCLUDE_DEV_BUILD) > $(SPELL_ENGINE_INCLUDE_DEPLOY_BUILD)

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

