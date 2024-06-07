export interface IInvoiceReturn {
  id: number
  projectID: number
  returnerID: number
  districtID: number
  returnerType: "object" | "team"
  acceptorID: number
  acceptorType: "team" | "warehouse"
  acceptedByWorkerID: number
  deliveryCode: string
  notes: string
  dateOfInvoice: Date
  confirmation: boolean
}

export interface IInvoiceReturnMaterials {
  materialID: number
  materialCostID: number
  materialName: string
  unit: string
  holderAmount: number
  amount: number
  materialCost: string
  hasSerialNumber: boolean
  serialNumbers: string[]
  isDefective: boolean
  notes: string
}

export interface IInvoiceReturnView {
  id: number
  projectID: number
  deliveryCode: string
  teamNumber: string
  teamLeaderNames: string[]
  objectName: string
  objectSupervisorNames: string[]
  dateOfInvoice: Date
  confirmation: boolean
}
