import * as jwt from 'jsonwebtoken';
import * as config from 'config';

const jwtSecret = process.env.JWT_SECRET || config.get('JWT.SECRET');

export class BaseController {
  protected getUserIdFromToken(authorization: { split: (arg0: string) => any[]; }) {
    if (!authorization) {
        return null;
    }
    const token = authorization.split(' ')[1];
    const decoded: any = jwt.verify(token, jwtSecret);
    return decoded.id;
  }
}
