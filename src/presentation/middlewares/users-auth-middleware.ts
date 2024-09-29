import { NextResponse, NextRequest } from 'next/server';
import { unauthorized } from '../helpers/http-helpers';
import { IAuthenticator } from '@/src/domain/authenticators/authenticator';

export class AuthMiddleware{
    private readonly authenticator: IAuthenticator;
  
    constructor(
      authenticator: IAuthenticator
    ) {
      this.authenticator = authenticator;
    }
    
    async exec(request: NextRequest): Promise<NextResponse | null> {
        const bearerToken = request.headers.get('Authorization');
        const token = bearerToken?.split(' ')[1]
    
        const unauthorizedResponse = unauthorized();

        if (!token) {
          return NextResponse.json(unauthorizedResponse, { status: unauthorizedResponse.statusCode });
        }

        try {
          const {isValid} = await this.authenticator.verifyToken<{email: string}>(token)

          if(!isValid){
            return NextResponse.json(unauthorizedResponse, { status: unauthorizedResponse.statusCode });
          }
            
        } catch (error) {
          return NextResponse.json(unauthorizedResponse, { status: unauthorizedResponse.statusCode });
        }

        return null;
      }
}
