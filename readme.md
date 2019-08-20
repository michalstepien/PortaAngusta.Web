[![Build Status](https://travis-ci.org/michalstepien/PortaAngusta.Web.svg?branch=master)](https://travis-ci.org/michalstepien/PortaAngusta.Web)
[![codecov](https://codecov.io/gh/michalstepien/PortaAngusta.Web/branch/master/graph/badge.svg)](https://codecov.io/gh/michalstepien/PortaAngusta.Web)


In progress...

npm install orientjs -g
orientjs db drop portaangusta
orientjs db create portaangusta graph plocal

orientjs migrate up
orientjs migrate up 1
orientjs migrate down
orientjs migrate down 1

#Create migration
orientjs -n=portaangusta migrate create migrationname
