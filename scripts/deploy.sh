#!/usr/bin/env bash

if [ "$1" != "--major" ] && [ "$1" != "--minor" ] && [ "$1" != "--patch" ]
then
  echo 'Wrong/Missing argument, accepted "--major"/"--minor"/"--patch"'
  exit 1
fi

BRANCH="main"
RELEASE_TYPE=$1

function nextRelease() {
  local LAST_VERSION=$(git tag | grep -E "v" | sort -V | tail -1)

  if [[ -z "$LAST_VERSION" ]]; then
    LAST_VERSION="v0.0.0"
  fi

  LAST_VERSION=$(echo $LAST_VERSION | sed "s/v//g")
  local VERSION_PARTS=(${LAST_VERSION//./ })
  local MAJOR=${VERSION_PARTS[0]}
  local MINOR=${VERSION_PARTS[1]}
  local PATCH=${VERSION_PARTS[2]}

  if [[ "$RELEASE_TYPE" == "--major" ]]; then
    MAJOR=$((MAJOR+1))
    MINOR="0"
    PATCH="0"
  elif [[ "$RELEASE_TYPE" == "--minor" ]]; then
    MINOR=$((MINOR+1))
    PATCH="0"
  else
    PATCH=$((PATCH+1))
  fi

  echo "v$MAJOR.$MINOR.$PATCH"
}

function confirm() {
  local message="$1"
  echo "$message"
  read -r -p "Please confirm you wish to proceed? [y/N] " response
  case "$response" in
    [yY][eE][sS]|[yY])
        echo "Proceeding..."
        ;;
    *)
        echo "User canceled operation"
        exit 1
        ;;
  esac
}

confirm "About to start deployment script from '$BRANCH' branch!"

git checkout $BRANCH
git pull
git fetch --tags

nextReleaseTag=$(nextRelease)

confirm "About to trigger next release tagged '$nextReleaseTag'"

echo "creating release tagged \"$nextReleaseTag\""

echo "git tag \"$nextReleaseTag\""
git tag "$nextReleaseTag"

echo "git push origin --tags"
git push origin --tags
echo ""
