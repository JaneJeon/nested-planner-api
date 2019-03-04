# Nested Planner
[![CircleCI](https://circleci.com/gh/JaneJeon/nested-planner-api.svg?style=svg)](https://circleci.com/gh/JaneJeon/nested-planner-api)

This planner stores items in a hierarchy so that you can organize better, and allows you to query it as a tree or as a list, depending on your need.

## Supported Operations
- login/logout
- account creation/modification/deletion
- fetch a user's notebooks
- notebook creation/modification/deletion
- fetch a notebook's items
  - show/hide completed items
  - filter by important items
  - show items that are due soon
  - fetch the full tree
- item creation/modification/deletion

## Dependencies
This app relies on Postgres for its data store and Redis for server-side sessions (too lazy to implement proper JWTs using passport).
Before you `npm install`, make sure that:
- you have copied `.env.example` into `.env`
- you have created a Postgres database for the application to connect to
- you have updated your environment variables appropriately

Or, if you're pushing to Heroku (all of this fits in the free tier):
- create an app
  - add Postgres and Redis add-ons at the minimum
- set the `SESSION_SECRET` environment variable from Heroku dashboard (no need to bother with `.env` files)
- `git push heroku master`
