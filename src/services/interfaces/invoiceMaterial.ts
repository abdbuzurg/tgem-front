export interface InvoiceMaterial {
  id: number
  materialCostID: number
  invoiceID: number
  invoiceType: "input" | "output" | "return" | "writeoff"
  amount: number
  notes: string
}

