#!/bin/bash

echo "Stopping any running dfx processes..."
dfx stop

echo "Cleaning up any temporary files..."
rm -rf .dfx/

echo "Starting dfx with clean state..."
dfx start --clean --background

echo "Waiting for dfx to initialize..."
sleep 5

echo "Deploying Internet Identity canister..."
dfx deploy internet_identity

echo "Internet Identity canister deployed successfully!"
echo "You can now connect to ICP without the 'Canister not found' error."
