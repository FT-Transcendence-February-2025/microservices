all:

du:
	@docker-compose down
	@docker-compose up -d
# print logs in docker enviroment continuesly
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
	$(MAKE) --no-print w c=traefik
# watch docker exec -it traefik sh -c "cat /traefik/logs/"
pr:
	$(MAKE) --no-print w c=prometheus
gr:
	$(MAKE) --no-print w c=grafana

#quick commands
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

install-deps:
	@echo "🚀 Installing Node dependencies for all services..."
	@find . -name "package.json" -not -path "*/node_modules/*" | while read -r package_file; do \
		service_dir=$$(dirname "$$package_file"); \
		echo "📦 Installing dependencies for $$service_dir"; \
		(cd "$$service_dir" && \
			echo "⏳ Running npm install --include-dev" && \
			npm install --include-dev && \
			echo "✅ Dependencies installed successfully for $$service_dir") || \
			echo "❌ Failed to install dependencies for $$service_dir"; \
		echo "-----------------------------------"; \
	done
	@echo "🏁 Dependency installation process completed!"

# Modify runLocal to call checkServices after starting everything
runLocal: secrets stopLocal
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

stopLocal:
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

checkPorts:
	-@netstat -tuln | grep ":3000*" || echo  "All free"
