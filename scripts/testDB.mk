all:

userDB:
	@echo "-----------------AUTH------------------"
		-docker exec -it auth sh -c "sqlite3 /app/src/database/database.sqlite 'SELECT * FROM users;'"
#	-docker exec -it auth sh-c "sqlite3 /app/src/database/database.sqlite 'SELECT * FROM match_history;'"
	@echo "------------------USER-----------------"
		-docker exec -it user sh -c "sqlite3 /app/src/database/database.sqlite 'SELECT * FROM users;'"
# -docker exec -it user sh -c "sqlite3 /app/src/database/database.sqlite 'SELECT * FROM match_history;'"
