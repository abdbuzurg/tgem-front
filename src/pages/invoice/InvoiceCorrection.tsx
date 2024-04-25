import { useQuery } from "@tanstack/react-query"
import { InvoiceObjectPaginatedView } from "../../services/api/invoiceObject"
import { getAllInvoiceObjectsForCorrect } from "../../services/api/invoiceCorrection"
import { useEffect, useState } from "react"
import LoadingDots from "../../components/UI/loadingDots"
import Button from "../../components/UI/button"
import CorrectionModal from "../../components/invoice/correction/CorrectionModal"

export default function InvoiceCorrection() {

  const [tableData, setTableData] = useState<InvoiceObjectPaginatedView[]>([])
  const tableDataQuery = useQuery<InvoiceObjectPaginatedView[], Error, InvoiceObjectPaginatedView[]>({
    queryKey: ["invoice-correction-all"],
    queryFn: getAllInvoiceObjectsForCorrect,
  })
  useEffect(() => {
    if (tableDataQuery.isSuccess && tableDataQuery.data) {
      setTableData(tableDataQuery.data)
    }
  }, [tableDataQuery.data])

  const [showCorrectionModal, setShowCorrectionModal] = useState(false)
  const [modalData, setModalData] = useState<InvoiceObjectPaginatedView>()
  const toggleModal = (val: InvoiceObjectPaginatedView) => {
    setModalData(val)
    setShowCorrectionModal(true)
  }

  return (
    <main>
      <div className="mt-2 px-2 flex justify-between">
        <span className="font-bold text-3xl">Корректировка поступления</span>  
      </div>  
      <table className="table-auto text-sm text-left mt-2 w-full border-box">
        <thead className="shadow-md border-t-2">
          <tr>
            <th className="px-4 py-3 w-[100px]">
              <span>Код</span>
            </th>
            <th className="px-4 py-3">
              <span>Супервайзер</span>
            </th>
            <th className="px-4 py-3">
              <span>Объект</span>
            </th>
            <th className="px-4 py-3 w-[150px]">
              <span>Бригада</span>
            </th>
            <th className="px-4 py-3 w-[150px]">
              <span>Дата</span>
            </th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {tableDataQuery.isLoading &&
            <tr>
              <td colSpan={6}>
                <LoadingDots />
              </td>
            </tr>
          }
          {tableDataQuery.isError &&
            <tr>
              <td colSpan={6} className="text-red font-bold text-center">
                {tableDataQuery.error.message}
              </td>
            </tr>
          }
          {tableDataQuery.isSuccess &&
            tableData.map((row, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-3">{row.deliveryCode}</td>
                <td className="px-4 py-3">{row.supervisorName}</td>
                <td className="px-4 py-3">{row.objectName}</td>
                <td className="px-4 py-3">{row.teamNumber}</td>
                <td className="px-4 py-3">{row.dateOfInvoice.toString().substring(0, 10)}</td>
                <td className="px-4 py-3 border-box flex space-x-3">
                  <Button onClick={() => toggleModal(row)} text="Корректировать"/>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
      {showCorrectionModal && 
        <CorrectionModal 
          setShowModal={setShowCorrectionModal}
          invoiceObject={modalData!}
        />
       }
    </main>
  )
}
