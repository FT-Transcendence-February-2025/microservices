all:

# Initialize all submodules
init-submodules:
	@echo "🚀 Initializing all submodules..."
	@git submodule update --init --recursive
	@echo "✅ All submodules initialized successfully!"

# Update all submodules to their latest commits
update-submodules:
	@echo "🔄 Updating all submodules to latest commits..."
	@git submodule update --recursive --remote
	@echo "✅ All submodules updated successfully!"

subPullMain:
	@echo "🔄 Pulling latest changes for all submodules..."
	@git submodule foreach 'git pull origin $$(git rev-parse --abbrev-ref HEAD)'
	@echo "✅ All submodules updated successfully!"

#list all branches
subList:
	git submodule foreach 'echo "$$path:"; git branch -a'
#check status in submodule
subStatus:
	git submodule foreach 'echo "$$path:"; git fetch; git status'

# git submodule foreach 'git push -u origin feature-branch'
switchMicro:
	git submodule foreach --recursive 'git checkout microservices-integration'
switchMain:
	git submodule foreach --recursive 'git checkout main'
restore:
	git submodule foreach --recursive 'git restore ./'
sub-checkB:
	@if [ -z "$(s)" ]; then \
		echo "Error: s parameter is required"; \
		echo "Usage:" $(YELLOW)"make check-branch s=path/to/submodule" $(E_NC); \
		exit 1; \
	fi
	@echo "🔍 Checking current branch for $(s)..."
	@echo "$(s): $$(git -C $(s) branch --show-current)"

switch:
	@if [ -z "$(s)" ]; then \
		echo "Error: s parameter is required"; \
		echo "Usage:" $(YELLOW)"make switch s=path/to/submodule b=branch-name" $(E_NC); \
		exit 1; \
	fi
	@if [ -z "$(b)" ]; then \
		echo "Error: b parameter is required"; \
		echo "Usage:" $(YELLOW)"make switch s=path/to/submodule b=branch-name" $(E_NC); \
		exit 1; \
	fi
	@echo "🔄 Switching $(s) to branch $(b)..."
	@git -C $(s) checkout $(b)
	@echo "✅ Submodule $(s) switched to $(b)"
#git submodule update --init --recursive
