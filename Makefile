NEEDJS_LIB                  = src/need.js
SPELL_COMMON_OPTIONS        = -s src -m spell/client/main -i spell/shared/util/platform/private
SPELL_COMMON_LIB            = build/lib/spell.common.js
SPELL_COMMON_MIN_LIB        = build/lib/spell.common.min.js
SPELL_HTML5_ADAPTER_OPTIONS = -s src -m spell/client/main -i spell/shared/util/platform/private -e spell/shared/util/platform/private
SPELL_LOADER_LIB            = build/lib/spell.loader.js
SPELL_LOADER_MIN_LIB        = build/lib/spell.loader.min.js
SPELL_HTML5_ADAPTER_LIB     = build/lib/spell.html5.js
SPELL_HTML5_ADAPTER_MIN_LIB = build/lib/spell.html5.min.js
SPELL_ENGINE_DEBUG_LIB      = build/lib/spell.debug.js
SPELL_ENGINE_RELEASE_LIB    = build/lib/spell.release.js
SPELL_CORE_OUT_DIR          = build
SPELL_CORE_OUT_LIB_DIR      = $(SPELL_CORE_OUT_DIR)/lib
NODE                        = modules/nodejs/node
NODE_SRC                    = modules/nodejs/src
NODE_PATH                   = $$(modules/nodejs/node --which)

.PHONY: all
all: engine-release

.PHONY: engine-debug
engine-debug: clean $(SPELL_ENGINE_DEBUG_LIB) $(SPELL_ENGINE_RELEASE_LIB) additional-dependencies


.PHONY: engine-release
engine-release: clean $(SPELL_ENGINE_RELEASE_LIB) additional-dependencies
	# deleting unminified files
	rm -f $(SPELL_COMMON_LIB) $(SPELL_HTML5_ADAPTER_LIB) $(SPELL_LOADER_LIB) $(SPELL_ENGINE_DEBUG_LIB)


.PHONY: additional-dependencies
additional-dependencies:
	# copy additional dependencies to output directory
	cp -R library $(SPELL_CORE_OUT_DIR)
	cp -R htmlTemplate $(SPELL_CORE_OUT_DIR)


$(SPELL_ENGINE_DEBUG_LIB): $(SPELL_COMMON_LIB) $(SPELL_HTML5_ADAPTER_LIB) $(SPELL_LOADER_LIB)
	# build engine library for debug mode
	cat $(NEEDJS_LIB) $(SPELL_COMMON_LIB) $(SPELL_HTML5_ADAPTER_LIB) > $(SPELL_ENGINE_DEBUG_LIB)


$(SPELL_ENGINE_RELEASE_LIB): $(SPELL_COMMON_MIN_LIB) $(SPELL_HTML5_ADAPTER_MIN_LIB) $(SPELL_LOADER_MIN_LIB)
	# build engine library for release mode
	$(NODE) tools/n.js mangle $(NEEDJS_LIB) > $(SPELL_ENGINE_RELEASE_LIB)
	cat $(SPELL_COMMON_MIN_LIB) $(SPELL_HTML5_ADAPTER_MIN_LIB) >> $(SPELL_ENGINE_RELEASE_LIB)


$(SPELL_COMMON_LIB):
	mkdir -p $(SPELL_CORE_OUT_LIB_DIR)
	$(NODE) tools/n.js $(SPELL_COMMON_OPTIONS) > $(SPELL_COMMON_LIB)


$(SPELL_COMMON_MIN_LIB): $(SPELL_COMMON_LIB)
	$(NODE) tools/n.js mangle $(SPELL_COMMON_LIB) > $(SPELL_COMMON_MIN_LIB)


$(SPELL_HTML5_ADAPTER_LIB):
	mkdir -p $(SPELL_CORE_OUT_LIB_DIR)
	$(NODE) tools/n.js $(SPELL_HTML5_ADAPTER_OPTIONS) > $(SPELL_HTML5_ADAPTER_LIB)


$(SPELL_HTML5_ADAPTER_MIN_LIB): $(SPELL_HTML5_ADAPTER_LIB)
	$(NODE) tools/n.js mangle $(SPELL_HTML5_ADAPTER_LIB) > $(SPELL_HTML5_ADAPTER_MIN_LIB)


$(SPELL_LOADER_LIB):
	mkdir -p $(SPELL_CORE_OUT_LIB_DIR)
	cp src/spell/client/stageZeroLoader.js $(SPELL_LOADER_LIB)


$(SPELL_LOADER_MIN_LIB): $(SPELL_LOADER_LIB)
	$(NODE) tools/n.js mangle $(SPELL_LOADER_LIB) > $(SPELL_LOADER_MIN_LIB) --no-anonymization


.PHONY: clean
clean:
	rm -rf build/*
