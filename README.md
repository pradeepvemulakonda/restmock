![Alt text](./restmock1.svg)

## Welcome to restmock

A simple mock server that uses

- x-correlation-id as the mock selector
- file directory structure as the path of the endpoint
- json file as the response of the api
- file should be of the format {uniqueIdForApi}-{requiredHttpStausCode}// Should not contain the delay
- if no basepath is provided, the public folder would be used to search for mocks.

The x-correlation-id header should be of the format '{uniqueIdForApi}-{requiredHttpStausCode}-{responseDelay}'
- uniqueIdForApi --- Can be any random number, recommended be unique per api.
- requiredHttpStatusCode --- should be a number between 200-599 (http status codes)
- resopnseDelay --- can be used to delay the response. Simulate delay. Milliseconds
- Mock folder in use: C:\software\mocks

## How to use
- clone project

- run ```npm install -g```

- run ```restmock -b <path to mocks base directory> -p <port>``` // both -b and -p are optional

- by default the server runs at port 3000

- set localhost:3000 as the host for your mock API's

> If API is locahost:3000/test/api and x-correlation-id is 12345-200-1000
> Then

> -  in the basepath directory, create a directory test/api
> -  create a file 12345-200.json
> -  the 1000 will be used to set the response delay
> -  the 200 in the file name denotes the response http status the mock will return.
> -  to return a 500, create a file 12345-500.json and for a 400, 12345-400.json.
> -  the x-correlation-id should match the file name. So to get a 400 response, x-correlation-id should be 12345-400.

