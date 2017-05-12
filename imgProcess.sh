#!/bin/bash

processImg () {
    OUTFILE="../$2/$1"
    PARENT_DIR_NAME=$(dirname $OUTFILE)
    if [ ! -d "$PARENT_DIR_NAME" ]; then
        mkdir -p $PARENT_DIR_NAME
    fi
    if [ "$f" -nt "$OUTFILE" ]; then
      echo "Processing $1 $3 $OUTFILE"
      sips -Z $3 $1 --out $OUTFILE
    fi

}

(
cd img/large
for f in **/*.jpg
do
    processImg $f med 700
    processImg $f sm 200
done
)

