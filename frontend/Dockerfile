# Use the official Deno image
FROM denoland/deno:alpine-1.43.5

# Set the working directory
WORKDIR /app

# Copy the application files
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Set the environment variables for ORS API URL and PORT
ENV ORS_API_URL=http://localhost:8080/ors/v2
ENV PORT=3000

# Set the command to run the app with the necessary permissions
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-env", "src/server.ts"]
