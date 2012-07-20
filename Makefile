SPELL_OPTIONS = -s src -m spell/client/main -i spell/client/runtimeModule,spell/shared/util/platform/private
SPELL_BUILD = build/spell.js

SPELL_HTML5_OPTIONS = -s src -m spell/client/main -i spell/client/runtimeModule,spell/shared/util/platform/private -e spell/shared/util/platform/private
SPELL_HTML5_BUILD = build/spell.html5.js

lib:
	mkdir -p build
	node tools/n.js $(SPELL_OPTIONS) > $(SPELL_BUILD)
	node tools/n.js $(SPELL_HTML5_OPTIONS) > $(SPELL_HTML5_BUILD)

.PHONY: docs
docs:
	jsduck --config docs/jsduck_conf.json
	cp docs/css/*.css docs/generated/resources/css
	cp docs/images/* docs/generated/resources/images

