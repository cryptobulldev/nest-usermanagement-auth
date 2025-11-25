// typeorm.config.ts
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

const dataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  entities: ["dist/src/domain/**/*.entity.js", "src/domain/**/*.entity.ts"],
  migrations: ["dist/src/database/migrations/*.js"],

  synchronize: false,
  logging: false,
});

export default dataSource;
