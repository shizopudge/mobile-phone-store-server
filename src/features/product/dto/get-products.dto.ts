export class GetProductsDto {
    page: string = '1'

    limit: string = '5'

    query: string = ''

    sort: string = 'desc'

    newArrival: string = 'false'

    withDiscount: string = 'false'

    minPrice: string = '0'

    maxPrice: string = Number.MAX_VALUE.toString()
}