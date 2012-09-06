#!/bin/bash

SOUND_FILE="/home/martin/Musik/218.wav"

inotifywait -m -r src -e modify | while read event; do
	make
	echo done...
	if [ -e "$SOUND_FILE" ]
	then
		play -q $SOUND_FILE
	fi
done
