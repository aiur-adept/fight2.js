fight2.js
===

A wonderful game of violence

### Development

1. Create a local redis and mongo instance: `./devserver_docker_containers.sh`

3. Run `npm i`

4. Run `npm run devserver`

### Deployment

1. set up your cluster

2. deploy the oauth client json with `kubectl create secret generic oauth-client-secret --from-file=oauth_client.json=/path/to/your/oauth_client.json`

3. deploy the grafana password secret with `kubectl create secret generic grafana-secret --from-literal=admin-password='YourSecurePassword'`

4. create monitoring namespace `kubectl create namespace monitoring`

5. Deploy using the `/kubernetes` yml's
