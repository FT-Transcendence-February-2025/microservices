all:

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

teams:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	https://api.github.com/orgs/FT-Transcendence-February-2025/teams | jq

microTeam:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	https://api.github.com/organizations/198072106/team/12155372/members | jq

gitRepoInfo:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	https://api.github.com/orgs/FT-Transcendence-February-2025 | jq

labels:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github.v3+json" \
	https://api.github.com/repos/FT-Transcendence-February-2025/FT_Transcendence/labels | \
	jq '.[].name'

user:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" -H "Accept: application/vnd.github+json" https://api.github.com/user | jq -r '.login'

email:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" -H "Accept: application/vnd.github+json" \
	https://api.github.com/user/emails | jq -r '.[] | select(.primary == true) | .email'

setGit:
	@USER_NAME=$$( $(MAKE) --no-print user | tr -d '"' ); \
	USER_EMAIL=$$( $(MAKE) --no-print email ); \
	git config --local user.name "$$USER_NAME"; \
	git config --local user.email "$$USER_EMAIL"

rules:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	https://api.github.com/repos/FT-Transcendence-February-2025/microservices/branches/main/protection | jq

reposAdmin:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	`$(MAKE) --no-print reposApi` | jq -r '.[] | select(.permissions.admin == true) | "\(.url) \n\(.html_url) \n"'

microRepo:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	`$(MAKE) --no-print reposApi` | jq -r '.[] | select(.permissions.admin == true and (.url | tostring | contains("microservice"))) | .url'

microInfo:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	`$(MAKE) --no-print microRepo` | jq 

orgRepos:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	https://api.github.com/orgs/FT-Transcendence-February-2025/repos | jq
#| jq -r '.[].name'
reposApi:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	https://api.github.com/user/orgs | jq -r '.[].repos_url'

ownOrgsInfo:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	https://api.github.com/user/orgs | jq

info:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	`$(MAKE) --no-print ownOrgs` | jq

ssh_url:
	@curl -s -H "Authorization: token `cat $(TOKEN)`" \
	-H "Accept: application/vnd.github+json" \
	`$(MAKE) --no-print admin` | jq -r .ssh_url

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