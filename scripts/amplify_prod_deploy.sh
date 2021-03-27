#!/bin/bash
IFS='|'
echo
echo "START: building and publishing amplify app..."
npm install --global --unsafe-perm @aws-amplify/cli@latest


if [ -z "$AWS_ACCESS_KEY_ID" ] && [ -z "$AWS_SECRET_ACCESS_KEY" ] ; then
  echo "You must provide the action with both AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables in order to deploy"
  exit 1
fi

if [ -z "$AWS_REGION" ] ; then
  echo "You must provide AWS_REGION environment variable in order to deploy"
  exit 1
fi

if [ -z $(which amplify) ] || [ -n "$8" ] ; then
  echo "Installing amplify globaly"
  npm install -g @aws-amplify/cli@${8}
else
  echo "using amplify available at PATH"
fi

which amplify

REACTCONFIG="{\
\"SourceDir\":\"src\",\
\"DistributionDir\":\"build\",\
\"BuildCommand\":\"npm run-script build\",\
\"StartCommand\":\"npm run-script start\"\
}"
AWSCLOUDFORMATIONCONFIG="{\
\"configLevel\":\"project\",\
\"useProfile\":false,\
\"profileName\":\"default\",\
\"accessKeyId\":\"$AWS_ACCESS_KEY_ID\",\
\"secretAccessKey\":\"$AWS_SECRET_ACCESS_KEY\",\
\"region\":\"us-east-1\",\
\"awsConfigFilePath\":\"~/.aws/config\"\
}"
AMPLIFY="{\
\"projectName\":\"psv\",\
\"defaultEditor\":\"code\"\
}"
FRONTEND="{\
\"frontend\":\"javascript\",\
\"framework\":\"react\",\
\"config\":$REACTCONFIG\
}"
PROVIDERS="{\
\"awscloudformation\":$AWSCLOUDFORMATIONCONFIG\
}"

echo
echo "amplify version $(amplify --version)"
echo '{"projectPath": "'"$(pwd)"'","defaultEditor":"code","envName":"prod"}' > ./amplify/.config/local-env-info.json

# if environment doesn't exist fail explicitly
if [ -z "$(amplify env get --name prod | grep 'No environment found')" ] ; then  
    echo "found existing environment prod"
    amplify env pull --yes prod --providers $PROVIDERS
else
    echo "prod environment does not exist.. exiting";
    exit 1
fi


amplify status
echo
echo  "START: amplify configure..."
amplify configure project \
--amplify $AMPLIFY \
--frontend $FRONTEND \
--providers $PROVIDERS \
--yes
echo -n "END: amplify configure."

amplify status

echo
echo "START: installing the node project dependencies..."
npm ci
echo "DONE: installing the node project dependencies."
echo
echo "START: running the unit tests..."
npm run test

if [ $? -ne 0 ]; then
  echo "unit tests failed, aborting ..."
  exit 1
fi

echo "DONE: running the unit tests."

echo
echo "START: amplify prod publish..."
amplify publish prod --yes

if [ $? -ne 0 ]; then
  echo "amplify publish failed, aboring..."
  exit 1
fi

echo "DONE: amplify prod publish."

echo "DONE: building and publishing amplify app."