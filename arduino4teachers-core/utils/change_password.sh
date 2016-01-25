#!/bin/bash

echo -e "$1\n$1" | docker exec -i $2 passwd