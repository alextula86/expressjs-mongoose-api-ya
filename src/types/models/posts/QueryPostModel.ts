import { SortDirection } from '../../enums'

export type QueryPostModel = {
  searchNameTerm: string
  pageNumber: string
  pageSize: string
  sortBy: string
  sortDirection: SortDirection
}
