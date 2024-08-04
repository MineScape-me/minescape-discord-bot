import dotenv from "dotenv";

dotenv.config();
const { token, clientId, guildId, mysqlHost, mysqlPort, mysqlDatabase, mysqlUsername, mysqlPassword, redisHost, redisPort, redisPassword } = process.env;

if (!token || !clientId || !guildId || !mysqlHost || !mysqlPort || !mysqlDatabase || !mysqlUsername || !mysqlPassword || !redisHost || !redisPort || !redisPassword) {
  throw new Error("Missing environment variables");
}

export const config = {
    token,
    clientId,
    guildId,
    mysqlHost,
    mysqlPort,
    mysqlDatabase,
    mysqlUsername,
    mysqlPassword,
    redisHost,
    redisPort,
    redisPassword,
};