import { Injectable, OnModuleDestroy } from '@nestjs/common';
import mysql, {
  Pool,
  PoolConnection,
} from 'mysql2/promise';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,

      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  async query(sql: string, params: any[] = []) {
    const [rows] = await this.pool.execute(sql, params);

    return rows;
  }

  // Used when multiple SQL queries must succeed together
  async getConnection(): Promise<PoolConnection> {
    return this.pool.getConnection();
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}