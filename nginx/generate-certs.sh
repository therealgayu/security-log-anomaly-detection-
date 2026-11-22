#!/bin/bash
# ==============================================================================
# Generate Self-Signed TLS Certificates for Local Development / Testing
# Security Log Anomaly Detection System (NIIT University Capstone II)
# ==============================================================================
# Usage (Git Bash / Linux / macOS):
#   chmod +x generate-certs.sh
#   ./generate-certs.sh
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERTS_DIR="${SCRIPT_DIR}/certs"

mkdir -p "${CERTS_DIR}"

CRT_FILE="${CERTS_DIR}/selfsigned.crt"
KEY_FILE="${CERTS_DIR}/selfsigned.key"

echo "=== Generating Self-Signed SSL Certificate for SLADS ==="
echo "Target Directory: ${CERTS_DIR}"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "${KEY_FILE}" \
  -out "${CRT_FILE}" \
  -subj "/C=IN/ST=Rajasthan/L=Neemrana/O=NIIT University/OU=Capstone II/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:::1"

echo "Certificate generated successfully:"
echo "  Certificate: ${CRT_FILE}"
echo "  Private Key: ${KEY_FILE}"
echo ""
echo "For Production Let's Encrypt / Certbot generation:"
echo "  certbot certonly --webroot -w /var/www/certbot -d yourdomain.com -d www.yourdomain.com"
echo "  Then symlink or copy fullchain.pem -> selfsigned.crt and privkey.pem -> selfsigned.key"
