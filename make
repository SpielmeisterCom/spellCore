#!/bin/sh

NODE=../nodejs/node

TARGET=$1

if [ -z $TARGET ]; then
	echo Usage: $0 target 
	echo
	echo Available targets:
	echo
	echo cli - build a standalone version of the cli tool
	echo
	exit
fi


if [ "$TARGET" = "cli" ]; then
	if [ ! -d build/cli ]; then
		mkdir -p build/cli
	fi
	
	rm build/cli/*
	cat spellcli-deploy-begin.js >build/cli/spellcli.js.tmp
	$NODE tools/n.js -s src -m spell/cli/developmentTool -i fs,mkdirp,path,uglify-js,amd-helper,flob,child_process,xmlbuilder,os,underscore.string,rimraf,zipstream,util,commander >>build/cli/spellcli.js.tmp
	cat spellcli-deploy-end.js >>build/cli/spellcli.js.tmp

	$NODE tools/n.js mangle build/cli/spellcli.js.tmp >build/cli/spellcli.js --no-anonymization
	rm build/cli/spellcli.js.tmp
	

fi
