PROJECT_ROOT :=$(abspath $(dir $(lastword $(MAKEFILE_LIST)))/..)/
SETTINGS := $(abspath $(dir $(lastword $(MAKEFILE_LIST)))/..)/.settings/
include $(SETTINGS)/colors.mk
CURRENT_PATH := $(PWD)/
HOOKS := $(SETTINGS)gitHooks/
#make -p -f Makefile | grep -E '^[a-zA-Z0-9_-]+:'
#  

GIT-HOOKS := $(PROJECT_ROOT).git/hooks

# Function to set hooks
define set_hook
	@file="$1"; \
	hooks=$(GIT-HOOKS); \
	toSet=$$(echo $$hooks/$$file | awk -F'/' '{print $$(NF-3)"/"$$(NF-2)"/"$$(NF-1)"/"$$NF}'); \
	echo Setting:$(PURPLE) $$toSet $(E_NC); \
	cp $(HOOKS)$$file $$hooks; \
	chmod +x $$hooks/$$file; \
	if [ $$? -ne 0 ]; then \
		echo $(RED)"Error: $$file hook not installed"$(E_NC); \
		exit 1; \
	fi; \
	echo $(GREEN)"$$file hook installed."$(E_NC)
endef

# all:

settings:
	@echo PWD: $(PWD)
	@echo PROJECT_ROOT: $(CYAN) $(PROJECT_ROOT) $(E_NC)
	@echo Git-hooks: $(CYAN) $(GIT-HOOKS) $(E_NC)
	@echo SETTINGS: $(YELLOW) $(SETTINGS) $(E_NC)
.gitconfig:
	@git config --local --list

show-commit-msg:
	cat $(shell git config --get commit.template)

commit-template:
	@git config --local commit.template $(HOOKS).gitmessage
	@echo "commit-msg hook installed."
# Hook installation
pre-commit:
	$(call set_hook,prepare-commit-msg)

commit-msg:
	$(call set_hook,commit-msg)

post-merge:
	$(call set_hook,post-merge)

show-pwd:
	@echo PWD:$(YELLOW) $(CURRENT_PATH) $(E_NC)

set-hooks: show-pwd commit-template pre-commit commit-msg post-merge


#-------------------------VS Code
gAdd:
	@echo $(CYAN) && git add .

gCommit:
	@echo $(GREEN) && git commit -e ; \
	ret=$$? ; \
	if [ $$ret -ne 0 ]; then \
		echo $(RED) "Error in commit message"; \
		exit 1; \
	fi
gPush:
	@echo $(YELLOW) && git push ; \
	ret=$$? ; \
	if [ $$ret -ne 0 ]; then \
		echo $(RED) "git push failed, setting upstream branch\n" $(YELLOW) && \
		git push --set-upstream origin $(shell git branch --show-current) || \
		if [ $$? -ne 0 ]; then \
			echo $(RED) "git push --set-upstream failed with error" $(E_NC); \
		fi \
	fi

git: show-pwd
	@$(MAKE) -C . gAdd gCommit; \
	ret=$$?; \
	if [ $$ret -ne 0 ]; then \
		exit 1; \
	else \
		$(MAKE) -C . gPush; \
	fi

quick: cleanAll
	@echo $(GREEN) && git commit -am "* Update in files: "; \
	ret=$$? ; \
	if [ $$ret -ne 0 ]; then \
		exit 1; \
	else \
		$(MAKE) -C . gPush; \
	fi

# Avoid last commit message
soft:
	@echo $(GREEN) "\nLast 10 commits:" $(E_NC)
	@$(MAKE) plog && echo 
	@read -p "Do you want to reset the last commit? (y/n) " yn; \
	case $$yn in \
		[Yy]* ) git reset --soft HEAD~1;\
		git push origin --force-with-lease $(shell git branch --show-current) ;\
		echo $(RED) "Last commit reset" $(E_NC) ;; \
		* ) echo $(MAG) "No changes made" $(E_NC) ;; \
	esac

amend:
	@echo $(CYAN) && git commit --amend; \
	result=$$?; \
	if [ $$result -ne 0 ]; then \
		echo $(RED) "The amend commit message was not modified."; \
		exit 1; \
	else \
		echo $(YELLOW) && git push origin --force-with-lease $(shell git branch --show-current); \
		exit 0; \
	fi

.PHONY: all .gitconfig show-commit-msg commit-template pre-commit commit-msg post-merge show-pwd set-hooks fetch-settings update-settings .vscode gAdd gCommit gPush git-sub git dirs settings