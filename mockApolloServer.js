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

// Source https://dev-blog.apollodata.com/mocking-your-server-with-just-one-line-of-code-692feda6e9cd
import { mockServer, MockList } from 'graphql-tools';
import casual from 'casual-browserify';

// The GraphQL schema. Described in more detail here:
// https://medium.com/apollo-stack/the-apollo-server-bc68762e93b
const schema = `
  type User {
    id: ID!
    name: String
    lists: [List]
  }
  type List {
    id: ID!
    name: String
    owner: User
    incomplete_count: Int
    tasks(completed: Boolean): [Task]
  }
  type Task {
    id: ID!
    text: String
    completed: Boolean
    list: List
  }
  type RootQuery {
    user(id: ID): User
  }
  schema {
    query: RootQuery
  }
`;

// Mock functions are defined per type and return an
// object with some or all of the fields of that type.
// If a field on the object is a function, that function
// will be used to resolve the field if the query requests it.
const server = mockServer(schema, {
  RootQuery: () => ({
    user: (o, { id }) => ({ id }),
  }),
  List: () => ({
    name: () => casual.word,
    tasks: () => new MockList(4, (o, { completed }) => ({ completed })),
  }),
  Task: () => ({ text: casual.words(10) }),
  User: () => ({ name: casual.name }),
});

mockServer.query(`
query tasksForUser{
  user(id: 6) {
    id
    name
    lists {
      name
      completeTasks: tasks(completed: true) {
        completed
        text
      }
      incompleteTasks: tasks(completed: false) {
        completed
        text
      }
      anyTasks: tasks {
        completed
        text
      }
    }
  }
}`);
