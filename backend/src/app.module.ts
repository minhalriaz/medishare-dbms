import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DonationsModule } from './donations/donations.module';
import { InventoryModule } from './inventory/inventory.module';

import { OrganizationsModule } from './organizations/organizations.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { MedicineRequestModule } from './medicine-request/medicine-request.module';
import { RequestItemModule } from './request-item/request-item.module';
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),

       TypeOrmModule.forRoot({
    type: 'mysql',

    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),

    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,

    database: process.env.DB_DATABASE,

    autoLoadEntities: true,
    synchronize: false,

    charset: 'utf8mb4',
}),
        DatabaseModule,
        DonationsModule,
        InventoryModule,
        OrganizationsModule,
        UsersModule,
        ReportsModule,
        MedicineRequestModule,
        RequestItemModule
    ],

    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
