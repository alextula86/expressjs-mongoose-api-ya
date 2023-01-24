import { SortDirection } from '../../enums'

export type QueryCommentModel = {
  pageNumber: string
  pageSize: string
  sortBy: string
  sortDirection: SortDirection
}
