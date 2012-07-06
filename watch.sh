#!/bin/bash
inotifywait -m -r src -e modify | while read event; do
	make
	echo done...
done
