FROM nginx:alpine

# Install OpenSSL for certificate generation
RUN apk add --no-cache openssl

# Automated self-signed SSL generation for local/cluster HTTPS
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/transcendence.key \
    -out /etc/nginx/ssl/transcendence.crt \
    -subj "/C=FI/ST=Uusimaa/L=Helsinki/O=42/OU=Student/CN=localhost"

# Remove default config and apply custom Transcendence config
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 443
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
