[![Build Status](https://travis-ci.org/michalstepien/PortaAngusta.Web.svg?branch=master)](https://travis-ci.org/michalstepien/PortaAngusta.Web)
[![codecov](https://codecov.io/gh/michalstepien/PortaAngusta.Web/branch/master/graph/badge.svg)](https://codecov.io/gh/michalstepien/PortaAngusta.Web)

In progress... Dont use.

[OrientDB Studio](http://localhost:2480) 
[Local Server HTTP](http://localhost:8084)
[Swagger](http://localhost:8084/swagger)

# Install and build

  - docker pull orientdb
  - docker run -d --name orientdb -p 2424:2424 -p 2480:2480 -e ORIENTDB_ROOT_PASSWORD=rootpwd orientdb
  - docker pull redis
  - docker run --name redis -p 6379:6379 -d redis
  - npm install orientjs -g
  - orientjs db create portaangusta graph plocal
  - orientjs migrate up
  - cd frontend
  - npm install
  - npm run lint
  - npm run test-frontend
  - npm run build
  - cd ..
  - npm run test
  - npm run build
  - npm run codecv


# Create migration
orientjs -n=portaangusta migrate create migrationname
