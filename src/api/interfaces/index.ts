
export interface GetAllQuery {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    filters?: Record<string, any>;
}

export interface PaginatedResult {
    data: any[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
}