#!/bin/sh
set -e

hosts=""
while [ "$#" -gt 0 ] && [ "$1" != "--" ]; do
    hosts="$hosts $1"
    shift
done
shift

if [ -z "$hosts" ] || [ "$#" -eq 0 ]; then
    >&2 echo "Uso: $0 host1 [host2 ...] -- <comando>"
    exit 1
fi

for host in $hosts; do
    hostname=${host%:*}
    port=${host#*:}
    >&2 echo "Aguardando $hostname:$port..."
    until nc -z "$hostname" "$port"; do
        >&2 echo "$hostname:$port indisponível - dormindo"
        sleep 5
    done
done

>&2 echo "Serviços disponíveis - executando comando"
exec "$@"