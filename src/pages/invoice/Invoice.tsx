import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import getInvoicePaginated, { InvoicePaginatedData, InvoicePaginatedDataResponse } from "../../services/api/invoice/getInvoicePaginated";
import { ENTRY_LIMIT } from "../../services/api/constants";
import LoadingDots from "../../components/UI/loadingDots";
import LinkBox from "../../components/UI/LinkButton";
import invoiceName from "../../services/lib/invoiceName";
import { INVOICE } from "../../URLs";

export default function Invoice() {
  const invoiceType = useLocation().pathname.split("/").pop()!

  const [invoiceData, setInvoiceData] = useState<InvoicePaginatedData[]>([])

  const invoiceDataQuery = useInfiniteQuery<InvoicePaginatedDataResponse, Error>({
    queryKey: [`invoice-${invoiceType}`],
    queryFn: ({pageParam}) => getInvoicePaginated(invoiceType, {pageParam}),
    getNextPageParam: (lastPage) => {
      if (lastPage.page * ENTRY_LIMIT > lastPage.count) return undefined
      return lastPage.page + 1
    }
  })

  useEffect(() => {
    if (invoiceDataQuery.isSuccess && invoiceDataQuery.data) {
      const data: InvoicePaginatedData[] = invoiceDataQuery.data.pages.reduce<InvoicePaginatedData[]>((acc, page) => [...acc, ...page.data], [])
      setInvoiceData(data)
    }
  }, [invoiceDataQuery.data])

  const loadDataOnScrollEnd = () => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight) return;
    invoiceDataQuery.fetchNextPage()
  }
  useEffect(() => {
    window.addEventListener("scroll", loadDataOnScrollEnd)
    return () => window.removeEventListener("scroll", loadDataOnScrollEnd)
  }, [])


  return (
    <main>
      <div className="mt-2 pl-2 flex space-x-2">
        <span className="text-3xl font-bold">Накладные {invoiceName(invoiceType)}</span>
      </div>
      <table className="table-auto text-sm text-left mt-2 w-full border-box">
        <thead className="shadow-md border-t-2">
          <tr>
            <th className="px-4 py-3 w-[100px]">
              <span>Код</span>
            </th>
            <th className="px-4 py-3">
              <span>Зав. Склад</span>
            </th>
            <th className="px-4 py-3">
              <span>Получил</span>
            </th>
            <th className="px-4 py-3 w-[100px]">
              <span>Объект</span>
            </th>
            <th className="px-4 py-3">
              <span>Дата</span>
            </th>
            <th className="px-4 py-3">
              <span>Примичание</span>
            </th>
            <th className="px-4 py-3">
              <LinkBox text="Добавить" to={`${INVOICE}/${invoiceType}/create`} />
            </th>
          </tr>
        </thead>
        <tbody>
          {invoiceDataQuery.isLoading && 
            <tr>
              <td colSpan={6}>
                <LoadingDots />
              </td>
            </tr>
          }
          {invoiceDataQuery.isError && 
            <tr>
              <td colSpan={6} className="text-red font-bold text-center">
                {invoiceDataQuery.error.message}
              </td>
            </tr>
          }
          {invoiceDataQuery.isSuccess && invoiceData.length == 0 &&
            <tr>
              <td></td>
            </tr>
          }
          {invoiceDataQuery.isSuccess &&
            invoiceData.map((row, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-3">{row.deliveryCode}</td>
                <td className="px-4 py-3">{row.warehouseManagerName}</td>
                <td className="px-4 py-3">{row.releasedName}</td>
                <td className="px-4 py-3">{row.objectName}</td>
                <td className="px-4 py-3">{row.dateOfInvoice}</td>
                <td className="px-4 py-3 border-box flex space-x-3">
                  {/* <LinkBox to={"/reference-books/materials/edit/" + row.key_material} text="Изменить"/>
                  <Button text="Удалить" buttonType="delete" onClick={() => onDeleteButtonClick(row)}/> */}
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </main>
  )
}