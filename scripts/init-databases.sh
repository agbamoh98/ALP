#!/bin/bash
# Creates all required PostgreSQL databases on first startup.
# This script is run by the postgres container's entrypoint.

set -e

PGUSER="$POSTGRES_USER"

create_db() {
    local db=$1
    echo "Creating database: $db"
    psql -v ON_ERROR_STOP=1 --username "$PGUSER" --dbname "postgres" <<-EOSQL
        SELECT 'CREATE DATABASE $db' WHERE NOT EXISTS (
            SELECT FROM pg_database WHERE datname = '$db'
        )\gexec
EOSQL
}

for db in alp_auth alp_resources alp_ai alp_quiz alp_flashcards alp_progress; do
    create_db "$db"
done

echo "All ALP databases initialized."
