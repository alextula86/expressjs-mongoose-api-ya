import { SortDirection } from '../../enums'

export type QueryBlogModel = {
  searchNameTerm: string
  pageNumber: string
  pageSize: string
  sortBy: string
  sortDirection: SortDirection
}
