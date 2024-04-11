export interface IInvoiceObject {
	id: number
	deliveryCode: string 
	projectID: number
	supervisorWorkerID: number
	objectID: number
	teamID: number
}

export interface IInvoiceObjectMaterials {
  materialID: number
  materialName: string
  unit: string
  amount: number
  notes: string
}
