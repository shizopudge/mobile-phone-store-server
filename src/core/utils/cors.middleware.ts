import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { Response as ExpressResponse } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: ExpressResponse, next: NextFunction) {
    res['Access-Control-Allow-Origin'] = '*';
    res['Access-Control-Allow-Headers'] =
      'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token';
    res['Access-Control-Allow-Credentials'] = true;
    res['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    console.log(res);
    next();
  }
}
