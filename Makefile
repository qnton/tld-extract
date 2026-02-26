.PHONY: all build test check clean update publish

# Default architecture is to just run tests and builds
all: check test build

# Clean the generated dist folder
clean:
	rm -rf dist

# Update the TLD cache
update:
	pnpm run update

# Lint the codebase
check:
	pnpm run check

# Run tests
test: check
	pnpm run test

# Build the TS into the 'dist' outputs
build: clean update test
	pnpm run build

# Build, check, test, and publish the package to NPM
publish: build
	npm publish --access public
