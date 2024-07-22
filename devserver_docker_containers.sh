docker run --name my-redis -p 6379:6379 -d redis || docker start my-redis
docker run --name my-mongodb -v ./mongo-data:/data/db -p 27017:27017 -d mongo || docker start my-mongodb

