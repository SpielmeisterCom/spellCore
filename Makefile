SPELL_OPTIONS = -b src -m spell/client/main -e spell/client/runtimeModule,spell/shared/util/platform
SPELL_BUILD = build/spell.js

SPELL_HTML5_OPTIONS = -b src -m spell/client/main -e spell/client/runtimeModule -i spell/shared/util/platform
SPELL_HTML5_BUILD = build/spell.html5.js

debug:
	mkdir -p build
	node tools/n.js $(SPELL_OPTIONS) > $(SPELL_BUILD)
	node tools/n.js $(SPELL_HTML5_OPTIONS) > $(SPELL_HTML5_BUILD)

deploy:
	node node_modules/.bin/r.js -o baseUrl=src optimize=uglify name=spell/client/main out=build/spell.min.js
