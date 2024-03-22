export interface IInvoiceOutput {
  id: number
  projectID: number
  warehouseManagerWorkerID: number
  releasedWorkerID: number
  operatorAddWorkerID: number
  operatorEditWorkerID: number
  districtID: number
  teamID: number
  objectID: number
  recipientWorkerID: number
  deliveryCode: string
  notes: string
  dateOfInvoice: Date
  dateOfAdd: Date
  dateOfEdit: Date
  confirmation: boolean
}

export interface IInvoiceOutputMaterials {
  materialID: number
  materialName: string
  unit: string
  warehouseAmount: number
  amount: number
  notes: string
  hasSerialNumber: boolean
  serialNumbers: string[]
}

export interface IInvoiceOutputView extends Omit<IInvoiceOutput, 
  "warehouseManagerWorkerID" | 
  "releasedWorkerID" | 
  "operatorAddWorkerID" | 
  "operatorEditWorkerID" |
  "projectID" |
  "districtID" |
  "teamID" |
  "objectID" |
  "recipientWorkerID"
> {
  warehouseManagerName: string
  releasedName: string
  operatorAddName: string
  operatorEditName: string
  projectName: string
  districtName: string
  teamName: string
  objectName: string
  recipientWorkerName: string
}