# Performance Optimization

## Overview
This document describes the changes made to improve the application's performance, specifically addressing high Largest Contentful Paint (LCP) and inefficient resource loading.

## Changes Implemented

### 1. Preview Script Update
- **Problem:** The default `vite preview` command only listens on `localhost`, which makes it inaccessible from outside the Docker container.
- **Solution:** Updated the `preview` script in `package.json` to include `--host` and specify `--port 3000`.
- **Code Change:** `"preview": "vite preview --host --port 3000"`

## Impact
- Enables the application to be served correctly in a Dockerized environment using the production build.
- Allows the infrastructure to switch from `yarn dev` to `yarn preview` for better performance.
