const { createClient } = require("mongodb")

const uri = process.env.MONGODB_URI || process.env.MONGO_URI

if (!uri) {
  throw new Error('Missing MongoDB URI. Set MONGODB_URI environment variable.')
}

const client = createClient(uri)

async function connect() {
  if (!client) throw new Error('MongoDB client not initialized')
  await client.connect()
  return client
}

module.exports = {
  client,
  connect
}
