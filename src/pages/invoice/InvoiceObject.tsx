import { useNavigate } from "react-router-dom";
import Button from "../../components/UI/button";
import { INVOICE_OBJECT_MUTATION_ADD } from "../../URLs";
import { useInfiniteQuery } from "@tanstack/react-query";
import { InvoiceObjectPaginated, InvoiceObjectPaginatedView, getInvoiceObjectPaginated } from "../../services/api/invoiceObject";
import { ENTRY_LIMIT } from "../../services/api/constants";
import {  useEffect, useState } from "react";

export default function InvoiceObject() {
  const tableDataQuery = useInfiniteQuery<InvoiceObjectPaginated, Error>({
    queryKey: ["invoice-object"],
    queryFn: ({ pageParam }) => getInvoiceObjectPaginated({ pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page * ENTRY_LIMIT > lastPage.count) return undefined
      return lastPage.page + 1
    }
  })
  const [tableData, setTableData] = useState<InvoiceObjectPaginatedView[]>([])
  useEffect(() => {
    if (tableDataQuery.isSuccess && tableDataQuery.data) {
      const data: InvoiceObjectPaginatedView[] = tableDataQuery.data.pages.reduce<InvoiceObjectPaginatedView[]>((acc, page) => [...acc, ...page.data], [])
      setTableData(data)
    }
  }, [tableDataQuery.data])

  const loadDataOnScrollEnd = () => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight) return;
    tableDataQuery.fetchNextPage()
  }
  useEffect(() => {
    window.addEventListener("scroll", loadDataOnScrollEnd)
    return () => window.removeEventListener("scroll", loadDataOnScrollEnd)
  }, [])


  const navigate = useNavigate()

  return (
    <main>
      <div
        className="mt-2 px-2 flex flex-col space-y-2 items-start "
      >
        <span className="text-3xl font-bold">Поступление на объект</span>
        <Button
          text="Добавить"
          onClick={() => navigate(INVOICE_OBJECT_MUTATION_ADD)}
        />
        {/* <Button text="Экспорт" onClick={() => {}}/> */}
      </div>
      <div className="grid grid-cols-1 gap-2 px-3 mt-2">
        {tableDataQuery.isSuccess && tableData.map((value, index) =>
          <div key={index} className="grid grid-cols-2 gap-2 px-3 py-2 bg-gray-800 text-white rounded-md overflow-auto">
            <div className="font-bold">Код поступления</div>
            <div>{value.deliveryCode}</div>
            <div className="font-bold">Супервайзер</div>
            <div>{value.supervisorName}</div>
            <div className="font-bold">Объект</div>
            <div>{value.objectName}</div>
            <div className="font-bold">Бригада</div>
            <div>{value.teamNumber}</div>
            <div className="font-bold">Дата поступления</div>
            <div>{value.dateOfInvoice.toString().substring(0, 10)}</div>
            <div className="col-span-2 flex space-x-2">
              <Button
                text="Подробнее"
                onClick={() => navigate(`/invoice/object/${value.id}`)}
              />
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
