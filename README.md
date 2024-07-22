fight2.js
===

A wonderful game of violence

### Development

1. Create a local redis instance on docker: `docker run --name my-redis -p 6379:6379 -d redis`

2. Create a local mongodb instance on docker: `docker run --name my-mongodb -p 27017:27017 -d mongo`

3. Run `npm i`

4. Run `npm run devserver`

### Deployment

1. Deploy using the kubernetes yml's
