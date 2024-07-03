import { useEffect, useState } from "react";
import Button from "../../components/UI/button";
import { IInvoiceReturnView } from "../../services/interfaces/invoiceReturn";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InvoiceReturnConfirmation, InvoiceReturnPagianted, deleteInvoiceReturn, getInvoiceReturnDocument, getPaginatedInvoiceReturn, sendInvoiceReturnConfirmationExcel } from "../../services/api/invoiceReturn";
import { ENTRY_LIMIT } from "../../services/api/constants";
import DeleteModal from "../../components/deleteModal";
import MutationInvoiceReturnObject from "../../components/invoice/return/MutationInvoiceReturnObject";
import ReportInvoiceReturn from "../../components/invoice/return/ReportInvoiceReturn";
import IconButton from "../../components/IconButtons";
import { FaDownload, FaRegListAlt, FaRegTrashAlt, FaUpload } from "react-icons/fa";
import ShowInvoiceReturnDetails from "../../components/invoice/return/ShowInvoiceReturnDetails";

export default function InvoiceReturnObject() {

  //FETCHING LOGIC
  const tableDataQuery = useInfiniteQuery<InvoiceReturnPagianted, Error>({
    queryKey: ["invoice-return-object"],
    queryFn: ({ pageParam }) => getPaginatedInvoiceReturn({ pageParam }, "object"),
    getNextPageParam: (lastPage) => {
      if (lastPage.page * ENTRY_LIMIT > lastPage.count) return undefined
      return lastPage.page + 1
    }
  })
  const [tableData, setTableData] = useState<IInvoiceReturnView[]>([])
  useEffect(() => {
    if (tableDataQuery.isSuccess && tableDataQuery.data) {
      const data: IInvoiceReturnView[] = tableDataQuery.data.pages.reduce<IInvoiceReturnView[]>((acc, page) => [...acc, ...page.data], [])
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

  //Confirmation logic
  const confirmationFileMutation = useMutation<boolean, Error, InvoiceReturnConfirmation>({
    mutationFn: sendInvoiceReturnConfirmationExcel,
    onSuccess: () => queryClient.invalidateQueries(["invoice-return-object"])
  })

   const acceptConfirmationFile = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    e.preventDefault()

    if (!e.target.files) return

    confirmationFileMutation.mutate({ id: tableData[index].id, file: e.target.files[0]! })

    e.target.files = null
    e.target.value = ''
  }

  //DELETE LOGIC
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: deleteInvoiceReturn,
    onSuccess: () => {
      queryClient.invalidateQueries(["invoice-return-object"])
    }
  })
  const [modalProps, setModalProps] = useState({
    setShowModal: setShowModal,
    no_delivery: "",
    deleteFunc: () => { }
  })
  const onDeleteButtonClick = (row: IInvoiceReturnView) => {
    setShowModal(true)
    setModalProps({
      deleteFunc: () => deleteMutation.mutate(row.id),
      no_delivery: row.deliveryCode,
      setShowModal: setShowModal,
    })
  }

  //MUTATION LOGIC
  const [mutationModalType, setMutationModalType] = useState<"update" | "create">("create")
  const [showMutationModal, setShowMutationModal] = useState(false)

  //Report Modal
  const [showReportModal, setShowReportModal] = useState(false)

  //DETAIL MODAL DATA
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [detailModalData, setDetailModalData] = useState<IInvoiceReturnView>({
    dateOfInvoice: new Date(),
    deliveryCode: "",
    id: 0,
    confirmation: false,
    projectID: 1,
    teamNumber: "",
    teamLeaderNames: [],
    objectName: "",
    objectSupervisorNames: [],
  })

  const showDetails = (index: number) => {
    setDetailModalData(tableData[index])
    setShowDetailsModal(true)
  }

  return (
    <main>
      <div className="mt-2 px-2 flex justify-between">
        <span className="text-3xl font-bold">Накладные возврат из объекта</span>
        <div>
          <Button onClick={() => setShowReportModal(true)} text="Отчет" buttonType="default" />
        </div>
      </div>
      <table className="table-auto text-sm text-left mt-2 w-full border-box">
        <thead className="shadow-md border-t-2">
          <tr>
            <th className="px-4 py-3 w-[110px]">
              <span>Код</span>
            </th>
            <th className="px-4 py-3">
              <span>Объект</span>
            </th>
            <th className="px-4 py-3">
              <span>Бригадиры</span>
            </th>
            <th className="px-4 py-3 w-[150px]">
              <span>Дата</span>
            </th>
            <th className="px-4 py-3">
              <Button text="Добавить" onClick={() => {
                setMutationModalType("create")
                setShowMutationModal(true)
              }} />
            </th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((value, index) =>
            <tr key={index}>
              <td className="px-4 py-3">{value.deliveryCode}</td>
              <td className="px-4 py-3">{value.objectName}</td>
              <td className="px-4 py-3">{value.objectSupervisorNames.reduce((acc, val) => acc + ", " + val)}</td>
              <td className="px-4 py-3">{value.dateOfInvoice.toString().substring(0, 10)}</td>
              <td className="px-4 py-3 border-box flex space-x-3">
                <IconButton
                  icon={<FaRegListAlt size="20px" title={`Просмотр деталей накладной ${value.deliveryCode}`} />}
                  onClick={() => showDetails(index)}
                />
                {value.confirmation &&
                  <IconButton
                    icon={<FaDownload size="20px" title={`Скачать подтвержденный файл накладной ${value.deliveryCode}`} />}
                    onClick={() => getInvoiceReturnDocument(value.deliveryCode)}
                  />
                }
                {!value.confirmation && <>
                    <label
                      htmlFor="file"
                      className="px-4 py-2 flex items-center text-white bg-red-700 hover:bg-red-800 rounded-lg text-center cursor-pointer"
                    >
                      <FaUpload
                        size="20px"
                        title={`Подтвердить файлом накладную ${value.deliveryCode}`}
                      />
                    </label>
                    <input
                      name={`file-${value.id}`}
                      type="file"
                      id="file"
                      onChange={(e) => acceptConfirmationFile(e, index)}
                      className="hidden"
                      value=''
                    />
                    <IconButton
                      icon={<FaDownload size="20px" title={`Скачать сгенерированный файл накладной ${value.deliveryCode}`} />}
                      onClick={() => getInvoiceReturnDocument(value.deliveryCode)}
                    />               {/* <IconButton */}
                    {/*   icon={<FaRegEdit size="20px" title={`Изменить данные накладной ${row.deliveryCode}`} />} */}
                    {/*   onClick={() => showDetails(index)} */}
                    {/* /> */}
                    <IconButton
                      type="delete"
                      icon={<FaRegTrashAlt size="20px" title={`Удалить все данные накладной ${value.deliveryCode}`} />}
                      onClick={() => onDeleteButtonClick(value)}
                    />
                  </>
                }
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {showDetailsModal && <ShowInvoiceReturnDetails setShowModal={setShowDetailsModal} data={detailModalData} />}
      {showModal &&
        <DeleteModal {...modalProps}>
          <span>При подтверждении накладая приход с кодом {modalProps.no_delivery} и все связанные материалы будут удалены</span>
        </DeleteModal>
      }
      {showMutationModal && <MutationInvoiceReturnObject setShowMutationModal={setShowMutationModal} mutationType={mutationModalType} />}
      {showReportModal && <ReportInvoiceReturn setShowReportModal={setShowReportModal} />}
    </main>
  )
}
