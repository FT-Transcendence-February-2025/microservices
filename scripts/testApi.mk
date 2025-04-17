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
login:init-log
	NAME=User$$(cat /dev/urandom | tr -dc 'A-Za-z' | head -c 3); \
	EMAIL=vico1989@gmail.com; \
	PASS=!Fastify0; \
	TIMESTAMP=$$(date +"%Y-%m-%d %H:%M:%S"); \
	echo "Registering user:"; \
	echo "	Email: $$EMAIL"; \
	echo "	Name:  $$NAME"; \
	echo " Password: $$PASS"; \
	echo "$$TIMESTAMP,$$EMAIL,$$NAME,$$PASS" >> $(LOG_FILE); \
	curl -sk -X POST https://$(shell hostname)/api/auth/login -H "Content-Type: application/json" -d '{"email":"$$EMAIL","password":"$$PASS"}' | jq

login2:init-log # Should return error
	curl -k -X POST https://auth.$(shell hostname)/api/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password"}' | jq

register:init-log
	-docker exec -it user sh -c "sqlite3 /app/src/database/database.sqlite 'SELECT * FROM users;'"
	@echo
	NAME=User$$(cat /dev/urandom | tr -dc 'A-Za-z' | head -c 3); \
	EMAIL=$$NAME@test.com; \
	PASS=$$NAME.123; \
	TIMESTAMP=$$(date +"%Y-%m-%d %H:%M:%S"); \
	echo "Registering user:"; \
	echo "	Email: $$EMAIL"; \
	echo "	Name:  $$NAME"; \
	echo " Password: $$PASS"; \
	echo "$$TIMESTAMP,$$EMAIL,$$NAME,$$PASS" >> $(LOG_FILE); \
	curl -k -X POST https://$(shell hostname)/api/auth/register \
		-H "Content-Type: application/json" \
		-d "{\"email\": \"$$EMAIL\", \"displayName\": \"$$NAME\", \"password\": \"$$PASS\"}" | jq

u-register: # should not #user-exist #user-logout
	curl -k -X POST https://$(shell hostname)/api/user/new-user \
	-H "Content-Type: application/json" \
	-d '{"userId": 8, "displayName": "test"}'


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