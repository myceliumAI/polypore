FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System deps + uv installer
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates build-essential && \
    rm -rf /var/lib/apt/lists/* && \
    curl -LsSf https://astral.sh/uv/install.sh | sh

# Ensure uv on PATH
ENV PATH="/root/.local/bin:${PATH}"

# Copy dependency manifest first for better caching
COPY pyproject.toml /app/pyproject.toml

# Preinstall dependencies (dev too for tooling in container)
RUN uv sync --dev

# Copy source
COPY . /app

EXPOSE 8000

CMD ["sh", "-lc", "make dev"] 