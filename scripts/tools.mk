
# Default target, does nothing
all:

# Rule to create a directory if it doesn't exist
define createDir
	@printf "\n$(LF)🚧  $(P_BLUE)Creating directory $(P_YELLOW)$(1) $(FG_TEXT)"; \
	if [ -d "$(1)" ]; then \
		printf "$(LF)  🟢 $(P_BLUE)Directory $(P_YELLOW)$(1) $(P_BLUE)already exists \n"; \
	else \
		mkdir -p $(1); \
		chmod u+rwx $(1); \
		printf "$(LF)  🟢  $(P_BLUE)Successfully created directory $(P_GREEN)$(1) $(P_BLUE)! \n"; \
	fi
endef

restartDocker:
	@echo "Stopping rootless Docker..."
	-pkill -f dockerd-rootless.sh || echo "Docker is not running."
runDocker: restartDocker
	sh scripts/runDockerRootless.sh
pull-Img:
	docker pull alpine && docker save alpine -o alpine.tar && \
	docker pull node:20-alpine && docker save node:20-alpine -o node-20-alpine.tar && \
	docker pull traefik:v3.3.3 && docker save traefik:v3.3.3 -o traefik-v3.3.3.tar && \
	docker pull nginx:alpine && docker save nginx:alpine -o nginx-alpine.tar

load-Img:
	@if [ ! -f alpine.tar ] || [ ! -f node-20-alpine.tar ] || [ ! -f traefik-v3.3.3.tar ]; then \
		echo "One or more tar files are missing. Running pull-Img..."; \
		$(MAKE) pull-Img; \
	fi
	-docker load -i alpine.tar && \
	-docker load -i node-20-alpine.tar && \
	-docker load -i traefik-v3.3.3.tar && \
	-docker load -i nginx-alpine.tar


# Show list of all running Docker containers
show:
	@printf "$(LF)$(D_PURPLE)* List of all running containers$(P_NC)\n"
	@docker container ls

# Show list of all Docker containers, images, volumes, and networks
showAll:
	@printf "$(LF)$(D_PURPLE)* List all running and sleeping containers$(P_NC)\n"
	@$(CMD) ps
	@printf "$(LF)$(D_PURPLE)* List all images$(P_NC)\n"
	@$(CMD) images
	@printf "$(LF)$(D_PURPLE)* List all volumes$(P_NC)\n"
	@docker volume ls
	@printf "$(LF)$(D_PURPLE)* List all networks$(P_NC)\n"
	@docker network ls

# Show all Docker containers, images, volumes, and networks every second
watchC:
	@docker ps -a; docker images
	@docker volume ls; docker network ls 

# Add all changes to git
gAdd:
	@echo $(CYAN) && git add .

# Commit changes to git with an editor
gCommit:
	@echo $(GREEN) && git commit -e ; \
	ret=$$?; \
	if [ $$ret -ne 0 ]; then \
		echo $(RED) "Error in commit message"; \
		exit 1; \
	fi

# Push changes to git, set upstream branch if needed
gPush:
	@echo $(YELLOW) && git push ; \
	ret=$$? ; \
	if [ $$ret -ne 0 ]; then \
		echo $(RED) "git push failed, setting upstream branch" $(YELLOW) && \
		git push --set-upstream origin $(shell git branch --show-current) || \
		if [ $$? -ne 0 ]; then \
			echo $(RED) "git push --set-upstream failed with error" $(E_NC); \
			exit 1; \
		fi \
	fi

# Add, commit, and push changes to git
git: gAdd gCommit gPush

# Encrypt the secrets directory
encrypt:
	@rm -f .tmp.enc .tmp.tar.gz
	@tar -czf .tmp.tar.gz secrets/
	@bash -c ' \
	read -sp "Enter encryption passphrase: " ENCRYPTION_PASSPHRASE; \
	echo; \
	gpg --batch --passphrase "$$ENCRYPTION_PASSPHRASE" --symmetric --cipher-algo AES256 -o .tmp.enc .tmp.tar.gz; \
	if [ $$? -ne 0 ]; then \
		echo "Error: Encryption failed."; \
		rm -f .tmp.tar.gz .tmp.enc; \
		exit 1; \
	fi'
	@rm .tmp.tar.gz\

# Decrypt the encrypted secrets file
decrypt: 
	@bash -c ' \
	read -sp "Enter decryption key: " DECRYPTION_KEY; \
	echo; \
	if [ -f .tmp.enc ]; then \
		gpg --batch --passphrase "$$DECRYPTION_KEY" -o .tmp.tar.gz -d .tmp.enc; \
		if [ $$? -ne 0 ]; then \
			echo "Error: Decryption failed."; \
			shred -u .env; \
			exit 1; \
		fi; \
		mkdir -p .tmp_extract; \
		tar -xzf .tmp.tar.gz -C .tmp_extract; \
		rm .tmp.tar.gz; \
	else \
		echo "Error: .tmp.enc file not found."; \
		exit 1; \
	fi'

# List all service directories and volumes
list:
	@find services/ -type d -name '*-service'
	@ls -Rla $(VOLUMES)

# Show user and group IDs
id:
	cat /etc/subuid | grep $(USER)
	cat /etc/subgid | grep $(USER)
	id -u; id -g
	cat ~/.config/docker/daemon.json

# Remove all SSL certificates
rmCert:
	rm -rf ./secrets/ssl/*

# Generate SSL certificates using mkcert
cert:
	$(call createDir,$(SSL))
	@HOST=$(shell hostname -s) ; \
	if [ -f $(SSL)/$$HOST.key ] && [ -f $(SSL)/$$HOST.crt ]; then \
		printf "$(LF)  🟢 $(P_BLUE)Certificates already exists $(P_NC)\n"; \
	else \
		rm -rf $(SSL)/*; \
		docker run --rm --privileged --hostname $(shell hostname) -v $(SSL):/certs -it alpine:latest sh -c 'apk add --no-cache nss-tools curl ca-certificates && curl -JLO "https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64" && mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert && chmod +x /usr/local/bin/mkcert && mkcert -install && mkcert -key-file /certs/$(shell hostname -s).key -cert-file /certs/$(shell hostname -s).crt $(shell hostname) "*.$(shell hostname)" $(shell ip route get 8.8.8.8 | awk '{print $$7}') localhost 127.0.0.1 && cp /root/.local/share/mkcert/rootCA.pem /certs/rootCA.pem' ; \
	fi
# @curl -s -o secrets/ssl/rootCA.pem https://raw.githubusercontent.com/letsencrypt/pebble/main/test/certs/pebble.minica.pem

# docker rm alpine
testCert:
	@openssl x509 -in $(SSL)/*.crt -text -noout
# docker run --rm -v /sgoinfre/$USER/data:/certs -it debian:bullseye sh -c 'apt-get update && apt-get install -y libnss3-tools curl && curl -JLO "https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64" && mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert && chmod +x /usr/local/bin/mkcert && mkcert -install && mkcert -key-file /certs/privkey.key -cert-file /certs/fullchain.crt ${USER}.pong.42.fr'
#	@mkcert -key-file secrets/$(arg)/privkey.key -cert-file secrets/$(arg)/fullchain.crt ${USER}.pong.42.fr

# Generate SSL certificates using Certbot
# cerbot:
# 	$(call createDir,$(SSL))
# 	@HOST=$(shell hostname -s) ; \
# 	if [ -f $(SSL)/$$HOST.key ] && [ -f $(SSL)/$$HOST.crt]; then \
# 		printf "$(LF)  🟢 $(P_BLUE)Certificates already exists $(P_NC)\n"; \
# 	else \
# 		rm -rf $(SSL)/*; \
# 		docker run --rm --privileged --hostname $(shell hostname) -v $(SSL):/etc/letsencrypt -v $(SSL):/var/lib/letsencrypt -v $(SSL):/var/log/letsencrypt -p 80:80 -p 443:443 certbot/certbot sh -c "certbot certonly --standalone -d $(shell hostname) && cp /etc/letsencrypt/live/$(shell hostname)/privkey.pem /etc/letsencrypt/live/$(shell hostname)/$(shell hostname -s).key && cp /etc/letsencrypt/live/$(shell hostname)/fullchain.pem /etc/letsencrypt/live/$(shell hostname)/$(shell hostname -s).crt"; \
# 	fi
#--------------------COLORS----------------------------#
# For print
CL_BOLD  = \e[1m
RAN	 	 = \033[48;5;237m\033[38;5;255m
D_PURPLE = \033[1;38;2;189;147;249m
D_WHITE  = \033[1;37m
NC	  	 = \033[m
P_RED	 = \e[1;91m
P_GREEN  = \e[1;32m
P_BLUE   = \e[0;36m
P_YELLOW = \e[1;33m
P_CCYN   = \e[0;1;36m
P_NC	 = \e[0m
LF	   = \e[1K\r$(P_NC)
FG_TEXT  = $(P_NC)\e[38;2;189;147;249m
# For bash echo
CLEAR  = "\033c"
BOLD   = "\033[1m"
CROSS  = "\033[8m"
E_NC   = "\033[m"
RED	= "\033[1;31m"
GREEN  = "\033[1;32m"
YELLOW = "\033[1;33m"
BLUE   = "\033[1;34m"
WHITE  = "\033[1;37m"
MAG	= "\033[1;35m"
CYAN   = "\033[0;1;36m"
GRAY   = "\033[1;90m"
PURPLE = "\033[1;38;2;189;147;249m"

define IMG

		⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠿⠿⠿⠿⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
		⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⢰⢲⠐⡖⡆⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
		⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⢸⣸⣀⣇⡇⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
		⣿⣿⣿⣿⣿⣿⣿⣿⠀⡤⡤⡤⣤⢠⡤⡤⡤⡄⢠⢤⡤⡤⡄⢸⣿⣿⣿⣿⣿⣿⣿⡟⢿⣿⣿⣿⣿⣿⣿⣿⣿
		⣿⣿⣿⣿⣿⣿⣿⣿⠀⡇⡇⡇⣿⢸⡇⡇⡇⡇⢸⢸⠀⡇⡇⢸⣿⣿⣿⣿⣿⣿⡟⢠⣦⡈⢿⣿⣿⣿⣿⣿⣿
		⣿⣿⣿⠉⣉⣉⣉⣉⠀⣉⣉⣉⣉⢈⣉⣉⣉⡁⢈⣉⣉⣉⡁⢈⣉⣉⣉⡉⣿⣿⠀⣿⣿⣿⡀⠿⠿⠿⢿⣿⣿
		⣿⣿⣿⠀⡇⡇⣿⢸⠀⡇⡇⡇⣿⢸⡇⡇⡇⡇⢸⢸⠉⡇⡇⢸⢸⢸⠁⡇⢸⣿⡄⢻⣿⣿⢣⣶⣶⣶⣦⠄⣹
		⡿⠻⠻⠀⠓⠓⠛⠚⠀⠓⠓⠓⠛⠘⠓⠓⠓⠃⠘⠚⠒⠓⠃⠘⠚⠚⠒⠃⠘⠛⢃⣠⣿⢣⣿⣿⡿⠟⢋⣴⣿
		⡇⢸⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣱⠃⣤⣤⣶⣾⣿⣿⣿
		⣷⠘⡟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢟⣽⠃⣰⣿⣿⣿⣿⣿⣿⣿
		⣿⡄⢻⣹⣿⣿⣿⣿⣿⣿⣿⣿⢫⠂⢯⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣫⡿⢁⣼⣿⣿⣿⣿⣿⣿⣿⣿
		⣿⣧⡈⢷⡻⣿⣿⣿⣿⣿⠟⣿⣯⣖⣮⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣫⡾⠋⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
		⣿⣿⣷⣄⠉⣉⣉⣉⣉⣤⣶⣎⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣵⠟⢋⣤⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
		⣿⣿⣿⣿⣷⣌⠙⠿⣭⣟⣻⣿⢿⣯⡻⢿⣿⣿⣿⣿⣿⠿⠟⠛⣉⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
		⣿⣿⣿⣿⣿⣿⣿⣶⣦⣬⣉⣉⣛⣛⣛⣓⣈⣉⣉⣤⣤⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿

endef
export IMG

define TRASH

		⠀⠀⠀⠀⠀⠀⢀⣠⣤⣤⣤⣤⣤⣄⡀⠀⠀⠀⠀⠀⠀
		⠀⠀⠀⠀⣰⣾⠋⠙⠛⣿⡟⠛⣿⣿⣿⣷⣆⠀⠀⠀⠀
		⠀⠀⢠⣾⣿⣿⣷⣶⣤⣀⡀⠐⠛⠿⢿⣿⣿⣷⡄⠀⠀
		⠀⢠⣿⣿⣿⡿⠿⠿⠿⠿⠿⠿⠶⠦⠤⢠⣿⣿⣿⡄⠀
		⠀⣾⣿⣿⣿⣿⠀⣤⡀⠀⣤⠀⠀⣤⠀⢸⣿⣿⣿⣷⠀
		⠀⣿⣿⣿⣿⣿⠀⢿⡇⠀⣿⠀⢠⣿⠀⣿⣿⣿⣿⣿⠀
		⠀⢿⣿⣿⣿⣿⡄⢸⡇⠀⣿⠀⢸⡏⠀⣿⣿⣿⣿⡿⠀
		⠀⠘⣿⣿⣿⣿⡇⢸⡇⠀⣿⠀⢸⡇⢠⣿⣿⣿⣿⠃⠀
		⠀⠀⠘⢿⣿⣿⡇⢸⣧⠀⣿⠀⣼⡇⢸⣿⣿⡿⠁⠀⠀
		⠀⠀⠀⠀⠻⢿⣷⡘⠛⠀⠛⠀⠸⢃⣼⡿⠟⠀⠀⠀⠀
		⠀⠀⠀⠀⠀⠀⠈⠙⠛⠛⠛⠛⠛⠋⠁⠀⠀⠀⠀⠀⠀
endef
export TRASH

define MANUAL

Example:
$(D_WHITE)[test]
$(D_PURPLE)$> make D=0 test
$(D_WHITE)[test + DEBUG]
$(D_PURPLE)$> make D=1 test
$(D_WHITE)[DEBUG + Valgrind]
$(D_PURPLE)$> make D=1 S=0 re val
$(D_WHITE)[DEBUG + Sanitizer]
$(D_PURPLE)$> make D=1 S=1 re test

endef
export MANUAL
