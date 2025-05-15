import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

const pgp = pgPromise();
const isProduction = process.env.NODE_ENV === 'production';

const db = pgp(
    isProduction
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
        }
        : {
            connectionString: process.env.DATABASE_URL,
        }
);

export default db;
