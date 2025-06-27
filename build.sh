#!/bin/bash

# Build the frontend
cd frontend
npm install
npm run build

# Copy the dist folder to the root
cp -r dist ../

# Go back to root
cd ..

echo "Build completed successfully!" 