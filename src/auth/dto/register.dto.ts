import { IsEmail, IsString, MinLength } from "class-validator";

export class registerDto{

    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @MinLength(6)
    password: string;

}