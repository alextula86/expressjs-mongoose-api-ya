import { SortDirection } from '../../enums'

export type QueryUserModel = {
  /**
    * @query {String} searchLoginTerm
    * @summary Search term for user Login: Login should contains this term in any position
    *
    * @query {String} searchEmailTerm
    * @summary Search term for user Email: Email should contains this term in any position
    *
    * @query {String} pageNumber
    * @summary Number of portions that should be returned
    *
    * @query {String} pageSize
    * @summary Portions size that should be returned
    *
    * @query {String} sortBy
    * @summary Field by which the sorting takes place. Default value : createdAt
    *
    * @query {SortDirection} sortDirection
    * @summary Available values: asc, desc. Default value: desc  
  */    

  searchLoginTerm: string
  searchEmailTerm: string
  pageNumber: string
  pageSize: string
  sortBy: string
  sortDirection: SortDirection
}
