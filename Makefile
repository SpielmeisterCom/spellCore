NEEDJS_BUILD = src/need.js
SPELL_COMMON_OPTIONS = -s src -m spell/client/main -i spell/client/runtimeModule,spell/shared/util/platform/private
SPELL_COMMON_BUILD = build/spell.common.js
SPELL_HTML5_OPTIONS = -s src -m spell/client/main -i spell/client/runtimeModule,spell/shared/util/platform/private -e spell/shared/util/platform/private
SPELL_HTML5_BUILD = build/spell.html5.js
SPELL_ENGINE_INCLUDE_DEV_BUILD = build/spell.dev.js
SPELL_ENGINE_INCLUDE_DEPLOY_BUILD = build/spell.deploy.js


.PHONY: dev
dev : $(SPELL_ENGINE_INCLUDE_DEV_BUILD) $(SPELL_ENGINE_INCLUDE_DEPLOY_BUILD)

.PHONY: deploy
deploy: $(SPELL_ENGINE_INCLUDE_DEPLOY_BUILD)
	rm $(SPELL_ENGINE_INCLUDE_DEV_BUILD)

.PHONY: $(SPELL_ENGINE_INCLUDE_DEPLOY_BUILD)
$(SPELL_ENGINE_INCLUDE_DEPLOY_BUILD): $(SPELL_ENGINE_INCLUDE_DEV_BUILD)
	# build engine include for deployment mode
	node tools/n.js mangle $(SPELL_ENGINE_INCLUDE_DEV_BUILD) > $(SPELL_ENGINE_INCLUDE_DEPLOY_BUILD)

.PHONY: $(SPELL_ENGINE_INCLUDE_DEV_BUILD)
$(SPELL_ENGINE_INCLUDE_DEV_BUILD): libs
	# build engine includes for development mode
	mkdir -p build
	cat $(NEEDJS_BUILD) $(SPELL_COMMON_BUILD) $(SPELL_HTML5_BUILD) > $(SPELL_ENGINE_INCLUDE_DEV_BUILD)

libs:
	mkdir -p build
	node tools/n.js $(SPELL_COMMON_OPTIONS) > $(SPELL_COMMON_BUILD)
	node tools/n.js $(SPELL_HTML5_OPTIONS) > $(SPELL_HTML5_BUILD)

.PHONY: clean
clean:
	rm -rf build/*

.PHONY: docs
docs:
	jsduck --config docs/jsduck_conf.json
	cp docs/css/*.css docs/generated/resources/css
	cp docs/images/* docs/generated/resources/images
	cp docs/favicon.ico docs/generated/favicon.ico

