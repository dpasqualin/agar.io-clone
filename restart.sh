#!/bin/bash

remove=$1

robots=src/robot/robots

if test -n "$remove"; then
    robot=$robots/$remove
    if test -f $robot; then
        rm $robot
    else
        echo "nao existe robo $remove"
        echo $(ls -l $robots | awk '{print $9}')
        exit 1
    fi

    cur=$(grep maxPlayers config.json | cut -d: -f2 | cut -d, -f1)
    next=$(( cur - 1 ))
    sed -i "s/maxPlayers.*/maxPlayers\": $next,/" config.json
fi

npm start
