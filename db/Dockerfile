# Use the official PostgreSQL image from the Docker Hub
FROM postgres:17

# Add labels for better maintainability
LABEL maintainer="Sebastian Nikkonen <sebastian.nikkonen@teamit.fi>"
LABEL description="Postgres with pgvector extension for vector similarity search"
LABEL version="1.0"

# Install build dependencies and pgvector
RUN apt-get update \
    && apt-get install -y \
        postgresql-17-pgvector \
    && apt-get autoremove -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Add initialization scripts
COPY init.sql /docker-entrypoint-initdb.d/

# Expose Postgres default port
EXPOSE 5432

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB} || exit 1