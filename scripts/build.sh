#!/bin/bash
# Baut Dirigent.app und installiert sie nach /Applications.
set -euo pipefail
cd "$(dirname "$0")/.."
command -v xcodegen >/dev/null || { echo "xcodegen fehlt: brew install xcodegen"; exit 1; }
if [ ! -f Resources/Assets.xcassets/AppIcon.appiconset/icon_512x512@2x.png ]; then
  mkdir -p build && swiftc -O scripts/make-icon.swift -o build/make-icon && ./build/make-icon "$PWD"
fi
xcodegen generate -q
xcodebuild -project Dirigent.xcodeproj -scheme Dirigent -configuration Release -derivedDataPath build -quiet build
if [ "${1:-}" != "--no-install" ]; then
  osascript -e 'tell application "Dirigent" to quit' 2>/dev/null || true
  sleep 1
  rm -rf /Applications/Dirigent.app
  cp -R build/Build/Products/Release/Dirigent.app /Applications/
  echo "✅ Installiert: /Applications/Dirigent.app"
  open /Applications/Dirigent.app
fi
