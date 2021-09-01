
import { gql, GraphQLClient } from 'graphql-request'
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(__dirname, "../.env") })

const client = new GraphQLClient(process.env.fauna_endpoint ?? '', {
    headers: {
      authorization: 'Bearer ' + process.env.fauna_secret,
    },
  })


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

const unwrap = (obj: any) => Object.values(obj)?.[0];