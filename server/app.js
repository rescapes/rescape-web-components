/**
 * Created by Andy Likuski on 2017.11.29
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Original source: https://medium.com/react-weekly/implementing-graphql-in-your-redux-app-dad7acf39e1b
// server/app.js
import 'regenerator-runtime/runtime';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { graphql } from 'graphql';
import { introspectionQuery } from 'graphql/utilities';
import schema from './schema/typeDefs';
import morgan from 'morgan';
import cors from 'cors';
// constants needed
const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 1338 : process.env.PORT;
const app = express();
const graphqlHTTP = require('express-graphql');
const query = 'query { employees { id, numemployees, location }}';
if (isDeveloping) {
  app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  app.use(morgan('combined'));
}
app.use(express.static(__dirname + '/public'));
graphql(schema, query).then((result) => {
  console.log(JSON.stringify(result))
});
(async () => {
  try {
    app.use(
      '/api',
      cors(),
      graphqlHTTP({ schema, pretty: true, graphiql: true })
    );
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'public/index.html'));
    });
    app.listen(port, '0.0.0.0', (err) => {
      if (err) { return console.warn(err); };
      return console.info(
        `==> 😎 Listening on port ${port}.
          Open http://0.0.0.0:${port}/ in your browser.`
      );
    });
    let json = await graphql(schema, introspectionQuery);
    fs.writeFile(
      './server/schema/schema.json',
      JSON.stringify(json, null, 2),
      err => {
        if (err) throw err;
        console.log("JSON Schema Created")
      });
  } catch (err) {
    console.log(err);
  }
})();