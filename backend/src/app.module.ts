import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { DonationsModule } from './donations/donations.module';
import { InventoryModule } from './inventory/inventory.module';
import { MedicineRequestModule } from './medicine-request/medicine-request.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ReportsModule } from './reports/reports.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const useSqlLogin = String(
          configService.get<string>('DB_USE_SQL_LOGIN', 'false'),
        )
          .trim()
          .toLowerCase() === 'true';

        const dbUser = configService.get<string>('DB_USERNAME');
        const dbPassword = configService.get<string>('DB_PASSWORD');

        return {
          type: 'mssql',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: Number(configService.get<string>('DB_PORT', '1433')),
          database: configService.get<string>('DB_DATABASE', 'MediShareDB'),
          ...(useSqlLogin && dbUser && dbPassword
            ? { username: dbUser, password: dbPassword }
            : {}),
          autoLoadEntities: true,
          synchronize: false,
          options: {
            encrypt: false,
            trustServerCertificate: true,
            enableArithAbort: true,
            trustedConnection: !useSqlLogin,
          },
          driver: require('mssql/msnodesqlv8'),
        };
      },
    }),
    DatabaseModule,
    DonationsModule,
    InventoryModule,
    MedicineRequestModule,
    OrganizationsModule,
    UsersModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
