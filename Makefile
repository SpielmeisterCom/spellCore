NEEDJS_LIB                  = src/need.js
SPELL_COMMON_OPTIONS        = -s src -m spell/client/main -i spell/shared/util/platform/private
SPELL_COMMON_LIB            = build/spellCore/lib/spell.common.js
SPELL_COMMON_MIN_LIB        = build/spellCore/lib/spell.common.min.js
SPELL_HTML5_ADAPTER_OPTIONS = -s src -m spell/client/main -i spell/shared/util/platform/private -e spell/shared/util/platform/private
SPELL_LOADER_LIB            = build/spellCore/lib/spell.loader.js
SPELL_LOADER_MIN_LIB        = build/spellCore/lib/spell.loader.min.js
SPELL_HTML5_ADAPTER_LIB     = build/spellCore/lib/spell.html5.js
SPELL_HTML5_ADAPTER_MIN_LIB = build/spellCore/lib/spell.html5.min.js
SPELL_ENGINE_DEBUG_LIB      = build/spellCore/lib/spell.debug.js
SPELL_ENGINE_RELEASE_LIB    = build/spellCore/lib/spell.release.js
SPELL_CLI_LIB               = build/spellCore/lib/spellcli.js
SPELL_CORE_OUT_DIR          = build/spellCore
SPELL_CORE_OUT_LIB_DIR      = $(SPELL_CORE_OUT_DIR)/lib
NODE                        = modules/nodejs/node
NODE_SRC                    = modules/nodejs/src
NODE_PATH                   = $$(modules/nodejs/node --which)

UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Darwin)
	SED = sed -i "" -e
	SPELL_CLI_OUT_DIR = build/osx-x64
	WINDOWS_ENV = false

else ifeq ($(UNAME_S),Linux)
	SED = sed -i
	SPELL_CLI_OUT_DIR = build/linux-x64
	WINDOWS_ENV = false

else ifeq ($(UNAME_S),CYGWIN_NT-6.1-WOW64)
	SED = sed -i
	WINDOWS_ENV = true
	SPELL_CLI_OUT_DIR = build/win-ia32
	VISUAL_STUDIO_PATCH_FILE = patches/nodejs_vs10.patch

else ifeq ($(UNAME_S),CYGWIN_NT-6.2-WOW64)
	SED = sed -i
	WINDOWS_ENV = true
	SPELL_CLI_OUT_DIR = build/win-ia32
	VISUAL_STUDIO_PATCH_FILE = patches/nodejs_vs11.patch
endif


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
