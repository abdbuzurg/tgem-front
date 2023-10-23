import { useEffect, useState } from "react";
import { IInvoice } from "../../services/interfaces/invoice";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import getByInvoiceID from "../../services/api/invoice/getByID";
import getWorkerByJobTitle from "../../services/api/worker/getWorkerByJobTitle";
import IWorker from "../../services/interfaces/worker";

export default function InvoiceCreateAndEdit() {
  const url = useLocation().pathname.split("/")
  const isEdit = url.pop()! == "edit"
  const invoiceType = url.pop()!

  const [invoiceData, setInvoiceData] = useState<IInvoice>({
    id: 0,
    projectID: 0,
    teamID: 0,
    warehouseManagerWorkerID: 0,
    releasedWorkerID: 0,
    driverWorkerID: 0,
    recipientWorkerID: 0,
    operatorAddWorkerID: 0,
    operatorEditWorkerID: 0,
    objectID: 0,
    invoiceType: invoiceType,
    deliveryCode: "",
    district: "",
    carNumber: "",
    notes: "",
    dateOfInvoice: "",
    dateOfAddition: "",
    dateOfEdit: "",
  })

  const editDataQuery = useQuery<IInvoice, Error>({
    queryKey: [`invoice-${invoiceData.invoiceType}-${invoiceData.id}`],
    queryFn: () => getByInvoiceID(invoiceData.invoiceType, invoiceData.id),
    enabled: false,
  })

  useEffect(() => {
    if (isEdit) editDataQuery.refetch()
  }, [])

  useEffect(() => {
    if (editDataQuery.isSuccess) {
      setInvoiceData(editDataQuery.data)
    }
  }, [editDataQuery.data])

  const warehouseWorkersQuery = useQuery<IWorker[], Error>({
    queryKey: [`worker-warehouse`],
    queryFn: () => getWorkerByJobTitle("Заведующий Складом")
  })

  

}