import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel }   from '@nestjs/mongoose';
import { Model }         from 'mongoose';
import * as bcryptjs     from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { User }          from './entities/user-entity';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt.payload';
import { LoginResponse } from './interfaces/login-response';
import { registerDto } from './dto/register.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name) 
    private UserModel: Model<User>,
    private jwt: JwtService,

    ) {
    
  }

  async create(createUserDto: CreateUserDto): Promise<User> {

    try{
      const {password, ...userData} = createUserDto;
      
      const newUser = new this.UserModel({
          password: bcryptjs.hashSync( password, 10 ),
          ...userData
        })

      await newUser.save();
      const {password:_, ...user} = newUser.toJSON()

      console.log('registro terminado satifactoriamente')

      return user;
    }

    catch(error){
      if ( error.code == 11000 ){
        throw new BadRequestException( `${ createUserDto.email } ya existe.`)
      }
      throw new InternalServerErrorException(`Algo salió mal...`)
    }

  }

  findAll() {
    return this.UserModel.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async findUserById( id: string ) {
    const user = await this.UserModel.findById( id );
    const { password, ...rest } = user.toJSON();

    return rest
  }

  async register(registerDto: registerDto): Promise<LoginResponse>{

    try{
      const user = await this.create(registerDto)

      const token = bcryptjs.hashSync( user._id.toString(), 10 )
      return{
        user,
        token
      }

    }
    catch( e ){
      console.log(e)
    }

  }

  async login( loginDto: LoginDto ): Promise<LoginResponse> {
    console.log("entra");

    const { email, password } = loginDto;

    const user = await this.UserModel.findOne( { email } )


    if ( !user ){
      throw new UnauthorizedException(`No encontramos este usuario :(`)
    }

    if( !bcryptjs.compareSync( password, user.password ) ){
      throw new UnauthorizedException("Contraseña incorrecta")
    }
    
    const  { password: _ , ...rest  } = user.toJSON();

    return {
      user: rest,
      token: this.getJwt({ id: user.id })
    }
  }

  getJwt(payload: JwtPayload){
    const token = this.jwt.sign(payload);
    return token;
  }


  
}
