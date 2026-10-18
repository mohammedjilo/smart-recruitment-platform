import { AppError } from "./appError";

export const MAX_PAGE_SIZE = 50;
export const DEFAULT_PAGE_SIZE = 20;

type QueryValue = string | number | string[] | undefined;

type PaginationQuery = {
  page?: QueryValue;
  pageNumber?: QueryValue;
  pageSize?: QueryValue;
};

const toPositiveInteger = (value: QueryValue, fallback: number) => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || raw === "") return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new AppError(
      "Pagination values must be positive integers",
      400,
      "INVALID_PAGINATION"
    );
  }
  return parsed;
};

export const parsePagination = (
  query: PaginationQuery = {},
  defaultPageSize = DEFAULT_PAGE_SIZE
) => {
  const page = toPositiveInteger(query.pageNumber ?? query.page, 1);
  const requestedPageSize = toPositiveInteger(query.pageSize, defaultPageSize);
  const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);
  return { page, pageSize, skip: (page - 1) * pageSize };
};

export const buildPaginationMeta = (
  page: number,
  pageSize: number,
  totalCount: number
) => ({
  page,
  pageSize,
  totalCount,
});
