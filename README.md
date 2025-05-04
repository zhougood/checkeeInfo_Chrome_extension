# Checkee.info Visa Filter Extension

A Chrome extension that adds filtering functionality to the checkee.info website, allowing users to filter visa data by visa type.

## Features

- Adds a dropdown filter above the visa data table
- Automatically detects all visa types present in the current table
- Allows filtering to show only specific visa types or all visa types
- Clean and intuitive user interface

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing the extension files

## Usage

1. Navigate to any page on [checkee.info](https://checkee.info)
2. Look for the filter dropdown above the visa data table
3. Select a visa type from the dropdown to filter the table and get a summary chart
4. Select "All Visa Types" to show all entries again

## Files

- `manifest.json`: Extension configuration
- `content.js`: Main functionality implementation
- `echarts.min.js`: echart JS file
- `icon48.png` and `icon128.png`: Extension icons

## Development

To modify the extension:

1. Make changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Reload the checkee.info page to see your changes 
