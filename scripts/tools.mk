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
hash-pass:
	htpasswd -nb pongAdmin yourpassword
restartDocker:
	@if grep -qi "ubuntu" /etc/os-release; then \
		echo "Ubuntu detected - skipping Docker restart."; \
		exit 0; \
	fi
	@echo "Stopping rootless Docker..."
	-pkill -f "dockerd-rootless.sh" || echo "Docker is not running."
	@sleep 3

runDocker: restartDocker
	@if grep -qi "ubuntu" /etc/os-release; then \
		echo "Ubuntu detected - skipping Docker start."; \
		exit 0; \
	fi
	@echo "Starting rootless Docker..."
	sh scripts/runDockerRootless.sh

pull-Img:
	-docker pull alpine && docker save alpine -o alpine.tar
	-docker pull node:20-alpine && docker save node:20-alpine -o node-20-alpine.tar
	-docker pull traefik:v3.3.6 && docker save traefik:v3.3.6 -o traefik-v3.3.6.tar
	-docker pull nginx:alpine && docker save nginx:alpine -o nginx-alpine.tar
	-docker pull minio/minio:latest && docker save minio/minio:latest -o minio-latest.tar
#	-docker pull prom/prometheus:latest && docker save prom/prometheus:latest -o prometheus.tar
#	-docker pull grafana/grafana:latest && docker save grafana/grafana:latest -o grafana.tar

load-Img:
	@if [ ! -f alpine.tar ] || [ ! -f node-20-alpine.tar ] || [ ! -f traefik-v3.3.6.tar ]; then \
		echo "One or more tar files are missing. Running pull-Img..."; \
		$(MAKE) pull-Img; \
	fi
	@echo "Checking for existing Docker images..."
	@if ! docker images | grep -q "^alpine[[:space:]]\+latest"; then \
		echo "Loading alpine image..."; \
		docker load -i alpine.tar; \
	else \
		echo "🟢 alpine image already loaded"; \
	fi
	@if ! docker images | grep -q "^node[[:space:]]\+20-alpine"; then \
		echo "Loading node:20-alpine image..."; \
		docker load -i node-20-alpine.tar; \
	else \
		echo "🟢 node:20-alpine image already loaded"; \
	fi
	@if ! docker images | grep -q "^traefik[[:space:]]\+v3.3.6"; then \
		echo "Loading traefik:v3.3.6 image..."; \
		docker load -i traefik-v3.3.6.tar; \
	else \
		echo "🟢 traefik:v3.3.3 image already loaded"; \
	fi
	@if ! docker images | grep -q "^nginx[[:space:]]\+alpine"; then \
		echo "Loading nginx:alpine image..."; \
		docker load -i nginx-alpine.tar; \
	else \
		echo "🟢 nginx:alpine image already loaded"; \
	fi
	@if ! docker images | grep -q "^minio/minio[[:space:]]\+latest"; then \
		echo "Loading minio/minio image..."; \
		docker load -i minio-latest.tar; \
	else \
		echo "🟢 minio/minio image already loaded"; \
	fi
#	@if ! docker images | grep -q "^prom/prometheus[[:space:]]\+latest"; then \
		echo "Loading prometheus image..."; \
		docker load -i prometheus.tar; \
	else \
		echo "🟢 prom/prometheus image already loaded"; \
	fi
#	@if ! docker images | grep -q "^grafana/grafana[[:space:]]\+latest"; then \
		echo "Loading grafana image..."; \
		docker load -i grafana.tar; \
	else \
		echo "🟢 grafana/grafana image already loaded"; \
	fi

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
watch:
	@watch -c 'docker ps --format "table {{.Names}}\t {{.Image}}\t{{.Command}}\t{{.Status}}\t{{.Ports}}"; \
	docker images; docker volume ls; docker network ls'
checkDbs:
	@-while true; do \
		printf "$(LF)$(D_PURPLE) DB auth-users$(P_NC)\n" ; \
		docker exec -it auth sh -c "sqlite3 /app/src/database/database.sqlite 'SELECT * FROM users;'"; \
		printf "$(LF)$(D_PURPLE) DB user$(P_NC)\n" ; \
		docker exec -it user sh -c "sqlite3 /app/src/database/database.sqlite 'SELECT * FROM users;'"; \
		sleep 2; clear;  \
	done
# printf "$(LF)$(D_PURPLE) DB match$(P_NC)\n" ; \
# 		docker exec -it match sh -c "sqlite3 /app/src/db/database.sqlite 'SELECT * FROM users;'"; \
# 		printf "$(LF)$(D_PURPLE) DB tournament$(P_NC)\n" ; \
# 		docker exec -it tour sh -c "sqlite3 /app/src/database/database.sqlite 'SELECT * FROM users;'"; \
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
	@find services/ -type d -name '*-service*'
	@find services -path "*service*/docker-compose.yml" -not -path "*/node_modules/*"


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
	@HOST="$(shell hostname -s)"; \
	if [ -f $(SSL)/$$HOST.key ] && [ -f $(SSL)/$$HOST.crt ]; then \
	  printf "$(LF)  🟢 $(P_BLUE)Certificates already exist $(P_NC)\n"; \
	else \
	  rm -rf $(SSL)/*; \
	  ARCH="$$(uname -m)"; \
	  if [ "$$ARCH" = "x86_64" ]; then \
		PLATFORM="linux/amd64"; \
		MKCERT_URL="https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64"; \
	  elif [ "$$ARCH" = "aarch64" ]; then \
		PLATFORM="linux/arm64"; \
		MKCERT_URL="https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-arm64"; \
	  else \
		echo "Unsupported architecture $$ARCH" >&2; exit 1; \
	  fi; \
	  echo "Using platform $$PLATFORM and mkcert URL $$MKCERT_URL"; \
	  docker run --rm --platform $$PLATFORM --privileged --hostname $(shell hostname) -v $(SSL):/certs -it alpine:latest sh -c "\
		apk add --no-cache nss-tools curl ca-certificates && \
		curl -JLO \"$$MKCERT_URL\" && \
		mv mkcert-v1.4.4-linux-* /usr/local/bin/mkcert && \
		chmod +x /usr/local/bin/mkcert && \
		mkcert -install && \
		mkcert -key-file /certs/$(shell hostname -s).key \
			  -cert-file /certs/$(shell hostname -s).crt \
			  $(shell hostname) \"*.$(shell hostname)\" \
			  $(shell ip route get 8.8.8.8 | awk '{print $$7}') localhost 127.0.0.1 && \
		cp /root/.local/share/mkcert/rootCA.pem /certs/rootCA.pem"; \
		chmod 644 $(SSL)/*.key ; \
	fi
# @curl -s -o secrets/ssl/rootCA.pem https://raw.githubusercontent.com/letsencrypt/pebble/main/test/certs/pebble.minica.pem
# testCert:
	
# docker rm alpine
checkCert:
	@openssl x509 -in $(SSL)/*.crt -text -noout
	@echo | openssl s_client -connect ${DOMAIN}:443 -servername ${DOMAIN} | openssl x509 -noout -text | grep "Subject:"
rmData:
	@echo
# docker run --rm -v $(VOLUMES):/volumes alpine sh -c "rm -rf /volumes/*"


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
