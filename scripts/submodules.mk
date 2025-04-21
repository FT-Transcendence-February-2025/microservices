all:

subList:
	git submodule foreach 'echo "$$path:"; git branch -r'
subStatus:
	git submodule foreach 'echo "$$path:"; git fetch; git status'

# git submodule foreach 'git push -u origin feature-branch'
#git submodule foreach --recursive 'git push -u origin microservices-integration'

#git submodule update --init --recursive
