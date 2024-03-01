const startServer = require("./app/server");
const connectDb = require("./connect-db");
const { port, dbUrl } = require("./server-config");

startServer(port);
connectDb(dbUrl);
