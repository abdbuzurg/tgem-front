import { useParams } from "react-router-dom"
import { InvoiceObjectFullData, getFullDataByID } from "../../services/api/invoiceObject"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

export default function InvoiceObjectDetails() {
  
  const { id } = useParams()
  const [displayData, setDisplayData] = useState<InvoiceObjectFullData>()
  const fullDataQuery = useQuery<InvoiceObjectFullData, Error, InvoiceObjectFullData>({
    queryKey: [`invoice-object-${id}`],
    queryFn: () => getFullDataByID(parseInt(id ?? ""))
  })
  useEffect(() => {
    if (fullDataQuery.isSuccess && fullDataQuery.data) {
      setDisplayData(fullDataQuery.data)
    }
  }, [fullDataQuery.data])
  

  return (
    <main>
      <div className="my-1 px-2 flex flex-col space-y-2 items-start ">
        <span className="text-2xl font-bold">Детальная информация посутпления</span>
      </div>
      <div className="mt-1 px-3">
        <div className="bg-gray-800 text-white rounded-md px-3 py-2">
          <span className="text-xl">Основная информация поступления</span>
          <div className="my-2 grid grid-cols-2 gap-2">
            <div className="font-bold">Код поступления</div> 
            <div>{displayData?.details.deliveryCode}</div>
            <div className="font-bold">Супервайзер</div>
            <div>{displayData?.details.supervisorName}</div>
            <div className="font-bold">Объект</div>
            <div>{displayData?.details.objectName}</div>
            <div className="font-bold">Бригада</div>
            <div>{displayData?.details.teamNumber}</div>
            <div className="font-bold">Дата поступления</div>
            <div>{displayData?.details.dateOfInvoice.toString().substring(0, 10)}</div>
          </div>
        </div>
      </div>
      <div className="mt-1 px-3">
        <div className="bg-gray-800 text-white rounded-md px-3 py-2">
          <span className="text-xl">Поступившие метиралы</span>
          <div className="flex flex-col space-y-2">
            {displayData?.items.map((val) => 
            <div className="my-2 grid grid-cols-2 border border-white px-2 py-1" key={val.id}>
              <div className="font-bold">Наименование</div>
              <div>{val.materialName}</div>
              <div className="font-bold">Количество</div>
              <div>{val.amount}</div>
              <div className="font-bold">Примечание</div>
              <div>{val.notes}</div>
            </div>
            )}
          </div>
          
        </div>
      </div>
    </main>
  )
}
