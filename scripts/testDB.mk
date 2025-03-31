all:

userDB:
	-docker exec -it user sh -c "sqlite3 /app/src/database/database.sqlite 'SELECT * FROM users;'"
	-docker exec -it user sh -c "sqlite3 /app/src/database/database.sqlite 'SELECT * FROM match_history;'"
