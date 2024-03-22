export interface IInvoiceReturn {
  id: number
  projectID: number
  operatorAddWorkerID: number
  operatorEditWorkerID: number
  returnerID: number
  districtID: number
  returnerType: "objects" | "teams"
  deliveryCode: string
  notes: string
  dateOfInvoice: Date
  dateOfAdd: Date
  dateOfEdit: Date
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

export interface IInvoiceReturnView extends Omit<IInvoiceReturn,
  "operatorAddWorkerID" |
  "operatorEditWorkerID" |
  "returnerID" |
  "returnerType" |
  "districtID"
> {
  districtName: string
  operatorAddName: string
  operatorEditName: string
  returnerName: string
  returnerType: string
}
