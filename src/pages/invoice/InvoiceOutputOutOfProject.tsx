import { useEffect, useState } from "react"
import Select from 'react-select'
import AddInvoiceOutputOutOfProject from "../../components/invoice/output/AddInvoiceOutputOutOfProject"
import Button from "../../components/UI/button"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { InvoiceOutputOutOfProjectConfirmation, InvoiceOutputOutOfProjectPaginated, InvoiceOutputOutOfProjectSearchParameters, InvoiceOutputOutOfProjectView, deleteInvoiceOutputOutOfProject, getInvoiceOutputOutOfProjectDocument, getInvoiceOutputOutOfProjectPaginated, sendInvoiceOutputOutOfProjectConfirmationExcel } from "../../services/api/invoiceOutputOutOfProject"
import { ENTRY_LIMIT } from "../../services/api/constants"
import IconButton from "../../components/IconButtons"
import { FaDownload, FaEdit, FaRegListAlt, FaRegTrashAlt, FaUpload } from "react-icons/fa"
import LoadingDots from "../../components/UI/loadingDots"
import DeleteModal from "../../components/deleteModal"
import ShowInvoiceOutputOutOfProjectDetails from "../../components/invoice/output/ShowInvoiceOutputOutOfProjectDetailModal"
import EditInvoiceOutputOutOfProject from "../../components/invoice/output/EditInvoiceOutputOutOfProject"
import IReactSelectOptions from "../../services/interfaces/react-select"
import Modal from "../../components/Modal"
import Project from "../../services/interfaces/project"
import { GetAllProjects } from "../../services/api/project"

export default function InvoiceOutputOutOfProject() {

  const [searchParameters, setSearchParameters] = useState<InvoiceOutputOutOfProjectSearchParameters>({
    toProjectID: 0,
    releasedWorkerID: 0,
  })
  //FETCHING LOGIC
  const tableDataQuery = useInfiniteQuery<InvoiceOutputOutOfProjectPaginated, Error>({
    queryKey: ["invoice-output-out-of-project", searchParameters],
    queryFn: ({ pageParam }) => getInvoiceOutputOutOfProjectPaginated({ pageParam }, searchParameters),
    getNextPageParam: (lastPage) => {
      if (lastPage.page * ENTRY_LIMIT > lastPage.count) return undefined
      return lastPage.page + 1
    }
  })
  const [tableData, setTableData] = useState<InvoiceOutputOutOfProjectView[]>([])
  useEffect(() => {
    if (tableDataQuery.isSuccess && tableDataQuery.data) {
      const data: InvoiceOutputOutOfProjectView[] = tableDataQuery.data.pages.reduce<InvoiceOutputOutOfProjectView[]>((acc, page) => [...acc, ...page.data], [])
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

  //Mutation LOGIC
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [rowToEdit, setRowToEdit] = useState<InvoiceOutputOutOfProjectView>()

  //Details logic
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [detailModalData, setDetailModalData] = useState<InvoiceOutputOutOfProjectView>({
    dateOfInvoice: new Date(),
    deliveryCode: "",
    id: 0,
    releasedWorkerName: "",
    confirmation: false,
    fromProjectID: 0,
    toProjectManager: "",
    toProjectName: "",
    toProjectID: 0,
  })

  const showDetails = (index: number) => {
    setDetailModalData(tableData[index])
    setShowDetailsModal(true)
  }

  //DELETE LOGIC
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: deleteInvoiceOutputOutOfProject,
    onSuccess: () => {
      queryClient.invalidateQueries(["invoice-output-out-of-project"])
    }
  })
  const [modalProps, setModalProps] = useState({
    setShowModal: setShowDeleteModal,
    no_delivery: "",
    deleteFunc: () => { }
  })
  const onDeleteButtonClick = (row: InvoiceOutputOutOfProjectView) => {
    setShowDeleteModal(true)
    setModalProps({
      deleteFunc: () => deleteMutation.mutate(row.id),
      no_delivery: row.deliveryCode,
      setShowModal: setShowDeleteModal,
    })
  }

  //Confirmation logic
  const confirmationFileMutation = useMutation<boolean, Error, InvoiceOutputOutOfProjectConfirmation>({
    mutationFn: sendInvoiceOutputOutOfProjectConfirmationExcel,
    onSuccess: () => queryClient.invalidateQueries(["invoice-output-out-of-project"])
  })

  const acceptConfirmationFile = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    e.preventDefault()

    if (!e.target.files) return

    confirmationFileMutation.mutate({ id: tableData[index].id, file: e.target.files[0]! })

    e.target.files = null
    e.target.value = ''
  }
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [selectedProjectForSearch, setSelectedProjectForSearch] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  const [allProjects, setAllProjects] = useState<IReactSelectOptions<number>[]>([])
  const allProjectsQuery = useQuery<Project[], Error, Project[]>({
    queryKey: ["all-projects"],
    queryFn: GetAllProjects,
    enabled: false,
  })
  useEffect(() => {
    if (allProjectsQuery.isSuccess && allProjectsQuery.data) {
      if (allProjectsQuery.isSuccess && allProjectsQuery.data) {
        setAllProjects(allProjectsQuery.data.
          filter(val => val.name != "Администрирование" && val.name != "Test Project").
          map<IReactSelectOptions<number>>(val => ({
            label: val.name + " (" + val.projectManager + ")",
            value: val.id,
          }))
        )
      }
    }
  }, [allProjectsQuery.data])

  return (
    <main>
      <div className="mt-2 pl-2 flex space-x-2">
        <span className="text-3xl font-bold">Накладные отпуск вне проекта</span>
        <div
          onClick={() => {
            setSearchParameters({
              ...searchParameters,
              toProjectID: 0,
            })
            setSelectedProjectForSearch({ label: "", value: 0 })
          }}
          className="text-white py-2.5 px-5 rounded-lg bg-red-700 hover:bg-red-800 hover:cursor-pointer"
        >
          Сброс поиска
        </div>
        <div>
          <div
            onClick={() => {
              allProjectsQuery.refetch()
              setShowSearchModal(true)
            }}
            className="text-white py-2.5 px-5 rounded-lg bg-gray-700 hover:bg-gray-800 hover:cursor-pointer"
          >
            Поиск
          </div>
          {/* <Button onClick={() => setShowReportModal(true)} text="Отчет" buttonType="default" /> */}

        </div>
      </div>
      <table className="table-auto text-sm text-left mt-2 w-full border-box">
        <thead className="shadow-md border-t-2">
          <tr>
            <th className="px-4 py-3 w-[110px]">
              <span>Код</span>
            </th>
            <th className="px-4 py-3">
              <span>Название проекта</span>
            </th>
            <th className="px-4 py-3">
              <span>Менеджер проекта</span>
            </th>
            <th className="px-4 py-3">
              <span>Составитель</span>
            </th>
            <th className="px-4 py-3 w-[110px]">
              <span>Дата</span>
            </th>
            <th className="px-4 py-3">
              <Button text="Добавить" onClick={() => setShowAddModal(true)} />
            </th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) =>
            <tr key={index} className="text-sm hover:bg-gray-200">
              <td className="px-4 py-3">{row.deliveryCode}</td>
              <td className="px-4 py-3">{row.toProjectName}</td>
              <td className="px-4 py-3">{row.toProjectManager}</td>
              <td className="px-4 py-3">{row.releasedWorkerName}</td>
              <td className="px-4 py-3">{row.dateOfInvoice.toString().substring(0, 10)}</td>
              <td className="px-4 py-3 border-box flex space-x-3">
                <IconButton
                  icon={<FaRegListAlt size="20px" title={`Просмотр деталей накладной ${row.deliveryCode}`} />}
                  onClick={() => showDetails(index)}
                />
                {row.confirmation &&
                  <IconButton
                    icon={<FaDownload size="20px" title={`Скачать подтвержденный файл накладной ${row.deliveryCode}`} />}
                    onClick={() => getInvoiceOutputOutOfProjectDocument(row.deliveryCode)}
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
          )}
          {tableDataQuery.hasNextPage &&
            <tr>
              <td colSpan={8}>
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
      {showDetailsModal && <ShowInvoiceOutputOutOfProjectDetails setShowModal={setShowDetailsModal} data={detailModalData} />}
      {showDeleteModal &&
        <DeleteModal {...modalProps}>
          <span>При подтверждении накладая уход с кодом {modalProps.no_delivery} и все связанные материалы будут удалены</span>
        </DeleteModal>
      }
      {showAddModal && <AddInvoiceOutputOutOfProject setShowAddModal={setShowAddModal} />}
      {showEditModal && <EditInvoiceOutputOutOfProject setShowEditModal={setShowEditModal} invoiceOutputOutOfProject={rowToEdit!} />}
      {/* {showReportModal && <ReportInvoiceOutput setShowReportModal={setShowReportModal} />} */}
      {showSearchModal &&
        <Modal setShowModal={setShowSearchModal}>
          <span className="font-bold text-xl py-1">Параметры Поиска по сравочнику материалов</span>
          {allProjectsQuery.isLoading && <LoadingDots />}
          {allProjectsQuery.isSuccess &&
            <div className="p-2 flex flex-col space-y-2">
              <div className="flex flex-col space-y-1">
                <label htmlFor="projects">Проект</label>
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  isClearable={true}
                  name={"projects"}
                  placeholder={""}
                  value={selectedProjectForSearch}
                  options={allProjects}
                  onChange={value => {
                    setSelectedProjectForSearch(value ?? { label: "", value: 0 })
                    setSearchParameters({
                      ...searchParameters,
                      toProjectID: value?.value ?? 0,
                    })
                  }}
                />
              </div>
            </div>
          }
        </Modal>
      }
    </main>
  )
}
