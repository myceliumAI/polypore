#!/bin/sh
set -e

: "${API_UPSTREAM:?API_UPSTREAM is required, e.g. http://polypore-backend:8000/}"

# Remplace le placeholder par la variable d'env
envsubst '${API_UPSTREAM}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
