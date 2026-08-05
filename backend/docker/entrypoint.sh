#!/bin/sh
set -e

host="${POSTGRES_HOST:-db}"
port="${POSTGRES_PORT:-5432}"

echo "Waiting for PostgreSQL at ${host}:${port}..."
until python -c "
import socket
s = socket.socket()
s.settimeout(2)
s.connect(('${host}', int('${port}')))
s.close()
" 2>/dev/null; do
  sleep 2
done

echo "PostgreSQL is ready."
exec "$@"
