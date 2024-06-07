import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Button from "../../components/UI/button";
import { ENTRY_LIMIT } from "../../services/api/constants";
import { useEffect, useState } from "react";
import LoadingDots from "../../components/UI/loadingDots";
import DeleteModal from "../../components/deleteModal";
import "react-datepicker/dist/react-datepicker.css";
import MutationInvoiceInput from "../../components/invoice/input/MutationInvoiceInput";
import ReportInvoiceInput from "../../components/invoice/input/ReportInvoiceInput";
import { InvoiceInputPagianted, deleteInvoiceInput, getInvoiceInputDocument, getPaginatedInvoiceInput, sendInvoiceInputConfirmationExcel } from "../../services/api/invoiceInput";
import { IInvoiceInputView } from "../../services/interfaces/invoiceInput";
import { FaUpload, FaDownload, FaRegListAlt, FaRegTrashAlt } from "react-icons/fa";
import IconButton from "../../components/IconButtons";
import ShowInvoiceInputDetails from "../../components/invoice/input/ShowInvoiceInputDetails";

export default function InvoiceInput() {
  //FETCHING LOGIC
  const tableDataQuery = useInfiniteQuery<InvoiceInputPagianted, Error>({
    queryKey: ["invoice-input"],
    queryFn: ({ pageParam }) => getPaginatedInvoiceInput({ pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page * ENTRY_LIMIT > lastPage.count) return undefined
      return lastPage.page + 1
    }
  })
  const [tableData, setTableData] = useState<IInvoiceInputView[]>([])
  useEffect(() => {
    if (tableDataQuery.isSuccess && tableDataQuery.data) {
      const data: IInvoiceInputView[] = tableDataQuery.data.pages.reduce<IInvoiceInputView[]>((acc, page) => [...acc, ...page.data], [])
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
  const [confirmationData, setConfirmationData] = useState<{ id: number, data: File | null }>({ id: 0, data: null })
  const confirmationFileMutation = useMutation<boolean, Error, void>({
    mutationFn: () => sendInvoiceInputConfirmationExcel(confirmationData.id, confirmationData.data!),
    onSuccess: () => queryClient.invalidateQueries(["invoice-input"])
  })
  const acceptExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setConfirmationData({
      ...confirmationData,
      data: e.target.files[0],
    })
  }
  useEffect(() => {
    if (confirmationData.data && confirmationData.id != 0) {
      confirmationFileMutation.mutate()
    }
  }, [confirmationData])

  //DELETE LOGIC
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: deleteInvoiceInput,
    onSuccess: () => {
      queryClient.invalidateQueries(["invoice-input"])
    }
  })
  const [modalProps, setModalProps] = useState({
    setShowModal: setShowModal,
    no_delivery: "",
    deleteFunc: () => { }
  })
  const onDeleteButtonClick = (row: IInvoiceInputView) => {
    setShowModal(true)
    setModalProps({
      deleteFunc: () => deleteMutation.mutate(row.id),
      no_delivery: row.deliveryCode,
      setShowModal: setShowModal,
    })
  }

  //Mutation Logic
  const [showMutationModal, setShowMutationModal] = useState(false)
  const [mutationModalType, setMutationModalType] = useState<"create" | "update">("create")

  //Details logic
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [detailModalData, setDetailModalData] = useState<IInvoiceInputView>({
    projectID: 1,
    dateOfInvoice: new Date(),
    deliveryCode: "",
    id: 0,
    notes: "",
    releasedName: "",
    warehouseManagerName: "",
    confirmation: false,
  })

  const showDetails = (index: number) => {
    setDetailModalData(tableData[index])
    setShowDetailsModal(true)
  }

  //Report modal logic
  const [showReportModal, setShowReportModal] = useState(false)

  return (
    <main>
      <div className="mt-2 px-2 flex justify-between">
        <span className="text-3xl font-bold">Накладные приход</span>
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
              <span>Зав. Склад</span>
            </th>
            <th className="px-4 py-3">
              <span>Составитель</span>
            </th>
            <th className="px-4 py-3 w-[150px]">
              <span>Дата</span>
            </th>
            <th className="px-4 py-3">
              <Button text="Добавить" onClick={() => {
                setShowMutationModal(true)
                setMutationModalType("create")
              }} />
            </th>
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
                <td className="px-4 py-3">{row.warehouseManagerName}</td>
                <td className="px-4 py-3">{row.releasedName}</td>
                <td className="px-4 py-3">{row.dateOfInvoice.toString().substring(0, 10)}</td>
                <td className="px-4 py-3 border-box flex space-x-3">
                  <IconButton
                    icon={<FaRegListAlt size="20px" title={`Просмотр деталей накладной ${row.deliveryCode}`} />}
                    onClick={() => showDetails(index)}
                  />
                  {row.confirmation &&
                    <IconButton
                      icon={<FaDownload size="20px" title={`Скачать документ накладной ${row.deliveryCode}`} />}
                      onClick={() => getInvoiceInputDocument(row.deliveryCode)}
                    />
                  }
                  {!row.confirmation &&
                    <>
                      <label
                        htmlFor="file"
                        onClick={() => setConfirmationData({ ...confirmationData, id: row.id })}
                        className="px-4 py-2 flex items-center text-white bg-red-700 hover:bg-red-800 rounded-lg text-center cursor-pointer"
                      >
                        <FaUpload
                          size="20px"
                          title={`Подтвердить файлом накладную ${row.deliveryCode}`}
                        />
                      </label>
                      <input
                        name={`file-${row.id}`}
                        type="file"
                        id="file"
                        onChange={(e) => acceptExcel(e)}
                        className="hidden"
                        value=''
                      />
                      {/* <IconButton */}
                      {/*   icon={<FaRegEdit size="20px" title={`Изменить данные накладной ${row.deliveryCode}`} />} */}
                      {/*   onClick={() => showDetails(index)} */}
                      {/* /> */}
                      <IconButton
                        type="delete"
                        icon={<FaRegTrashAlt size="20px" title={`Удалить все данные накладной ${row.deliveryCode}`} />}
                        onClick={() => onDeleteButtonClick(row)}
                      />
                    </>
                  }
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
      {showDetailsModal && <ShowInvoiceInputDetails setShowModal={setShowDetailsModal} data={detailModalData} />}
      {showModal &&
        <DeleteModal {...modalProps}>
          <span>При подтверждении накладая приход с кодом {modalProps.no_delivery} и все связанные материалы будут удалены</span>
        </DeleteModal>
      }
      {showMutationModal && <MutationInvoiceInput mutationType={mutationModalType} setShowMutationModal={setShowMutationModal} />}
      {showReportModal && <ReportInvoiceInput setShowReportModal={setShowReportModal} />}
    </main>
  )
}
