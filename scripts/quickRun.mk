all:

w:
	@while true; do \
		docker compose logs --follow $$c || { clear; true; }; \
		sleep 2; \
	done
f:
	$(MAKE) --no-print w c=front
a:
	$(MAKE) --no-print w c=auth
u:
	$(MAKE) --no-print w c=user
m:
	$(MAKE) --no-print w c=match
t:
	$(MAKE) --no-print w c=tour
g:
	$(MAKE) --no-print --no-print w c=game
tr:
# $(MAKE) --no-print w c=traefik
	watch docker exec -it traefik sh -c "cat /traefik/logs/"
pr:
	$(MAKE) --no-print w c=prometheus
gr:
	$(MAKE) --no-print w c=grafana
fd:
	$(MAKE) --no-print D=1 fclean dcon
d:
	$(MAKE) --no-print D=1 dcon

# Check if all services are running
checkServices:
	@echo "🔍 Checking if all services are running..."
	@find . -type d -path "*/src/src" | while read -r dir; do \
		service=$$(dirname "$$(dirname "$$dir")"/src); \
		if [ -f "$$service/package.json" ]; then \
			pids=$$(ps aux | grep "node.*$$service" | grep -v grep | awk '{print $$2}'); \
			if [ -n "$$pids" ]; then \
				echo "✅ $$service is running (PID: $$pids)"; \
			else \
				echo "❌ $$service is NOT running"; \
			fi; \
		fi; \
	done
	@echo "📋 Complete service status check finished"

# Modify runLocal to call checkServices after starting everything
runLocal: secrets stopServices
	@echo "🔍 Finding all src/src directories and running npm dev in background..."
	@find . -type d -path "*/src/src" | while read -r dir; do \
		service=$$(dirname "$$(dirname "$$dir")"/src); \
		echo "📂 Found src/src in: $$service"; \
		if [ -f "$$service/package.json" ]; then \
			echo "📄 Copying .env file to $$service"; \
			if [ -f ".env" ]; then \
				cp .env "$$service/.env" && echo "✅ .env copied successfully"; \
			else \
				echo "⚠️ No .env file found in root directory"; \
			fi; \
			echo "🚀 Starting npm run dev in $$service (background)"; \
			(touch $$service/dev.log && cd "$$service" && npm install --include=dev && npm run dev  2>&1 & echo "✅ Started $$service [PID: $$!]"); \
		else \
			echo "⚠️ No package.json found in $$service, skipping"; \
		fi; \
		echo "-----------------------------------"; \
	done
	@echo "✅ All services started in background. Check individual logs in each service directory."
	@echo "⏳ Waiting for services to initialize..."
	@sleep 5
	@$(MAKE) checkServices

stopServices:
	@echo "🛑 Stopping all running Node.js services..."
	@find . -type d -path "*/src/src" | while read -r dir; do \
		service=$$(dirname "$$(dirname "$$dir")"/src); \
		if [ -f "$$service/package.json" ]; then \
			pids=$$(ps aux | grep "node.*$$service" | grep -v grep | awk '{print $$2}'); \
			if [ -n "$$pids" ]; then \
				echo "⏹️ Stopping $$service (PID: $$pids)"; \
				kill -15 $$pids || kill -9 $$pids; \
				echo "✅ Stopped $$service"; \
			else \
				echo "ℹ️ $$service is not running"; \
			fi; \
		fi; \
	done
	@echo "📋 All services stopped"

# Check logs for all running services or a specific service
logsLocal:
	@if [ -n "$$s" ]; then \
		echo "🔍 Checking logs for service: $$s"; \
		if [ -f "$$s/dev.log" ]; then \
			tail -f "$$s/dev.log"; \
		else \
			echo "⚠️ Log file not found for $$s"; \
			find . -type d -path "*/src/src" | while read -r dir; do \
				service=$$(dirname "$$(dirname "$$dir")"/src); \
				if [ "$$service" = "$$s" ] || [ "./$$service" = "$$s" ] || [ "$$(basename $$service)" = "$$s" ]; then \
					echo "🔎 Found matching service at $$service"; \
					if [ -f "$$service/dev.log" ]; then \
						tail -f "$$service/dev.log"; \
						exit 0; \
					fi; \
				fi; \
			done; \
			echo "❌ Could not find log file for service $$s"; \
		fi; \
	else \
		echo "📋 Available service logs:"; \
		find . -name "dev.log" | while read -r log; do \
			service=$$(dirname "$$log"); \
			echo "   - $$service ($$log)"; \
		done; \
		echo ""; \
		echo "📝 Use 'make logsLocal s=<service_name>' to view logs for a specific service"; \
		echo "   For example: make logsLocal s=authentication-service"; \
		echo "   You can use the full path or just the service name"; \
	fi