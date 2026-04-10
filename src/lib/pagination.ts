const DEFAULT_LIMIT = 30
const MAX_LIMIT = 100

export type ParsedPagination = {
  skip: number
  take: number
  page: number
  limit: number
}

/**
 * Offset pagination from `page` (1-based) and `limit` query params.
 */
export function parseOffsetPagination(
  searchParams: URLSearchParams,
  options?: { defaultLimit?: number; maxLimit?: number }
): ParsedPagination {
  const defaultLimit = options?.defaultLimit ?? DEFAULT_LIMIT
  const maxLimit = options?.maxLimit ?? MAX_LIMIT

  const pageRaw = searchParams.get('page')
  const limitRaw = searchParams.get('limit')

  const page = Math.max(1, parseInt(pageRaw || '1', 10) || 1)
  let limit = parseInt(limitRaw || String(defaultLimit), 10) || defaultLimit
  if (!Number.isFinite(limit) || limit < 1) limit = defaultLimit
  limit = Math.min(limit, maxLimit)

  const skip = (page - 1) * limit
  return { skip, take: limit, page, limit }
}
