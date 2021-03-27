#!/usr/bin/env bash
set -x
set -e
{
    AWS_CONFIG_FILE=~/.aws/config
    AWS_CREDENTIALS_FILE=~/.aws/credentials

    mkdir ~/.aws
    touch $AWS_CONFIG_FILE
    touch $AWS_CREDENTIALS_FILE
    chmod 600 $AWS_CONFIG_FILE
    chmod 600 $AWS_CREDENTIALS_FILE

    echo "[default]"                                      >> $AWS_CONFIG_FILE
    echo "output = json"                                  >> $AWS_CONFIG_FILE
    echo "region = us-east-1"                             >> $AWS_CONFIG_FILE   
    echo "[default]"                                      >> $AWS_CREDENTIALS_FILE
    echo "aws_access_key_id=${AWS_ACCESS_KEY_ID}"         >> $AWS_CREDENTIALS_FILE
    echo "aws_secret_access_key=${AWS_SECRET_ACCESS_KEY}" >> $AWS_CREDENTIALS_FILE

} &> /dev/null