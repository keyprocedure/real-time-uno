import pgPromise from 'pg-promise';
import dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const pgp = pgPromise({});
const db = pgp(process.env.DATABASE_URL as string);

export default db;
