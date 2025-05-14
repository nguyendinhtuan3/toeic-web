const { gql } = require("apollo-server-express");
const { model } = require("mongoose");

const typeDefs = gql`
  type Badge {
    id: ID!
    name: String!
    description: String
    imageUrl: String
    points: Int!
  }

  # Queries
  type Query {
    getAllBadges: [Badge]
    getBadge(id: ID!): Badge
  }

  # Mutations
  type Mutation {
    createBadge(
      name: String!
      description: String
      imageUrl: String
      points: Int!
    ): Badge

    updateBadge(
      id: ID!
      name: String
      description: String
      imageUrl: String
      points: Int
    ): Badge

    deleteBadge(id: ID!): Boolean
  }
`;
module.exports = { typeDefs };
