import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.headers) {
      req.headers['Access-Control-Allow-Origin'] = '*';
      (req.headers['Access-Control-Allow-Methods'] =
        'GET,PUT,PATCH,POST,DELETE'),
        (req.headers['Access-Control-Allow-Headers'] =
          'Origin, X-Requested-With, Content-Type, Accept');
      console.log(req.headers);
    }
    next();
  }
}
