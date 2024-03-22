export interface IInvoiceInput {
  id: number
  projectID: number
  warehouseManagerWorkerID: number
  releasedWorkerID: number
  operatorAddWorkerID: number
  operatorEditWorkerID: number
  deliveryCode: string
  notes: string
  dateOfInvoice: Date
  dateOfAdd: Date
  dateOfEdit: Date
  confirmation: boolean,
}

export interface IInvoiceInputView extends Omit<IInvoiceInput, "warehouseManagerWorkerID" | "releasedWorkerID" | "operatorAddWorkerID" | "operatorEditWorkerID"> {
  warehouseManagerName: string
  releasedName: string
  operatorAddName: string
  operatorEditName: string
}

export interface IInvoiceInputMaterials {
  materialID: number
  materialName: string
  unit: string
  amount: number
  materialCostID: number
  materialCost: number
  notes: string
  hasSerialNumber: boolean
  serialNumbers: string[]
}