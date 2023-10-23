export interface IInvoice {
  id: number
  projectID: number
  teamID: number
  warehouseManagerWorkerID: number
  releasedWorkerID: number
  driverWorkerID: number
  recipientWorkerID: number
  operatorAddWorkerID: number
  operatorEditWorkerID: number
  objectID: number
  invoiceType: string
  deliveryCode: string
  district: string
  carNumber: string
  notes: string
  dateOfInvoice: string
  dateOfAddition: string
  dateOfEdit: string
}