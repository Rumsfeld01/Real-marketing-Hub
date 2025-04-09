#!/bin/bash
# Script to push database schema using drizzle-kit

echo "Running schema push with drizzle-kit..."
npx drizzle-kit push
echo "Schema push completed."