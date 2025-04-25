all:

watchDB:
	@watch -c -n 1 'echo  && \
	echo "-----------------AUTH------------------" && \
	echo "--- users table  ---" && \
	docker exec -i auth sh -c "sqlite3 /app/src/database/database.sqlite \"SELECT * FROM users;\"" 2>/dev/null || echo "Cannot access auth users table" && \
	echo "--- devices table ---" && \
	docker exec -i auth sh -c "sqlite3 /app/src/database/database.sqlite \"SELECT * FROM devices;\"" 2>/dev/null || echo "Cannot access auth devices table" && \
	echo "--- auth codes table ---" && \
	docker exec -i user sh -c "sqlite3 /app/src/database/database.sqlite \"SELECT * FROM auth_codes;\"" 2>/dev/null || echo "Cannot access user table"'

	echo "------------------USER-----------------" && \
# -docker exec -it user sh -c "sqlite3 /app/src/database/database.sqlite 'SELECT * FROM match_history;'"
#	-docker exec -it auth sh-c "sqlite3 /app/src/database/database.sqlite 'SELECT * FROM match_history;'"

localDB:
	@echo "🔍 Searching for database files..."
	@find services -type d \( -name "*database*" -o -name "*db*" \) | grep -v "node_modules" | while read -r dir; do \
		echo "------------- $$dir ------------ "; \
		if [ -f "$$dir/database.sqlite" ]; then \
			echo "📊 Tables in database:"; \
			(cd "$$dir" && sqlite3 database.sqlite ".tables"); \
			echo "📋 Table contents:"; \
			(cd "$$dir" && sqlite3 database.sqlite ".tables" | tr -s ' ' '\n' | while read -r table; do \
				if [ -n "$$table" ]; then \
					echo "🔹 Table: $$table -----------------------"; \
					sqlite3 database.sqlite "SELECT * FROM $$table;"; \
					echo ""; \
				fi; \
			done); \
		else \
			echo "❌ No SQLite database found in this directory"; \
		fi; \
		echo "-----------------------------------"; \
	done

watchLocal:
	@echo "🔍 Watching local users tables..."
	@echo "Press Ctrl+C to exit."
	@watch -n 1 '\
		echo "===== LOCAL DATABASES USERS TABLES ====="; \
		for dir in $$(find services -type d \( -name "*database*" -o -name "*db*" \) | grep -v "node_modules"); do \
			if [ -f "$$dir/database.sqlite" ]; then \
				echo "\n------------- $$dir -------------"; \
				echo "📊 Users table:"; \
				(cd "$$dir" && sqlite3 -header -column -separator "|" database.sqlite "SELECT * FROM users;") 2>/dev/null || echo "No users table in $$dir"; \
			fi; \
		done'