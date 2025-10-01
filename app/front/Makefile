PKG?=yarn

.PHONY: setup dev build fmt lint clean

setup:
	@if [ ! -f .env ]; then cp .env_example .env; fi
	$(PKG) install

dev:
	$(PKG) dev --host 0.0.0.0 --port 5173

build:
	$(PKG) build

fmt:
	$(PKG) run format

lint:
	$(PKG) run lint

clean:
	rm -rf node_modules dist .vite .eslintcache 