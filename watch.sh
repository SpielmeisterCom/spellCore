#!/bin/bash

SOUND_FILE="/home/martin/Musik/218.wav"

inotifywait -m -r src -e modify | while read event; do
	time make
	echo done...
	if [ -e "$SOUND_FILE" ]
	then
		play -v 0.5 -q $SOUND_FILE
	fi
done
