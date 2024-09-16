import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../../components/UI/button";
import { ENTRY_LIMIT } from "../../services/api/constants";
import { useEffect, useState } from "react";
import LoadingDots from "../../components/UI/loadingDots";
import DeleteModal from "../../components/deleteModal";
import "react-datepicker/dist/react-datepicker.css";
import ReportInvoiceInput from "../../components/invoice/input/ReportInvoiceInput";
import { InvoiceInputConfirmationData, InvoiceInputPagianted, deleteInvoiceInput, getInvoiceInputDocument, getPaginatedInvoiceInput, sendInvoiceInputConfirmationExcel } from "../../services/api/invoiceInput";
import { IInvoiceInputView } from "../../services/interfaces/invoiceInput";
import { FaUpload, FaDownload, FaRegListAlt, FaRegTrashAlt, FaEdit } from "react-icons/fa";
import IconButton from "../../components/IconButtons";
import ShowInvoiceInputDetails from "../../components/invoice/input/ShowInvoiceInputDetails";
import AddInvoiceInput from "../../components/invoice/input/AddInvoiceInput";
import EditInvoiceInput from "../../components/invoice/input/EditInvoiceInput";
import toast from "react-hot-toast";

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
  const confirmationFileMutation = useMutation<boolean, Error, InvoiceInputConfirmationData>({
    mutationFn: sendInvoiceInputConfirmationExcel,

  })

  const acceptConfirmationFile = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    e.preventDefault()

    if (!e.target.files) return

    const confirmationFileToast = toast.loading("Загрузка подтвердающего файла...")
    confirmationFileMutation.mutate({
      id: tableData[index].id,
      file: e.target.files[0]!
    }, {
      onSuccess: () => {
        toast.dismiss(confirmationFileToast)
        toast.success("Подтвердающий файл загружен")
        queryClient.invalidateQueries(["invoice-input"])
      },
      onError: (err) => {
        toast.dismiss(confirmationFileToast)
        toast.error(`Ошибка при загрузке файла: ${err.message}`)
      },
    })

    e.target.files = null
    e.target.value = ''
  }

  const [deliveryCodeForDocumentDownload, setDeliveryCodeForDocumentDownload] = useState<string>("")
  useQuery({
    queryKey: ["invoice-input-document", deliveryCodeForDocumentDownload],
    queryFn: async () => {
      const loadingToast = toast.loading("Идет скачка файла")
      return getInvoiceInputDocument(deliveryCodeForDocumentDownload)
        .then(() => toast.success("Документ скачан"))
        .catch(err => toast.error(`Ошибка при скачке документа: ${err}`))
        .finally(() => toast.dismiss(loadingToast))
    },
    enabled: deliveryCodeForDocumentDownload != "",
  })

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
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [rowToEdit, setRowToEdit] = useState<IInvoiceInputView>()

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
              <Button text="Добавить" onClick={() => setShowAddModal(true)} />
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
              <tr key={index} className="border-b hover:bg-gray-200">
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
                      onClick={() => setDeliveryCodeForDocumentDownload(row.deliveryCode)}
                    />
                  }
                  {!row.confirmation &&
                    <>
                      <label
                        htmlFor={`file-${row.id}`}
                        className="px-4 py-2 flex items-center text-white bg-red-700 hover:bg-red-800 rounded-lg text-center cursor-pointer"
                      >
                        <FaUpload
                          size="20px"
                          title={`Подтвердить файлом накладную ${row.deliveryCode}`}
                        />
                      </label>
                      <input
                        key={index}
                        name={`file-${row.id}`}
                        type="file"
                        id={`file-${row.id}`}
                        onChange={(e) => acceptConfirmationFile(e, index)}
                        className="hidden"
                      />
                      {/* <IconButton */}
                      {/*   icon={<FaRegEdit size="20px" title={`Изменить данные накладной ${row.deliveryCode}`} />} */}
                      {/*   onClick={() => showDetails(index)} */}
                      {/* /> */}
                      <IconButton
                        type="delete"
                        icon={<FaEdit size="20px" title={`Изменение данных накладной ${row.deliveryCode}`} />}
                        onClick={() => {
                          setRowToEdit(row)
                          setShowEditModal(true)
                        }}
                      />
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
          {tableDataQuery.hasNextPage &&
            <tr>
              <td colSpan={5}>
                <div className="w-full py-4 flex justify-center">
                  <div
                    onClick={() => tableDataQuery.fetchNextPage()}
                    className="text-white py-2.5 px-5 rounded-lg bg-gray-700 hover:bg-gray-800 hover:cursor-pointer"
                  >
                    {tableDataQuery.isLoading && <LoadingDots height={30} />}
                    {!tableDataQuery.isLoading && "Загрузить еще"}
                  </div>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
      {showDetailsModal && <ShowInvoiceInputDetails setShowModal={setShowDetailsModal} data={detailModalData} />}
      {showModal &&
        <DeleteModal {...modalProps}>
          <span>При подтверждении накладая приход с кодом {modalProps.no_delivery} и все связанные материалы будут удалены</span>
        </DeleteModal>
      }
      {showAddModal && <AddInvoiceInput setShowAddModal={setShowAddModal} />}
      {showEditModal && <EditInvoiceInput setShowEditModal={setShowEditModal} invoiceInput={rowToEdit!} />}
      {showReportModal && <ReportInvoiceInput setShowReportModal={setShowReportModal} />}
    </main>
  )
}
