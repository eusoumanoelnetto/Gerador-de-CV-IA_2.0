#!/usr/bin/env bash
export PLAYWRIGHT_BROWSERS_PATH=/tmp/playwright
pip install -r requirements.txt
playwright install --with-deps