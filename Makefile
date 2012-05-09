dev:
	node node_modules/.bin/r.js -o baseUrl=src optimize=none name=spell/client/main out=/tmp/spell.js
	mkdir -p build
	cat src/need.js /tmp/spell.js src/spell/shared/build/deploymentGlue.js > build/spell.js

deploy:
	node node_modules/.bin/r.js -o baseUrl=src optimize=uglify name=spell/client/main out=build/spell.min.js
