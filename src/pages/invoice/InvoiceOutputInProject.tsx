import { useEffect, useState } from "react";
import Button from "../../components/UI/button";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ENTRY_LIMIT } from "../../services/api/constants";
import DeleteModal from "../../components/deleteModal";
import ReportInvoiceOutput from "../../components/invoice/output/ReportInvoiceOutput";
import IconButton from "../../components/IconButtons";
import { FaDownload, FaRegListAlt, FaRegTrashAlt, FaUpload } from "react-icons/fa";
import ShowInvoiceOutputInProjectDetails from "../../components/invoice/output/ShowInvoiceOutputInProjectDetails";
import { InvoiceOutputInProjectConfirmation, InvoiceOutputInProjectPagianted, deleteInvoiceOutputInProject, getInvoiceOutputInProjectDocument, getPaginatedInvoiceOutputInProject, sendInvoiceOutputInProjectConfirmationExcel } from "../../services/api/invoiceOutputInProject";
import { IInvoiceOutputInProjectView } from "../../services/interfaces/invoiceOutputInProject";
import MutationInvoiceOutputInProject from "../../components/invoice/output/MutationInvoiceOutputInProject";

export default function InvoiceOutputInProject() {
  //FETCHING LOGIC
  const tableDataQuery = useInfiniteQuery<InvoiceOutputInProjectPagianted, Error>({
    queryKey: ["invoice-output-in-project"],
    queryFn: ({ pageParam }) => getPaginatedInvoiceOutputInProject({ pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page * ENTRY_LIMIT > lastPage.count) return undefined
      return lastPage.page + 1
    }
  })
  const [tableData, setTableData] = useState<IInvoiceOutputInProjectView[]>([])
  useEffect(() => {
    if (tableDataQuery.isSuccess && tableDataQuery.data) {
      const data: IInvoiceOutputInProjectView[] = tableDataQuery.data.pages.reduce<IInvoiceOutputInProjectView[]>((acc, page) => [...acc, ...page.data], [])
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
  const confirmationFileMutation = useMutation<boolean, Error, InvoiceOutputInProjectConfirmation>({
    mutationFn: sendInvoiceOutputInProjectConfirmationExcel,
    onSuccess: () => queryClient.invalidateQueries(["invoice-output-in-project"])
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
    mutationFn: deleteInvoiceOutputInProject,
    onSuccess: () => {
      queryClient.invalidateQueries(["invoice-output"])
    }
  })
  const [modalProps, setModalProps] = useState({
    setShowModal: setShowModal,
    no_delivery: "",
    deleteFunc: () => { }
  })
  const onDeleteButtonClick = (row: IInvoiceOutputInProjectView) => {
    setShowModal(true)
    setModalProps({
      deleteFunc: () => deleteMutation.mutate(row.id),
      no_delivery: row.deliveryCode,
      setShowModal: setShowModal,
    })
  }

  //Mutation LOGIC
  const [mutationModalType, setMutationModalType] = useState<"update" | "create">("create")
  const [showMutationModal, setShowMutationModal] = useState(false)

  //Details logic
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [detailModalData, setDetailModalData] = useState<IInvoiceOutputInProjectView>({
    dateOfInvoice: new Date(),
    deliveryCode: "",
    id: 0,
    notes: "",
    releasedName: "",
    warehouseManagerName: "",
    teamName: "",
    objectName: "",
    confirmation: false,
    districtName: "",
    recipientName: "",
  })

  const showDetails = (index: number) => {
    setDetailModalData(tableData[index])
    setShowDetailsModal(true)
  }

  //Report Modal
  const [showReportModal, setShowReportModal] = useState(false)

  return (
    <main>
      <div className="mt-2 px-2 flex justify-between">
        <span className="text-3xl font-bold">Накладные отпуск внутри проекта</span>
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
              <span>Район</span>
            </th>
            <th className="px-4 py-3">
              <span>Объект</span>
            </th>
            <th className="px-4 py-3">
              <span>Бригада</span>
            </th>
            <th className="px-4 py-3 min-w-[110px]">
              <span>Зав. Склад</span>
            </th>
            <th className="px-4 py-3">
              <span>Составитель</span>
            </th>
            <th className="px-4 py-3 w-[110px]">
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
          {tableData.map((row, index) =>
            <tr key={index} className="text-sm">
              <td className="px-4 py-3">{row.deliveryCode}</td>
              <td className="px-4 py-3">{row.districtName}</td>
              <td className="px-4 py-3">{row.objectName}</td>
              <td className="px-4 py-3">{row.teamName}</td>
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
                    icon={<FaDownload size="20px" title={`Скачать подтвержденный файл накладной ${row.deliveryCode}`} />}
                    onClick={() => getInvoiceOutputInProjectDocument(row.deliveryCode)}
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
                      name={`file-${row.id}`}
                      type="file"
                      id={`file-${row.id}`}
                      onChange={(e) => acceptConfirmationFile(e, index)}
                      className="hidden"
                      value=''
                    />
                    <IconButton
                      icon={<FaDownload size="20px" title={`Скачать сгенерированный файл накладной ${row.deliveryCode}`} />}
                      onClick={() => getInvoiceOutputInProjectDocument(row.deliveryCode)}
                    />               {/* <IconButton */}
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
          )}
        </tbody>
      </table>
      {showDetailsModal && <ShowInvoiceOutputInProjectDetails setShowModal={setShowDetailsModal} data={detailModalData} />}
      {showModal &&
        <DeleteModal {...modalProps}>
          <span>При подтверждении накладая уход с кодом {modalProps.no_delivery} и все связанные материалы будут удалены</span>
        </DeleteModal>
      }
      {showMutationModal && <MutationInvoiceOutputInProject mutationType={mutationModalType} setShowMutationModal={setShowMutationModal} />}
      {showReportModal && <ReportInvoiceOutput setShowReportModal={setShowReportModal} />}
    </main>
  )
}
