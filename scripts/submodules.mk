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

#list all branches
subList:
	git submodule foreach 'echo "$$path:"; git branch -r'
#check status in submodule
subStatus:
	git submodule foreach 'echo "$$path:"; git fetch; git status'

# git submodule foreach 'git push -u origin feature-branch'
#git submodule foreach --recursive 'git push -u origin microservices-integration'

#git submodule update --init --recursive
