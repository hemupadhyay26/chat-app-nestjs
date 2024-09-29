import { registerAs } from "@nestjs/config";
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from "typeorm";

dotenvConfig({ path: '.env' });

const config = {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 3306,
    username: process.env.DB_USER,
    password: process.env.DB_USER_PASSWORD,
    database: process.env.DB_NAME,
    entities: ["**/*.entity.js"],
    migrations: ["dist/migrations/*{.ts,.js}"],
    synchronize: true,
}

export default registerAs('typeorm', () => config)
export const connectionSource = new DataSource(config as DataSourceOptions);

