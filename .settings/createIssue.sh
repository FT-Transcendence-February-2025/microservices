#!/bin/bash
set -x
REMOTE_URL=$(git config --get remote.origin.url)

# Extract the repository owner and name from the remote URL
REPO_NAME=$(echo "$REMOTE_URL" | sed -n 's#.*/\([^/]*\)\.git#\1#p')

# Get organization members
MEMBERS=$(curl -s -H "Authorization: token `cat $TOKEN`" -H "Accept: application/vnd.github+json" https://api.github.com/orgs/FT-Transcendence-February-2025/members | jq -r '.[].login' | awk '{printf "\"%s\", ", $0}' | sed 's/, $/\n/')
LABELS=$(curl -s -H "Authorization: token `cat $TOKEN`" \
	-H "Accept: application/vnd.github.v3+json" \
	https://api.github.com/repos/FT-Transcendence-February-2025/FT_Transcendence/labels | jq -r '.[].name' | awk '{printf "\"%s\", ", $0}' | sed 's/, $/\n/')

# Get the current user's GitHub username
GIT_GLOBAL=$(git config --global --get user.name)

# Obtain local branch User
GIT_LOCAL=$(git config --local --get user.name)
LOCAL_USER=$(echo $USER)

# Create a temporary file for the issue template
TEMPLATE_FILE=$(mktemp)

# Generate the issue template
cat <<EOL > "$TEMPLATE_FILE"
{
  "title": "Feat: ",
  "body": "",
#MEMBERS: $MEMBERS
  "assignees": ["$GIT_LOCAL"],
#LABELS: $LABELS
  "labels": [""],
  "checklist": [
   {"item": "description", "completed": false}
#  {"item": "Fix the bug", "completed": false},
#  {"item": "Test the fix", "completed": false}
  ],
#  "references": [
#    {"type": "commit", "id": "a1b2c3d4"},
#    {"type": "pull_request", "id": 42}
#  ],
#  "dependencies": [
#    {"type": "issue", "id": 101},
#    {"type": "milestone", "id": 7}
#  ]
}
EOL

cat $TEMPLATE_FILE
# Open the template file in nano for editing
nano "$TEMPLATE_FILE"

# # Read the edited template
# ISSUE_TITLE=$(grep '^Title:' "$TEMPLATE_FILE" | sed 's/^Title: //')
# ISSUE_BODY=$(grep '^Body:' "$TEMPLATE_FILE" | sed 's/^Body: //')
# ISSUE_LABELS=$(grep '^Labels:' "$TEMPLATE_FILE" | sed 's/^Labels: //')
# ISSUE_ASSIGNEES=$(grep '^Assignees:' "$TEMPLATE_FILE" | sed 's/^Assignees: //')
# ISSUE_REFERENCES=$(grep '^References:' "$TEMPLATE_FILE" | sed 's/^References: //')
# ISSUE_DEPENDS_ON=$(grep '^Depends on' "$TEMPLATE_FILE" | sed 's/^Depends on //')
# ISSUE_CHECKLIST=$(sed -n '/^Checklist/,$p' "$TEMPLATE_FILE" | sed 's/^Checklist//')

repoName=$(basename -s .git $(git config --get remote.origin.url))
orgReposApi=$(curl -s -H "Authorization: token $(cat $TOKEN)" \
			-H "Accept: application/vnd.github+json" \
			https://api.github.com/user/orgs | jq -r '.[].repos_url')
currentRepoApi=$(curl -s -H "Authorization: token $(cat $TOKEN)" \
		-H "Accept: application/vnd.github+json" $orgReposApi | \
		jq -r --arg repoName "$repoName" '.[] | select(.permissions.admin == true and (.url | tostring | endswith($repoName))) | .url')
echo $currentRepoApi
# Create issue format
# Append the specified content to the commit message file
# ISSUE=$(cat <<EOL
# {
# 	\"title\": \"$ISSUE_TITLE\",
# 	 \"body\": \"$ISSUE_BODY\n\nReferences: $ISSUE_REFERENCES\nDepends on: $ISSUE_DEPENDS_ON\n\nChecklist:\n$ISSUE_CHECKLIST\",
# 	\"labels\": $ISSUE_LABELS,
# 	\"assignees\": $ISSUE_ASSIGNEES
# }
# EOL
# )

# Create the issue
# RESPONSE=$(echo curl -s -X POST -H "Authorization: token `cat $TOKEN`" \
# 	-H "Accept: application/vnd.github.v3+json" \
# 	"$currentRepoApi/issues \
# 	-d "{
# 		\"title\": \"$ISSUE_TITLE\",
# 		\"body\": \"$ISSUE_BODY\",
# 		\"labels\": $ISSUE_LABELS,
# 		\"assignees\": $ISSUE_ASSIGNEES
# 	}")

echo $ISSUE

# # Create an issue using the GitHub API
RESPONSE=$(echo curl -s -X POST -H "Authorization: token `cat $TOKEN`" \
	-H "Accept: application/vnd.github.v3+json" \
	-d "$ISSUE" "$currentRepoApi/issues")

echo $RESPONSE
# # Extract the issue number and title from the response
# issue_number=$(echo "$issue_response" | jq -r '.number')
# issue_title=$(echo "$issue_response" | jq -r '.title' | sed 's/ /-/g')

# # Create a new branch locally based on the issue number and title
# branch_name="issue-$issue_number-$issue_title"
# echo "git checkout -b $branch_name"

# Extract the issue number from the response
ISSUE_NUMBER=$(echo "$RESPONSE" | jq -r '.number')

# Check if the issue was created successfully
if [ "$ISSUE_NUMBER" != "null" ]; then
	echo "Issue #$ISSUE_NUMBER created successfully."

	# Create a new branch for the issue
	BRANCH_NAME="issue-$ISSUE_NUMBER-$ISSUE_TITLE"
	git checkout -b "$BRANCH_NAME"
	echo "New branch '$BRANCH_NAME' created."
else
	echo "Failed to create issue."
	echo "$RESPONSE"
fi

# Clean up the temporary file
rm "$TEMPLATE_FILE"