#!/bin/bash

set -e

echo "Kong Custom Entrypoint: Processing configuration template..."

if [ -f "/kong/config.template.yaml" ]; then
    echo "Found template file, generating configuration..."

    envsubst < /kong/config.template.yaml > /kong/config.yaml #envia as configs personalizadas para o arquivo de config.yaml

    export KONG_DECLARATIVE_CONFIG=/kong/config.yaml #depois seta a variavel que le esse arquivo de config
else
    echo "No template file found at /kong/kong.yml.template"
    echo "Using existing configuration or default settings"
fi

. /docker-entrypoint.sh