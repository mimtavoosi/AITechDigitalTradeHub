export type ApiResponse<TData> = {
  succeeded: boolean;
  data?: TData;
  message?: string;
  errors?: Record<string, string[]>;
};

export type ApiErrorResponse = {
  succeeded: false;
  message: string;
  errors?: Record<string, string[]>;
};

export type PagedResult<TItem> = {
  items: TItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type DotNetResult = {
  status: boolean;
  errorMessage?: string;
  id?: number;
};

export type DotNetRowResult<TData> = DotNetResult & {
  result: TData | null;
};

export type DotNetListResult<TItem> = DotNetResult & {
  totalCount: number;
  pageCount: number;
  results: TItem[];
};
