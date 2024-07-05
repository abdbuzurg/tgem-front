import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ProjectPaginatedData, createProject, deleteProject, getProjectsPaginated, updateProject } from "../../services/api/project"
import { ENTRY_LIMIT } from "../../services/api/constants"
import { useEffect, useState } from "react"
import Project from "../../services/interfaces/project"
import LoadingDots from "../../components/UI/loadingDots"
import Button from "../../components/UI/button"
import DeleteModal from "../../components/deleteModal"
import Modal from "../../components/Modal"
import Input from "../../components/UI/Input"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export function AdministratorProject() {
  //FETCHING LOGIC
  const tableDataQuery = useInfiniteQuery<ProjectPaginatedData, Error>({
    queryKey: ["projects"],
    queryFn: ({ pageParam }) => getProjectsPaginated({ pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page * ENTRY_LIMIT > lastPage.count) return undefined
      return lastPage.page + 1
    }
  })
  const [tableData, setTableData] = useState<Project[]>([])
  useEffect(() => {
    if (tableDataQuery.isSuccess && tableDataQuery.data) {
      const data: Project[] = tableDataQuery.data.pages.reduce<Project[]>((acc, page) => [...acc, ...page.data], [])
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

  //DELETION LOGIC
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"])
    }
  })
  const [modalProps, setModalProps] = useState({
    setShowModal: setShowModal,
    no_delivery: "",
    deleteFunc: () => { }
  })
  const onDeleteButtonClick = (row: Project) => {
    setShowModal(true)
    setModalProps({
      deleteFunc: () => deleteMutation.mutate(row.id),
      no_delivery: row.name,
      setShowModal: setShowModal,
    })
  }

  // MUTATION LOGIC
  const [showMutationModal, setShowMutationModal] = useState(false)
  const [mutationModalType, setMutationModalType] = useState<null | "update" | "create">()
  const [projectMutationData, setProjectMutationData] = useState<Project>({
    id: 0,
    name: "",
    client: "",
    budget: 0,
    description: "",
    signedDateOfContract: new Date(),
    dateStart: new Date(),
    dateEnd: new Date(),
  })

  const createProjectMutation = useMutation<Project, Error, Project>({
    mutationFn: createProject,
    onSettled: () => {
      queryClient.invalidateQueries(["projects"])
      setShowMutationModal(false)
    }
  })
  const updateProjectMutation = useMutation<Project, Error, Project>({
    mutationFn: updateProject,
    onSettled: () => {
      queryClient.invalidateQueries(["projects"])
      setShowMutationModal(false)
    }
  })

  const onMutationSubmit = () => {
    switch (mutationModalType) {
      case "create":
        createProjectMutation.mutate(projectMutationData)
        return
      case "update":
        updateProjectMutation.mutate(projectMutationData)
        return

      default:
        throw new Error("Неправильная операция была выбрана")
    }
  }

  return (
    <main>
      <div className="mt-2 pl-2 flex space-x-2">
        <span className="text-3xl font-bold">Проекты</span>
        {/* <Button text="Экспорт" onClick={() => {}}/> */}
      </div>
      <table className="table-auto text-sm text-left mt-2 w-full border-box">
        <thead className="shadow-md border-t-2">
          <tr>
            <th className="px-4 py-3 w-[100px]">
              <span>Наименование</span>
            </th>
            <th className="px-4 py-3 w-[100px]">
              <span>Клиент</span>
            </th>
            <th className="px-4 py-3 w-[100px]">
              <span>Бюджет</span>
            </th>
            <th className="px-4 py-3 w-[100px]">
              <span>Описание</span>
            </th>
            <th className="px-4 py-3 w-[100px]">
              <span>Дата подписания</span>
            </th>
            <th className="px-4 py-3 w-[100px]">
              <span>Дата начала</span>
            </th>
            <th className="px-4 py-3 w-[100px]">
              <span>Дата окончания</span>
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
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3">{row.client}</td>
                <td className="px-4 py-3">{row.budget}</td>
                <td className="px-4 py-3">{row.description}</td>
                <td className="px-4 py-3">{row.signedDateOfContract.toString().substring(0, 10)}</td>
                <td className="px-4 py-3">{row.dateStart.toString().substring(0, 10)}</td>
                <td className="px-4 py-3">{row.dateEnd.toString().substring(0, 10)}</td>
                <td className="px-4 py-3 border-box flex space-x-3">
                  <Button text="Изменить" buttonType="default" onClick={() => {
                    setShowMutationModal(true)
                    setMutationModalType("update")
                    setProjectMutationData(row)
                  }}
                  />
                  <Button text="Удалить" buttonType="delete" onClick={() => onDeleteButtonClick(row)} />
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
      {showModal &&
        <DeleteModal {...modalProps}>
          <span>При подтверждении материал под именем {modalProps.no_delivery} и все его данные в ней будут удалены</span>
        </DeleteModal>
      }
      {showMutationModal &&
        <Modal setShowModal={setShowMutationModal}>
          <div className="">
            <h3 className="text-xl font-medium text-gray-800">
              {mutationModalType == "create" && "Добавление проекта"}
              {mutationModalType == "update" && "Изменение проекта"}
            </h3>
            <div className="flex flex-col space-y-3 mt-2">
              <div className="flex flex-col space-y-1">
                <label htmlFor="name">Имя</label>
                <Input
                  name="name"
                  type="text"
                  value={projectMutationData.name}
                  onChange={(e) => setProjectMutationData({ ...projectMutationData, [e.target.name]: e.target.value })}
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="client">КЛИЕНТ</label>
                <Input
                  name="client"
                  type="text"
                  value={projectMutationData.client}
                  onChange={(e) => setProjectMutationData({ ...projectMutationData, [e.target.name]: e.target.value })}
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="budget">Бюджет</label>
                <Input
                  name="budget"
                  type="number"
                  value={projectMutationData.budget}
                  onChange={(e) => setProjectMutationData({ ...projectMutationData, [e.target.name]: e.target.valueAsNumber })}
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="description">Описание</label>
                <textarea
                  name="description"
                  value={projectMutationData.description}
                  onChange={(e) => setProjectMutationData({ ...projectMutationData, [e.target.name]: e.target.value })}
                  className="py-1.5 px-2 resize-none w-full h-[100px] rounded border  border-gray-800"
                >
                </textarea>
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="dateOfInvoice">Дата подписания договора</label>
                <div className="py-[4px] px-[8px] border-[#cccccc] border rounded-[4px]">
                  <DatePicker
                    name="dateOfInvoice"
                    className="outline-none w-full"
                    dateFormat={"dd-MM-yyyy"}
                    selected={projectMutationData.signedDateOfContract}
                    onChange={(date) => setProjectMutationData({ ...projectMutationData, signedDateOfContract: date ?? new Date(+0) })}
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="dateOfInvoice">Дата начала работы</label>
                <div className="py-[4px] px-[8px] border-[#cccccc] border rounded-[4px]">
                  <DatePicker
                    name="dateOfInvoice"
                    className="outline-none w-full"
                    dateFormat={"dd-MM-yyyy"}
                    selected={projectMutationData.dateStart}
                    onChange={(date) => setProjectMutationData({ ...projectMutationData, dateStart: date ?? new Date(+0) })}
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="dateOfInvoice">Дата окончания работы</label>
                <div className="py-[4px] px-[8px] border-[#cccccc] border rounded-[4px]">
                  <DatePicker
                    name="dateOfInvoice"
                    className="outline-none w-full"
                    dateFormat={"dd-MM-yyyy"}
                    selected={projectMutationData.dateEnd}
                    onChange={(date) => setProjectMutationData({ ...projectMutationData, dateEnd: date ?? new Date(+0) })}
                  />
                </div>
              </div>
              <div>
                <Button
                  text={mutationModalType == "create" ? "Добавить" : "Подтвердить изменения"}
                  onClick={onMutationSubmit}
                />
              </div>
            </div>
          </div>
        </Modal>
      }
    </main>
  )
}
