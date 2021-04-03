#!/bin/bash

echo "START: unset aws creds..."

unset AWS_ACCESS_KEY_ID
unset AWS_SECRET_ACCESS_KEY

rm -rf ~/.aws

echo "END: unset aws creds..."