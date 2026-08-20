import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DonationsModule } from './donations/donations.module';
import { InventoryModule } from './inventory/inventory.module';
import { MedicineModule } from './medicine/medicine.module';

import { OrganizationsModule } from './organizations/organizations.module';
import { DatabaseModule } from './database/database.module';
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DatabaseModule,
        

        TypeOrmModule.forRoot({
            type: 'mysql',
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            autoLoadEntities: true,
            synchronize: true,
        }),

        DonationsModule,
        InventoryModule,
        MedicineModule,
        OrganizationsModule,
    ],

    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}