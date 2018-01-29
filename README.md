[![Build Status](https://travis-ci.org/microservices-demo/front-end.svg?branch=master)](https://travis-ci.org/microservices-demo/front-end)
[![](https://images.microbadger.com/badges/image/weaveworksdemos/front-end.svg)](http://microbadger.com/images/weaveworksdemos/front-end "Get your own image badge on microbadger.com")


Front-end app
---
Front-end application written in [Node.js](https://nodejs.org/en/) that puts together all of the microservices under [microservices-demo](https://github.com/microservices-demo/microservices-demo).

# Situational configurations

This application has been coded to behave specific ways based on various configurations and inputs to simulate real world issues application developers will face. The table below outlines these configurations
<table>
  <thead>
    <tr>
      <th>Situation</th>
      <th>Configuration</th>
      <th>Manifestation</th>
    </tr>
  </thead>
  <tr>
    <td>Simulate login from Google or Facebook IdP</td>
    <td>Provide request header "IdentityProvider" on login request. Google or Facebook. Omit header for default Buttercup Games IdP</td>
    <td>Will emit an information log in front-end winston logs indicating the identity provider used during the authentication request. Will fail the authentication request and emit log if header is not Google, Facebook or Buttercup_Games</td>
  </tr>
  <tr>
    <td>Simulate login failures for Buttercup Game IdP</td>
    <td>Touch file ./runtime_config/break_buttercup on front-end container. Remove file to restore operations</td>
    <td>Will fail all authorization requests for Buttercup Games IdP and emit error log to front-end winston logs</td>
  </tr>
  <tr>
    <td>Simulate intermittent 500 failures to page requests</td>
    <td>Modify file ./runtime_config/request_failure_percentage with single number on line one between 0 and 100 representing the percent probability that the request will fail. 100 will fail every request. Remove file to restore operations</td>
    <td>Will result in http request from webserver returning a 500 error and emit error log to front-end winston logs</td>
  </tr>
  <tr>
    <td>Defect in code: Sport filter does not work as intended</td>
    <td>Simply select and apply the sport filter on the catalog page</td>
    <td>The code improperly ignores the filter and returns all socks to the end user</td>
  </tr>
  <tr>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td></td>
    <td></td>
    <td></td>
  </tr>
</table>


# Build

## Dependencies

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Version</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="https://docker.com">Docker</a></td>
      <td>>= 1.12</td>
    </tr>
    <tr>
      <td><a href="https://docs.docker.com/compose/">Docker Compose</a></td>
      <td>>= 1.8.0</td>
    </tr>
    <tr>
      <td><a href="gnu.org/s/make">Make</a>&nbsp;(optional)</td>
      <td>>= 4.1</td>
    </tr>
  </tbody>
</table>

## Node

`npm install`

## Docker

`make test-image`

## Docker Compose

`make up`

# Test

**Make sure that the microservices are up & running**

## Unit & Functional tests:

```
make test
```

## End-to-End tests:
  
To make sure that the test suite is running against the latest (local) version with your changes, you need to manually build
the image, run the container and attach it to the proper Docker networks.
There is a make task that will do all this for you:

```
make dev
```

That will also tail the logs of the container to make debugging easy.
Then you can run the tests with:

```
make e2e
```

# Run

## Node

`npm start`

## Docker

`make server`

# Use

## Node

`curl http://localhost:8081`

## Docker Compose

`curl http://localhost:8080`

# Push

`GROUP=weaveworksdemos COMMIT=test ./scripts/push.sh`
