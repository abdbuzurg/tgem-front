export interface InvoiceOutputOutOfProject {
  id: number
  fromProjectID: number
  toProjectID: number
  deliveryCode: string
  releasedWorkerID: number
  dateOfInvoice: Date
  confirmation: boolean
  notes: string
}
