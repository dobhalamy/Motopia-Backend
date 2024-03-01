const dbUser = process.env.MONGO_USER;
const dbPass = process.env.MONGO_PASS;

module.exports = {
  port: process.env.PORT || 5000,
  dbUrl: `mongodb+srv://${dbUser}:${dbPass}@db-jonqt.mongodb.net/db`,
};
