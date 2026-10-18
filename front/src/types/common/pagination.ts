export type Pagination = {
   totalCount: number
   page: number
   pageSize: number
}

export type NormalizedPagination = {
   page: number
   pageSize: number
   totalCount: number
}

export type ResourceResult<T> = {
   items: T[]
   pagination: NormalizedPagination
}

export type PaginationRequest = {
   page: number
   pageSize?: number
}

export type Meta = Pagination

export type ApiSuccessResponse<T, S = never> = {
   success: true
   message?: string
   data: T
   meta?: Meta
   stats?: S
}

export type ApiResponse<T, S = never> = ApiSuccessResponse<T, S>
