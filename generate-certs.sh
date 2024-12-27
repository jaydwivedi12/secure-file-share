#!/bin/bash
# generate-certs.sh

# Create SSL directory if it doesn't exist
mkdir -p ./ssl

# Generate SSL certificate and key
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ./ssl/private.key \
    -out ./ssl/certificate.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Set proper permissions
chmod 600 ./ssl/private.key
chmod 600 ./ssl/certificate.crt