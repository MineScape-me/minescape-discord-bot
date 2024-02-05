import dotenv from "dotenv";

dotenv.config();

const { token, clientId, guildId, mysqlHost, mysqlPort, mysqlDatabase, mysqlUsername, mysqlPassword } = process.env;

if (!token || !clientId || !guildId || !mysqlHost || !mysqlPort || !mysqlDatabase || !mysqlUsername || !mysqlPassword) {
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
};