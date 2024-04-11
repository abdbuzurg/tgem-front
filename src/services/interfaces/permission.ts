export interface Permission {
  id: number
  roleID: number
  resourceName: string
  resourceURL: string
  r: boolean
  w: boolean
  u: boolean
  d: boolean
}
