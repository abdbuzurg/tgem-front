import { useQuery, useQueryClient } from "@tanstack/react-query"
import { InvoiceObjectUnconfirmed, confirmationByObject, getUncormedInvoiceObjects } from "../../services/api/invoiceOutput"
import getInvoiceMaterialsByInvoice, { InvoiceMaterialView } from "../../services/api/invoice_materials"
import { useState } from "react"
import Button from "../../components/UI/button"
import Modal from "../../components/Modal"

export default function InvoiceObject() {
  
  const queryClient = useQueryClient()
  const invoiceObjectsQuery = useQuery<InvoiceObjectUnconfirmed[], Error>({
    queryKey: ["invoice-object"],
    queryFn: getUncormedInvoiceObjects,
  })

  const confirm = (id: number) => {
    confirmationByObject(id).finally(() => {
      queryClient.invalidateQueries(["invoice-object"])
    })
  }

  //DETAIL MODAL DATA
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [detailModalData, setDetailModalData] = useState<InvoiceObjectUnconfirmed>({
    id: 0,
    objectName: "",
    teamLeaderName: "",
    teamNumber: "",
  })

  const showDetails = (value: InvoiceObjectUnconfirmed) => {
    setDetailModalData(value)
    setShowDetailsModal(true)
  }

  const invoiceInputDetailsMaterialsQuery = useQuery<InvoiceMaterialView[], Error>({
    queryKey: ["invoice-materials", "output", detailModalData.id],
    queryFn: () => getInvoiceMaterialsByInvoice("output", detailModalData.id)
  })

  return (
    <main>
      <div className="mt-2 pl-2 flex space-x-2">
        <span className="text-3xl font-bold">Поступление на объект</span>
        {/* <Button text="Экспорт" onClick={() => {}}/> */}
      </div>
      <table className="table-auto text-sm text-left mt-2 w-full border-box">
        <thead className="shadow-md border-t-2">
          <tr>
            <th className="px-4 py-3">
              <span>Номер бригады</span>
            </th>
            <th className="px-4 py-3">
              <span>Бригадир</span>
            </th>
            <th className="px-4 py-3">
              <span>Объект</span>
            </th>
            <th className="px-4 py-3">
            </th>
          </tr>
        </thead>
        <tbody>
          {invoiceObjectsQuery.isSuccess && invoiceObjectsQuery.data.map((value, index) => 
           <tr key={index}>
              <td className="px-4 py-3">{value.teamNumber}</td>
              <td className="px-4 py-3">{value.teamLeaderName}</td>
              <td className="px-4 py-3">{value.objectName}</td>
              <td className="px-4 py-3 border-box flex space-x-3">
                <Button text="Подробнее" onClick={() => showDetails(value)}/>
                <Button text="Подтвердить приход" onClick={() => confirm(value.id)}/>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {showDetailsModal && 
        <Modal bigModal setShowModal={setShowDetailsModal}>
          <div className="mb-2">
            <h3 className="text-2xl font-medium text-gray-800">Детали поступления</h3>
          </div>
          <div className="flex w-full space-x-8 max-h-[60vh] ">
            <div className="flex flex-col w-[25%]">
              <div className="flex flex-col space-y-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-lg font-semibold">Номер Бригады</p>
                  <p className="text-sm">{detailModalData.teamNumber}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-lg font-semibold">Бригадир</p>
                  <p className="text-sm">{detailModalData.teamLeaderName}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-lg font-semibold">Объект</p>
                  <p className="text-sm">{detailModalData.objectName}</p>
                </div>
              </div>
            </div>
            <div className="overflow-y-scroll w-[75%] px-2">
              <div className="flex space-x-2 items-center justify-between">
                <p className="text-xl font-semibold text-gray-800">Материалы наклданой</p>
              </div>  
              <table className="table-auto text-sm text-left mt-2 w-full border-box">
                <thead className="shadow-md border-t-2">
                  <tr>
                    <th className="px-4 py-3">
                      <span>Наименование</span>
                    </th>
                    <th className="px-4 py-3">
                      <span>Ед.Изм.</span>
                    </th>
                    <th className="px-4 py-3">
                      <span>Количество</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceInputDetailsMaterialsQuery.isSuccess && invoiceInputDetailsMaterialsQuery.data.map((value, index) => 
                    <tr key={index}>
                      <td className="px-4 py-3">{value.materialName}</td>
                      <td className="px-4 py-3">{value.unit}</td>
                      <td className="px-4 py-3">{value.amount}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      }
    </main>
  )
}