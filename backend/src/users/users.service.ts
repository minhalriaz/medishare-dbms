import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly dataSource: DataSource) {}

  // CREATE USER
  async create(createUserDto: CreateUserDto) {
    const {
      full_name,
      email,
      phone,
      address,
      password_hash,
      user_type,
      account_status,
    } = createUserDto;

    const query = `
        INSERT INTO [user]
        (
            full_name,
            email,
            phone,
            address,
            password_hash,
            user_type,
            account_status
        )

        VALUES
        (
            @0,
            @1,
            @2,
            @3,
            @4,
            @5,
            @6
        );

        SELECT SCOPE_IDENTITY() AS user_id;
        `;

    const result = await this.dataSource.query(query, [
      full_name,
      email,
      phone,
      address,
      password_hash,
      user_type,
      account_status ?? 'Active',
    ]);

    return {
      message: 'User created successfully',
      user_id: result[0].user_id,
    };
  }

  // GET ALL USERS
  async findAll() {
    return await this.dataSource.query(`
        
        SELECT
            user_id,
            full_name,
            email,
            phone,
            address,
            user_type,
            account_status,
            created_at

        FROM [user]

        `);
  }

  // GET ONE USER
  async findOne(id: number) {
    return await this.dataSource.query(
      `

        SELECT *

        FROM [user]

        WHERE user_id=@0

        `,
      [id],
    );
  }

  // UPDATE USER
  async update(id: number, updateUserDto: UpdateUserDto) {
    const allowedFields: (keyof UpdateUserDto)[] = [
      'full_name',
      'email',
      'phone',
      'address',
      'password_hash',
      'user_type',
      'account_status',
    ];
    const fields = allowedFields.filter(
      (field) => updateUserDto[field] !== undefined,
    );

    if (fields.length === 0) {
      throw new BadRequestException(
        'At least one user field is required for an update.',
      );
    }

    const values = fields.map((field) => {
      const value = updateUserDto[field];
      return value === '' && (field === 'phone' || field === 'address')
        ? null
        : value;
    });
    const setClause = fields
      .map((field, index) => `${field}=@${index}`)
      .join(',\n        ');

    await this.dataSource.query(
      `
      UPDATE [user]
      SET
      ${setClause}
      WHERE user_id=@${values.length}
      `,
      [...values, id],
    );

    return {
      message: 'User updated successfully',
    };
  }

  // DELETE USER
  async remove(id: number) {
    await this.dataSource.query(
      `
            DELETE FROM [user]
            WHERE user_id = @0
            `,
      [id],
    );

    return {
      message: 'User deleted successfully',
    };
  }
  // INNER JOIN
async innerJoinUsersOrganizations(){

    return await this.dataSource.query(`

    SELECT

        u.user_id,
        u.full_name,
        u.email,

        o.organization_id,
        o.organization_name,
        o.organization_type

    FROM [user] u

    INNER JOIN organization o

    ON u.user_id = o.user_id

    `);

}
// LEFT JOIN
async leftJoinUsersOrganizations(){

    return await this.dataSource.query(`

    SELECT

        u.user_id,
        u.full_name,
        u.email,

        o.organization_name,
        o.organization_type

    FROM [user] u

    LEFT JOIN organization o

    ON u.user_id = o.user_id

    `);

}
// RIGHT JOIN
async rightJoinUsersOrganizations(){

    return await this.dataSource.query(`

    SELECT

        u.user_id,
        u.full_name,
        u.email,

        o.organization_id,
        o.organization_name,
        o.organization_type

    FROM [user] u

    RIGHT JOIN organization o

    ON u.user_id = o.user_id

    `);

}
// FULL JOIN
async fullJoinUsersOrganizations(){

    return await this.dataSource.query(`

    SELECT

        u.user_id,
        u.full_name,
        u.email,

        o.organization_id,
        o.organization_name,
        o.organization_type

    FROM [user] u

    FULL OUTER JOIN organization o

    ON u.user_id = o.user_id

    `);

}
}
