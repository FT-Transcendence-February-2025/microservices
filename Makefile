#------ SRC FILES & DIRECTORIES ------#
SRCS	:= services
D		:= 0
CMD		:= docker compose
PROJECT_ROOT:= $(abspath $(dir $(lastword $(MAKEFILE_LIST)))/../)
GIT_REPO	:=$(abspath $(dir $(lastword $(MAKEFILE_LIST)))/../..)
CURRENT		:= $(shell basename $$PWD)
VOLUMES		:= ./volumes

SSL			:= ./secrets/ssl
export TOKEN=$(shell grep '^TOKEN' secrets/.env.tmp | cut -d '=' -f2 | xargs)
# SERVICES	:= $(shell docker compose config --services | xargs -I {} mkdir -p $(VOLUMES)/{})
NAME		:= ft_transcendence
DOCKER_BUILDKIT=1x
-include $(wildcard scripts/*.mk)
# -include tools.mk network.mk gitApi.mk

#------------------ RULES -----------------------#

# Build all images, create volumes, and generate secrets
all: buildAll up showAll

# Build all Docker images with no cache
buildAll: cert volumes secrets
	@printf "\n$(LF)⚙️  $(P_BLUE) Building Images \n\n$(P_NC)";
ifneq ($(D), 0)
	@bash -c 'set -o pipefail; $(CMD) build --no-cache 2>&1 | tee build.log || { echo "Error: Docker compose build failed. Check build.log for details."; exit 1; }'
else
	@bash -c 'set -o pipefail; $(CMD) build --no-cache || { echo "Error: Docker compose build failed. Check build.log for details."; exit 1; }'
endif
	@printf "\n$(LF)🐳 $(P_BLUE)Successfully Builted Images! 🐳\n$(P_NC)"

# Build and run a specific Docker container
# Usage: make dcon c=<container_name>
dcon: load-Img cert secrets volumes
ifeq ($(D), 1)
	-@bash -c 'set -o pipefail; $(CMD) up $$c --build -d 2>&1 | tee up.log || { echo "Error: Docker compose up failed. Check up.log for details."; exit 1; }'
else
	@bash -c 'set -o pipefail; $(CMD) up $$c --build || { echo "Error: Docker compose up failed. Check up.log for details."; exit 1; }'
endif
	@$(MAKE) --no-print showAll logs 
	@printf "$(LF)\n$(D_GREEN)[✔] IP: $(shell ip route get 8.8.8.8 | awk '{print $$7}') $(P_NC)\n"

# Watch Docker events
watchDocker:
	@$(CMD) watch

# Stop and remove all Docker containers and volumes
down:
	@printf "$(LF)\n$(P_RED)[-] Phase of stopping and deleting containers $(P_NC)\n"
	-@$(CMD) down -v --rmi local 

# Start all Docker containers in detached mode
up:
	@printf "$(LF)\n$(D_PURPLE)[+] Phase of creating containers $(P_NC)\n"
	@$(CMD) up -d 

# Stop all running Docker containers
stop:
	@printf "$(LF)$(P_RED)  ❗  Stopping $(P_YELLOW)Containers $(P_NC)\n"
	@if [ -n "$$(docker ps -q)" ]; then \
		$(CMD) stop ;\
	fi

# Remove all Docker volumes
remove_volumes:
	@printf "$(LF)$(P_RED)  ❗  Removing $(P_YELLOW)Volumes $(FG_TEXT)"
	@rm -rf $(VOLUMES)
	@if [ -n "$$(docker volume ls -q)" ]; then \
		docker volume rm $$(docker volume ls -q) > /dev/null; \
	fi

# Prune Docker images, builders, system, and volumes
prune:
	@docker image prune -af --filter "label!=keep" > /dev/null
	@docker builder prune -af > /dev/null
	@docker system prune -af > /dev/null
	@docker volume prune -af
#> /dev/null

# Clean the current project directory
clean:
	@printf "\n$(LF)🧹 $(P_RED) Clean $(P_GREEN) $(CURRENT)\n"
	@printf "$(LF)\n  $(P_RED)❗  Removing $(FG_TEXT)"
	@$(MAKE) --no-print stop down
	@rm -rf *.log

# Perform a full clean, removing containers, images, volumes, and networks
fclean: clean remove_containers remove_images remove_volumes prune remove_networks rm-secrets
	-@if [ -d "$(VOLUMES)" ]; then	\
		printf "\n$(LF)🧹 $(P_RED) Clean $(P_YELLOW)Volume's Volume files$(P_NC)\n"; \
	fi
	@printf "$(LF)"
	@echo $(WHITE) "$$TRASH" $(E_NC)
	@docker container ls -a; docker image ls; docker volume ls

# Remove secret files
rm-secrets: #clean_host
# -@if [ -d "./secrets" ]; then	\
# 	printf "$(LF)  $(P_RED)❗  Removing $(P_YELLOW)Secrets files$(FG_TEXT)"; \
# 	find ./secrets -type f -exec shred -u {} \;; \
# fi
	-@if [ -f ".env" ]; then \
		shred -u .env; \
	fi

# Generate secret files
secrets: #check_host 
	@$(call createDir,./secrets)
	@chmod +x scripts/generateSecrets.sh
# 	@echo $(WHITE)
# 	@export $(shell grep '^TMP' srcs/.env.tmp | xargs) && \#
	@rm -f .env
	@bash scripts/generateSecrets.sh $(D)
# 	@bash scripts/generateSecrets.sh
# 	@echo $(E_NC) > /dev/null

# Show logs for a specific Docker container
# Usage: make logs c=<container_name>
logs:
	docker compose logs $$c
# @docker compose config --services | xargs -I {} docker logs {}

# Rebuild and restart everything
re: fclean all

# Create Docker volumes for the project
volumes: #check_os
	@printf "$(LF)\n$(P_BLUE)⚙️  Setting $(P_YELLOW)$(NAME)'s volumes$(FG_TEXT)\n"
#	@systemctl --user status docker;
	$(call createDir,$(VOLUMES))
	@docker compose config --services | xargs -I {} mkdir -p $(VOLUMES)/{}
# @if cat ~/.config/docker/daemon.json | grep -q $(DOCKER_DATA); then \
# 	echo "\tDocker data-Root correct" ; \
# 	exit 0; \
# else \
# 	echo $(DOCKER_DATA) > ~/.config/docker/daemon.json; \
# 	systemctl --user stop docker ; \
# rsync -aqxP /goinfre/$(USER)/docker/ /goinfre/$(USER)/docker/ ; \
# 	systemctl --user start docker; \
# 	systemctl --user status docker; \
# fi
#	~/.config/docker/daemon.json
# $(call createDir,$(DB_VOL))
# 
.PHONY: all buildAll set build up down clean fclean status logs restart re showAll check_os rm-secrets remove_images remove_containers remove_volumes remove_networks prune showData secrets