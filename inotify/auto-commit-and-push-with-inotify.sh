#!/bin/bash

set -euo pipefail

REPO_PATH="$HOME/Sync/00 Zettelkasten/"
COMMIT_MESSAGE_PREFIX="Auto-commit"
REMOTE_NAME="origin"
BRANCH_NAME="main"
DEBOUNCE_SECONDS=15
MAX_FILES_IN_COMMIT_MSG=5

if [ ! -d "$REPO_PATH" ]; then
  echo "Error: Repository path '$REPO_PATH' not found."
  exit 1
fi

cd "$REPO_PATH" || exit 1
echo "Watching for file changes in $REPO_PATH using inotifywait..."
echo "Targeting remote '$REMOTE_NAME' branch '$BRANCH_NAME'."
echo "Debounce time: ${DEBOUNCE_SECONDS}s."
echo "Press Ctrl+C to stop."

inotifywait -m -r -q \
  --exclude "/\.git/" \
  --event modify,create,delete,moved_to \
  --format '%w%f' \
  "$REPO_PATH" | \
while true; do
  read -r FIRST_EVENT_FILE
  while read -r -t "$DEBOUNCE_SECONDS" SUBSEQUENT_EVENT_FILE; do
    : # The colon is a null command, just keeps the loop going
  done

  echo ""
  echo "$(date '+%Y-%m-%d %H:%M:%S') - Change detected (last event: $FIRST_EVENT_FILE). Processing after debounce..."
  echo "$(date '+%Y-%m-%d %H:%M:%S') - Running 'git add -A'"
  git add -A
  STAGED_FILES_FULL_PATH=$(git diff --staged --name-only --diff-filter=ACMRTUXB)

  if [ -z "$STAGED_FILES_FULL_PATH" ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - No staged changes to commit."
    echo "----------------------------------------"
    continue # Go back to waiting for events
  fi
  FILE_BASENAMES=()
  FILE_COUNT=0
  TOTAL_FILE_COUNT=0
  while IFS= read -r file; do
    ((TOTAL_FILE_COUNT++))
    if [ "$FILE_COUNT" -lt "$MAX_FILES_IN_COMMIT_MSG" ]; then
      FILE_BASENAMES+=("$(basename "$file")")
      ((FILE_COUNT++))
    fi
  done <<< "$STAGED_FILES_FULL_PATH"

  AFFECTED_FILES_STRING="${FILE_BASENAMES[*]}" # Join array elements with space
  if [ "$TOTAL_FILE_COUNT" -gt "$MAX_FILES_IN_COMMIT_MSG" ]; then
    AFFECTED_FILES_STRING+=", ... and $(($TOTAL_FILE_COUNT - $MAX_FILES_IN_COMMIT_MSG)) more"
  fi

  COMMIT_MESSAGE="$COMMIT_MESSAGE_PREFIX: $AFFECTED_FILES_STRING"
  echo "$(date '+%Y-%m-%d %H:%M:%S') - Committing changes with message: '$COMMIT_MESSAGE'"
  git commit -m "$COMMIT_MESSAGE"
  if [ $? -ne 0 ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Error: git commit failed. Manual intervention may be required."
    echo "----------------------------------------"
    continue # Skip push if commit failed
  fi
 
  # Push changes
  echo "$(date '+%Y-%m-%d %H:%M:%S') - Pushing changes to $REMOTE_NAME $BRANCH_NAME..."
  git push "$REMOTE_NAME" "$BRANCH_NAME"
  if [ $? -ne 0 ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Warning: git push failed. Remote might have new changes. Manual pull/merge/push needed."
  else
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Push successful."
  fi
  echo "----------------------------------------"
done
echo "Job completed."
exit 0
