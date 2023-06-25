import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/utils/prisma.service';
import { ProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) {}

    async create(dto: ProductDto) {

    }
}
