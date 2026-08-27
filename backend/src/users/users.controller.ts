import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';

import { UsersService } from './users.service';

import { CreateUserDto } from './dto/create-user.dto';

import { UpdateUserDto } from './dto/update-user.dto';



@Controller('users')
export class UsersController {


constructor(
    private readonly usersService: UsersService
){}



@Post()
create(
    @Body() createUserDto:CreateUserDto
){

    return this.usersService.create(createUserDto);

}



@Get()
findAll(){

    return this.usersService.findAll();

}

@Get('joins/inner')
innerJoin(){

    return this.usersService.innerJoinUsersOrganizations();

}


@Get('joins/left')
leftJoin(){

    return this.usersService.leftJoinUsersOrganizations();

}


@Get('joins/right')
rightJoin(){

    return this.usersService.rightJoinUsersOrganizations();

}


@Get('joins/full')
fullJoin(){

    return this.usersService.fullJoinUsersOrganizations();

}

@Get(':id')
findOne(
    @Param('id') id:string
){

    return this.usersService.findOne(+id);

}


@Put(':id')
update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
){
    console.log("CONTROLLER BODY:", updateUserDto);

    return this.usersService.update(
        Number(id),
        updateUserDto
    );
}



@Delete(':id')
remove(
    @Param('id') id:string
){

    return this.usersService.remove(+id);

}


}