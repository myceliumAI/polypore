UV?=uv

.PHONY: setup dev run fmt lint clean

setup:
	@if [ ! -f .env ]; then cp .env_example .env; fi
	$(UV) sync --all-groups

 dev:
	rm -rf .venv
	mkdir -p data
	$(UV) run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

 run:
	$(UV) run uvicorn app.main:app --host 0.0.0.0 --port 8000

 fmt:
	$(UV) run ruff check --fix .
	$(UV) run ruff format .

 lint:
	$(UV) run ruff check .

clean:
	rm -rf .venv .uv __pycache__ .pytest_cache .mypy_cache ruff_cache .coverage htmlcov
	rm -rf data 