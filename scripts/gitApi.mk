
# Default target, does nothing
all:

# Fetch and display the login names of all members in the organization
members:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" -H "Accept: application/vnd.github+json"	 https://api.github.com/orgs/FT-Transcendence-February-2025/members | jq -r '.[].login' | paste -sd ' ' -

	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	https://api.github.com/orgs/FT-Transcendence-February-2025/teams | jq '.[].members_url'
	@logins=$$(curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	https://api.github.com/organizations/198072106/team/12155372/members | jq -r '.[].login' | paste -sd ' ' -); \
	ids=$$(curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	https://api.github.com/organizations/198072106/team/12155372/members | jq -r '.[].id' | paste -sd ' ' -); \
	echo "login: $$logins"; \
	echo "id: $$ids"

# Fetch and display all teams in the organization
teams:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	https://api.github.com/orgs/FT-Transcendence-February-2025/teams | jq

# Fetch and display members of a specific team
microTeam:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	https://api.github.com/organizations/198072106/team/12155372/members | jq

# Fetch and display information about the organization
gitRepoInfo:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	https://api.github.com/orgs/FT-Transcendence-February-2025 | jq

# Fetch and display all labels in a specific repository
labels:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github.v3+json" \
	https://api.github.com/repos/FT-Transcendence-February-2025/FT_Transcendence/labels | \
	jq '.[].name'

# Fetch and display the login name of the authenticated user
user:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" -H "Accept: application/vnd.github+json" https://api.github.com/user | jq -r '.login'

# Fetch and display the primary email of the authenticated user
email:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" -H "Accept: application/vnd.github+json" \
	https://api.github.com/user/emails | jq -r '.[] | select(.primary == true) | .email'

# Set the local Git user name and email to match the authenticated user's GitHub account
setGit:
	@USER_NAME=$$( $(MAKE) --no-print user | tr -d '"' ); \
	USER_EMAIL=$$( $(MAKE) --no-print email ); \
	git config --local user.name "$$USER_NAME"; \
	git config --local user.email "$$USER_EMAIL"

# Fetch and display branch protection rules for the main branch of a specific repository
rules:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	https://api.github.com/repos/FT-Transcendence-February-2025/microservices/branches/main/protection | jq

# List all repositories in the organization where the authenticated user has admin permissions
reposAdmin: 
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	`$(MAKE) --no-print reposApi` | jq -r '.[] | select(.permissions.admin == true) | "\(.url) \n\(.ssh_url) \n\(.html_url) \n"'

# List all issues in a specific repository
listIssues:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" -H "Accept: application/vnd.github+json"  https://api.github.com/repos/FT-Transcendence-February-2025/microservices/issues | jq -r '.[] | "\(.title):\n  https://github.com/FT-Transcendence-February-2025/microservices/issues/\(.number)"'

createBranch: listIssues
	@read -p "Enter issue number: " issue; \
	read -p "Enter branch name (leave blank for default: feature/$$issue): " branch; \
	branch=$${branch:+feature/$$issue-$$branch}; \
	branch=$${branch:-feature/$$issue}; \
	git checkout -b $$branch; \
	git push -u origin $$branch; \
	echo "Branch $$branch created and linked to remote."
# Fetch and display the URL of a specific repository where the authenticated user has admin permissions
microRepo:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	`$(MAKE) --no-print reposApi` | jq -r '.[] | select(.permissions.admin == true and (.url | tostring | contains("microservice"))) | .url'

# Fetch and display information about a specific repository where the authenticated user has admin permissions
microInfo:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	`$(MAKE) --no-print microRepo` | jq 

# Fetch and display all repositories in the organization
orgRepos:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	https://api.github.com/orgs/FT-Transcendence-February-2025/repos | jq
#| jq -r '.[].name'

# Fetch and display the API URL for the repositories of the authenticated user's organizations
reposApi:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	https://api.github.com/user/orgs | jq -r '.[].repos_url'

# Fetch and display information about the authenticated user's organizations
ownOrgsInfo:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	https://api.github.com/user/orgs | jq

# Fetch and display information about the authenticated user's organizations
info:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	`$(MAKE) --no-print ownOrgs` | jq

# Fetch and display the SSH URL of a specific repository where the authenticated user has admin permissions
ssh_url:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	`$(MAKE) --no-print admin` | jq -r .ssh_url

# Create a new issue using a script
issue:
	@chmod +x .settings/createIssue.sh
	@.settings/createIssue.sh
# issue:
# 	curl -s -H "Authorization: token `cat $(TOKEN)`" \
# 	-H "Accept: application/vnd.github+json" \
# 	-d '{
# 		  "title": "New Issue Title",
# 		  "body": "This is the body of the new issue.",
# 		  "assignees": ["username1", "username2"],
# 		  "labels": ["bug", "urgent"],
# 		  "milestone": 1,
# 		  "projects": ["project1"]
# 		}' \
# 	https://api.github.com/repos/FT-Transcendence-February-2025/microservices/issues 