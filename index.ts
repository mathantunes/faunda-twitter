
import { gql, GraphQLClient } from 'graphql-request'
import { config } from "dotenv"
import { resolve } from "path"
import * as express from "express";
import { Client, Collection, Create, Get, Index, Join, Match, Paginate, Ref, Select } from "faunadb";

const app = express.default();

config({ path: resolve(__dirname, "../.env") })

const graphQlClientExamples = () => {
  const unwrap = (obj: any) => Object.values(obj)?.[0];
  const client = new GraphQLClient(process.env.fauna_endpoint ?? '', {
    headers: {
      authorization: 'Bearer ' + process.env.fauna_secret,
    },
  });

  const query = gql` {
      findUserByID(id: 308474222441660609){
      email
    }
  }
  `
  client.request(query).then((data) => console.log(unwrap(data)))

  const mutation = gql` 
    mutation($data: UserInput!) {
        createUser(data: $data) { _id, id, name }
    }
  `
  const vars = {
    data: {
      id: "one",
      name: "matheus123",
      email: "huhu",
      address: {
        street: "hello",
        city: "aa",
        state: "a",
        zipCode: "123"
      }
    }
  }
  client.request(mutation, vars).then((data) => console.log(unwrap(data)))

}

const fnDBClient = new Client({
  secret: process.env.fauna_secret ?? '',
  domain: 'db.eu.fauna.com',
  scheme: 'https',
});
fnDBClient.ping().then(response => console.log(response))

app.get('/tweet/:id', async (req, res) => {
  const doc = await fnDBClient.query(
    Get(
      Ref(
        Collection('tweets'),
        req.params.id
      )
    )
  ).catch(err => res.send(err));
  res.send(doc);
});

app.get('/tweet', async (req, res) => {
  const docs = await fnDBClient.query(
    Paginate(
      Match(
        Index('tweets_by_user'),
        Select('ref', Get(Match(Index('users_by_name'), 'matheus')))
      )
    )
  ).catch(err => res.send(err));
  res.send(docs);
})

app.post('/tweet', async (req, res) => {
  const data = {
    userId: Select('ref', Get(Match(Index('users_by_name'), 'matheus'))),
    text: 'hello'
  }

  const doc = await fnDBClient.query(
    Create(
      Collection('tweets'),
      { data }
    )
  ).catch(err => res.send(err));
  res.send(doc);
})

app.post('/follow', async (req, res) => {
  const data = {
    follower: Select('ref', Get(Match(Index('users_by_name'), 'bob'))),
    followee: Select('ref', Get(Match(Index('users_by_name'), 'matheus')))
  }

  const doc = await fnDBClient.query(
    Create(
      Collection('relationships'),
      { data }
    )
  ).catch(err => res.send(err))

  res.send(doc);
})

app.get('/feed', async (req, res) => {

  const docs = await fnDBClient.query(
    Paginate(
      Join(
        Match(Index('feed'), Select('ref', Get(Match(Index('users_by_name'), 'bob')))),
        Index('tweets_by_user'),
      )
    )
  ).catch(err => res.send(err));

  res.send(docs);
})

app.listen(5000, () => console.log('API on 5000'));
