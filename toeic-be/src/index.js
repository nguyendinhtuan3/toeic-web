const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const db = require('./db');

console.log('Bắt đầu chạy index.js...');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Định nghĩa schema GraphQL
const typeDefs = `
    type User {
        id: ID!
        username: String!
        email: String!
        full_name: String
        role: String!
    }
    type Course {
        id: ID!
        title: String!
        description: String
        instructor_id: ID
    }
    type Leaderboard {
        id: ID!
        user_id: ID!
        course_id: ID
        score: Int!
        rank: Int
        username: String!
        full_name: String
        course_title: String
    }
    type Query {
        users: [User!]!
        courses: [Course!]!
        leaderboard: [Leaderboard!]!
    }
`;

// Định nghĩa resolvers
const resolvers = {
    Query: {
        users: async () => {
            return new Promise((resolve, reject) => {
                db.query('SELECT id, username, email, full_name, role FROM users', (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });
        },
        courses: async () => {
            return new Promise((resolve, reject) => {
                db.query('SELECT id, title, description, instructor_id FROM courses', (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });
        },
        leaderboard: async () => {
            return new Promise((resolve, reject) => {
                const query = `
                    SELECT l.id, l.score, l.rank, l.user_id, l.course_id, 
                           u.username, u.full_name, c.title AS course_title
                    FROM leaderboard l
                    JOIN users u ON l.user_id = u.id
                    LEFT JOIN courses c ON l.course_id = c.id
                    ORDER BY l.rank ASC
                `;
                db.query(query, (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });
        }
    }
};

// Tạo Apollo Server
async function startServer() {
    const server = new ApolloServer({ typeDefs, resolvers });
    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });

    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Server chạy trên cổng ${PORT}`);
        console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
    });
}

startServer().catch((error) => {
    console.error('Lỗi khởi động server:', error.message);
});