import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces/jwt.payload';
import { AuthService } from '../auth.service';
import { error } from 'console';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private jwt: JwtService,
    private authService: AuthService){}

  async canActivate(context: ExecutionContext,): Promise<boolean>{
    
    const request = context.switchToHttp().getRequest();
    
    const token = this.extractTokenFromHeader(request);

    if( !token ) throw new UnauthorizedException(`Token requerido.`)

    try{

      const payload = await this.jwt.verifyAsync<JwtPayload>(
        token, { secret: process.env.JWT_SEED }
      ) 

      const user = await this.authService.findUserById( payload.id );

      if( !user  ) throw new UnauthorizedException('User no encontrado') 
      if( !user.isActive  ) throw new UnauthorizedException('User no activo') 

      request['user'] = user;

    } catch (error) {
      console.log(error);
      throw new UnauthorizedException()
    }
    
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

}

