# Log file to store generated user data.
LOG_FILE = users.csv

# Default target, does nothing
all:

# Target to initialize the log file with headers if it doesn't exist.
init-log:
	@if [ ! -f $(LOG_FILE) ]; then \
		echo "timestamp,email,displayName,password" > $(LOG_FILE); \
	fi

sh: 
	docker exec -it $$c sh

loginAdmin:
	@EMAIL=Vtest2@test.com \
	PASS=$(shell cat secrets/userPass); \
	curl -sk -X POST https://$(shell hostname)/api/auth/login -H "Content-Type: application/json" -d '{"email":"$$EMAIL","password":"$$PASS"}' | jq
loginAdmin2:
	@EMAIL=$(shell cat secrets/adminEmail); \
	PASS=$(shell cat secrets/userPass); \
	curl -sk -X POST https://$(shell hostname)/api/auth/login \
	-H "Content-Type: application/json" -d \
	"{\"email\": \"$$EMAIL\", \"password\": \"$$PASS\"}" | jq 

login:init-log # Should return error
	@ID=$$(shuf -i 1-50 -n 1); \
	DISPLAY=Vtest$$ID; \
	EMAIL=$$DISPLAY@test.com; \
	PASS=$(shell cat secrets/userPass); \
	TIMESTAMP=$$(date +"%Y-%m-%d %H:%M:%S"); \
	echo "$$TIMESTAMP,$$DISPLAY" >> $(LOG_FILE); \
	curl -sk -X POST https://$(shell hostname)/api/auth/login -H "Content-Type: application/json" -d '{"email":"$$EMAIL","password":"$$PASS"}' | jq

register:init-log
	@ID=$$(shuf -i 1-50 -n 1); \
	DISPLAY=Vtest$$ID; \
	EMAIL=$$DISPLAY@test.com; \
	echo $$EMAIL ; \
	PASS=$(shell cat secrets/userPass); \
	TIMESTAMP=$$(date +"%Y-%m-%d %H:%M:%S"); \
	echo "$$TIMESTAMP,$$DISPLAY,$$EMAIL" >> $(LOG_FILE); \
	curl -k -X POST https://$(shell hostname)/api/auth/register \
		-H "Content-Type: application/json" \
		-d "{\"email\": \"$$EMAIL\", \"displayName\": \"$$DISPLAY\", \"password\": \"$$PASS\"}" | jq ;


u-register: # should not #user-exist #user-logout
	@ID=$$(shuf -i 1-50 -n 1); \
	DISPLAY=Vtest$$ID; \
	EMAIL=$$DISPLAY@test.com; \
	PASS=$(shell cat secrets/userPass); \
	TIMESTAMP=$$(date +"%Y-%m-%d %H:%M:%S"); \
	echo "Registering user:"; \
	echo " Name:  $$DISPLAY"; \
	echo "$$TIMESTAMP,$$DISPLAY=" >> $(LOG_FILE); \
	curl -k -X POST https://$(shell hostname)/api/user/new-user \
	-H "Content-Type: application/json" \
	-d '{"userId": "$$ID", "displayName": "$$DISPLAY"}'
	@echo


fc-login:
	docker exec -it front-end sh -c 'curl -k -X POST https://$(shell hostname)/api/auth/login \
	-H "Content-Type: application/json" \
	-d '\''{"email": "user@example.com", "password": "securePassword123"}'\'' | jq'
tf-user:
	docker exec -it traefik sh -c 'curl -k -X POST  https://$(shell hostname)/api/user/new-user \
	-H "Content-Type: application/json" \
	-d '\''{"userId": 9, "displayName": "John Doe"}'\'' | jq'
tf-userPing:
	docker exec -it traefik sh -c 'curl -k -X GET  https://$(shell hostname)/api/user/ | jq'
tf-auth-port:
	docker exec -it traefik sh -c 'curl -kX GET auth:3001''| jq'
# ---------------------
fc-login2:
	docker exec -it front-end sh -c 'curl -k -X POST auth.$(shell hostname)/api/login \
	-H "Content-Type: application/json" \
	-d '\''{"email": "user@example.com", "password": "securePassword123"}'\'' | jq'

ac-register:
	docker exec -it auth sh -c 'curl -k -X POST  http://user:3002/api?/new-user \
	-H "Content-Type: application/json" \
	-d '\''{"userId": 20, "displayName": "John Doe"}'\'' | jq'

ac-register2:
	docker exec -it auth sh -c 'curl -k -X POST  https://$(shell hostname)/api/user/new-user \
	-H "Content-Type: application/json" \
	-d '\''{"userId": 1, "displayName": "John Doe"}'\'' | jq'

tf-auth:
	curl -kX POST https://$(shell hostname)/api/auth/register \
	-H "Content-Type: application/json" \
	-H "Host: auth.$(shell hostname)" \
	-d '{"email": "user@example.com", "password": "securePassword123"}'
# -----------------------------------

match-ws:
	@echo "Logging in and extracting token..."
	@TOKEN=$$(curl -sk -X POST https://$$(hostname)/api/auth/login \
		-H "Content-Type: application/json" \
		-d '{"email": "'$$(cat secrets/adminEmail)'", "password": "'$$(cat secrets/userPass)'"}' | jq -r '.token'); \
	echo "Token: $$TOKEN"; \
	echo "Connecting to WebSocket with token..."; \
	curl -k -v -N \
		-H "Connection: Upgrade" \
		-H "Upgrade: websocket" \
		-H "Host: $$(hostname)" \
		-H "Origin: https://$$(hostname)" \
		-H "Sec-WebSocket-Key: $$(openssl rand -base64 16)" \
		-H "Sec-WebSocket-Version: 13" \
		-H "Authorization: Bearer $$TOKEN" \
		https://$$(hostname)/api/match/ws