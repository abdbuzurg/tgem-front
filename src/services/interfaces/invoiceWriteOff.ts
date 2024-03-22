export interface IInvoiceWriteOff {
  id: number
  writeOffType: string
  dateOfInvoice: Date
  dateOfAdd: Date
  dateOfEdit: Date
  operatorAddWorkerID: number
  operatorEditWorkerID: number
  deliveryCode: string
}

export interface IInvoiceWriteOffMaterials {
  materialCostID: number
  materialName: string
  unit: string
  amount: number
  materialCost: string
}

export interface IInvoiceWriteOffView extends Omit<IInvoiceWriteOff, 
  "operatorAddWorkerID" |
  "operatorEditWorkerID"
> {
  operatorAddName: string
  operatorEditName: string
}