# Use an official Bun image as the base
FROM oven/bun:latest

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and the lockfile
COPY template/package.json ./
COPY template/bun.lock ./

# Install dependencies using bun install --frozen-lockfile for reproducible installs
RUN bun install --frozen-lockfile

# Copy the rest of the application source code
COPY template/ .

RUN rm -rf dist output .astro
RUN bun run build

# Expose the port your app runs on (e.g., 3000)
EXPOSE 4321

# Define the command to run your application
CMD [ "bun", "run", "preview" ]