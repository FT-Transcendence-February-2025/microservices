# Default target, does nothing
all:

sh: 
	docker exec -it $$c sh
login:
	curl -sk -X POST https://$(shell hostname)/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password"}' | jq

login2:
	curl -k -X POST https://auth.$(shell hostname)/api/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password"}' | jq

register:
	curl -sk -X POST https://$(shell hostname)/api/auth/register \
	-H "Content-Type: application/json" \
	-d '{"email": "user@example.com", "displayName": "JohnDoe", "password": "securePassword123"}' | jq

u-register:
	curl -sk -X POST https://$(shell hostname)/api/user/new-user \
	-H "Content-Type: application/json" \
	-d '{"userId": 8, "displayName": "test"}' | jq
fc-login:
	docker exec -it front-end sh -c 'curl -sk -X POST https://$(shell hostname)/api/auth/login \
	-H "Content-Type: application/json" \
	-d '\''{"email": "user@example.com", "password": "securePassword123"}'\'' | jq'
# ---------------------
fc-login2:
	docker exec -it front-end sh -c 'curl -k -X POST auth.$(shell hostname)/api/login \
	-H "Content-Type: application/json" \
	-d '\''{"email": "user@example.com", "password": "securePassword123"}'\'' | jq'

ac-register:
	docker exec -it auth sh -c 'curl -k -X POST  https://auth.$(shell hostname)/api/user/new-user \
	-H "Content-Type: application/json" \
	-d '\''{"userId": 1, "displayName": "John Doe"}'\'' | jq'
tf-register:
	docker exec -it traefik sh -c 'curl -k -X POST  https://$(shell hostname)/api/user/new-user \
	-H "Content-Type: application/json" \
	-d '\''{"userId": 2, "displayName": "John Doe"}'\'' | jq'
