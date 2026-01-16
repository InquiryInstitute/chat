FROM ghcr.io/danny-avila/librechat:latest

# Cloud Run uses PORT environment variable
# LibreChat listens on port 3080 by default, but we need to make it configurable
ENV PORT=3080

# Create startup script
RUN echo '#!/bin/sh\n\
if [ -n "$PORT" ]; then\n\
  export NODE_PORT=$PORT\n\
fi\n\
exec node /app/server.js\n\
' > /start.sh && chmod +x /start.sh

# Use the startup script
ENTRYPOINT ["/start.sh"]
