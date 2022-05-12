import dotenv from "dotenv";
import { Container } from "typedi";
import { User } from "../src/models/User";
import { UserService } from "../src/services/UserService";
import { LoggerService } from "../src/services/LoggerService";
import { getConnectionOptions, createConnection, useContainer } from "typeorm";
import { PrivateInformation } from "../src/models/PrivateInformation";

const logger = Container.get(LoggerService);

useContainer(Container);
dotenv.config();

const testUsers = [
    {
        "userName": "user",
        "password": "user123@",
        "email": "user@user.com",
        "fullName": "User"
    },
    {
        "userName": "admin",
        "password": "admin123@",
        "email": "admin@admin.com",
        "fullName": "Administrator"
    }
];


/**
 * Add test users to the database
 */
async function seedDB(): Promise<void> {
    for (const u of testUsers) {
        const user = new User();
        user.userName = u.userName;
        user.password = u.password;
        user.confirmed = true;
        user.confirmToken = null;
        user.private = new PrivateInformation();
        user.private.email = u.email;
        user.private.fullName = u.fullName;

        try {
            await Container.get(UserService).create(user);
            logger.info("Added new user to db!");
        } catch(e) {
            if (e.name === "QueryFailedError" && e.detail.includes("already exists")) {
                logger.info("User already exists in the db!");
            } else {
                logger.error("Error occurred!");
                logger.error(e);
            }
        }
    }
}

/**
 * Setup typeORM connection with the database (postgres)
 */
async function setupTypeORM(): Promise<void> {
    const loadedConnectionOptions = await getConnectionOptions();

    const connectionOptions = Object.assign(loadedConnectionOptions, {
        type: process.env.TYPEORM_CONNECTION, // See createConnection options for valid types
        host: process.env.TYPEORM_HOST,
        port: process.env.TYPEORM_PORT,
        username: process.env.TYPEORM_USERNAME,
        password: process.env.TYPEORM_PASSWORD,
        database: process.env.TYPEORM_DATABASE,
        synchronize: process.env.TYPEORM_SYNCHRONIZE,
        logging: process.env.TYPEORM_LOGGING,
        entities: [__dirname + "/../src/models/*.ts"],
    });

    await createConnection(connectionOptions);
}

setupTypeORM().then(() => {
    logger.info("Connected to db!");

    seedDB().then(() => {
        logger.info("Done seeding the db!");
    });

}).catch((e) => {
    logger.error("Db connection failed with error: " + e);
});