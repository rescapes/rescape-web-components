# rescape-web

This Rescape package integrates other rescape packages into a generic geospatial web app.

## Running the App

### 1. Clone repository

```sh
git clone https://github.com/calocan/rescape-web
cd rescape-web
```

Install the Graphcool CLI:

```sh
# Install Graphcool CLI
npm install -g graphcool
```

Once it's installed, you can deploy the Graphcool service based on the existing definition inside the [`server`](./server) directory:

```sh
cd server
yarn install
graphcool deploy
```

When prompted which cluster you want to deploy to, choose any of the **Shared Clusters** options (`shared-eu-west-1`, `shared-ap-northeast-1` or `shared-us-west-2`).

### 3. Connect the app with your GraphQL API

Paste the service ID (which you find in the generated `.graphcoolrc` file inside the `server` directory or by running `graphcool info`) into `./src/index.js` replacing the current placeholder `__SERVICE_ID__`. 

### 5. Install dependencies & run locally

```sh
cd ..
yarn install
yarn start # open http://localhost:3000 in your browser
```

### 6. Local development notes
graphql unfortunately relies on instanceof checks, which causes version mismatches when other rescape packagers are linked
for local development. My current approach for development is the following.

For any rescape packages that you are editing, link them locally

```sh
    cd ../rescape-cycle
    yarn link
    cd ../rescape-helpers
    yarn link
    cd ../rescape-helpers-component
    yarn link
    cd ../rescape-ramda
    yarn link
    cd ../rescape-sample-data
    yarn link
    cd ../rescape-validate
    yarn link
    cd ../rescape-web
    yarn link rescape-cycle
    yarn link rescape-helpers
    yarn link rescape-helpers-component
    yarn link rescape-ramda
    yarn link rescape-sample-data
    yarn link rescape-validate
```

To undo any of these repeat the steps and run yarn unlink

```sh
    yarn unlink rescape-cycle
    yarn unlink rescape-helpers
    yarn unlink rescape-helpers-component
    yarn unlink rescape-ramda
    yarn unlink rescape-sample-data
    yarn unlink rescape-validate
    cd ../rescape-cycle
    yarn unlink
    cd ../rescape-helpers
    yarn unlink
    cd ../rescape-helpers-component
    yarn unlink
    cd ../rescape-ramda
    yarn unlink
    cd ../rescape-sample-data
    yarn unlink
    cd ../rescape-validate
    yarn unlink
    cd ../rescape-web
```

This allows rescape-web to use the local build of the other rescape-packages
You still have to build the other packages if you make any edits to them.
It should be possible to simply reference the es6 source code of the packages instead of the build,
but I can't figure out how to do it with the mess of trying to use es6 source directly in node (for jest tests)

If you link rescape-helpers-component, its local graphql needs to be linked to rescape-web's
```sh
    cd ../rescape-helpers-component
    npm link ../rescape-web/node_modules/graphql
```
Otherwise graphql fails to match itself on instanceof checks (grrrr)
(see https://stackoverflow.com/questions/31169760/how-to-avoid-react-loading-twice-with-webpack-when-developing/38818358#38818358
for similar react example)



