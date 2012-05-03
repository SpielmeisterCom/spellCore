dev:
#	node node_modules/.bin/r.js -o baseUrl=src optimize=none name=spell/client/main out=public/output/spell.js
	node node_modules/.bin/r.js -o baseUrl=src optimize=none name=spell/client/main out=/tmp/spell.js
	cat src/need.js /tmp/spell.js > public/output/spell.js


deploy:
	node node_modules/.bin/r.js -o baseUrl=src optimize=uglify name=spell/client/main out=public/output/spell.min.js
