import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import getPaginatedWorker, { WorkerPaginatedData } from "../../services/api/worker/getPaginated";
import { ENTRY_LIMIT } from "../../services/api/constants";
import IWorker from "../../services/interfaces/worker";
import { useEffect, useState } from "react";
import Button from "../../components/UI/button";
import LoadingDots from "../../components/UI/loadingDots";
import deleteWorker from "../../services/api/worker/delete";
import createWorker from "../../services/api/worker/create";
import updateWorker from "../../services/api/worker/update";
import DeleteModal from "../../components/deleteModal";
import Modal from "../../components/Modal";
import Input from "../../components/UI/Input";
import Select from 'react-select'
import IReactSelectOptions from "../../services/interfaces/react-select";

export default function Worker() {
  //fetching data logic
  const tableDataQuery = useInfiniteQuery<WorkerPaginatedData, Error>({
    queryKey: ["workers"],
    queryFn: ({ pageParam }) => getPaginatedWorker({pageParam}),
    getNextPageParam: (lastPage) => {
      if (lastPage.page * ENTRY_LIMIT > lastPage.count) return undefined
      return lastPage.page + 1
    }
  })
  const [tableData, setTableData] = useState<IWorker[]>([])
  useEffect(() => {
    if (tableDataQuery.isSuccess && tableDataQuery.data) {
      const data: IWorker[] = tableDataQuery.data.pages.reduce<IWorker[]>((acc, page) => [...acc, ...page.data], [])
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

  //mutation DELETE logic
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: deleteWorker,
    onSuccess: () => {
      queryClient.invalidateQueries(["workers"])
    }
  })
  const [modalProps, setModalProps] = useState({
    setShowModal: setShowDeleteModal,
    no_delivery: "",
    deleteFunc: () => {}
  })
  const onDeleteButtonClick = (row: IWorker) => {
    setShowDeleteModal(true)
    setModalProps({
      deleteFunc: () => deleteMutation.mutate(row.id.toString()),
      no_delivery: row.name,
      setShowModal: setShowDeleteModal,
    })
  }

  //mutation CREATE AND EDIT logic
  const jobTitles: string[] = [
    "Администратор",
    "Менеджер проекта", 
    "Инженер Проекта", 
    "Инженер ТБ и ОТ",
    "Заместитель Менеджера",
    "Ассистент Менеджера",
    "Мастер",
    "Бригадир",
    "Электрик",
    "Электроварщик ручной сварки",
    "Подсобный рабочий",
    "Начальник группы",
    "Оператор биллинга",
    "Оператор ЧЧЮ",
    "Специалист ОК",
    "Бухгалтер",
    "Снабженец",
    "Заведующий складом",
    "Снабженец",
    "Кладовщик",
    "Повар",
    "Пекарь",
    "Уборщица",
    "Машинист крана-манипулятора",
    "Водитель легкового автомобиля",
    "Машинист автогидроподъемника",
    "Системный Инженер",
    "Бухгалтер Проекта",
    "Юрист Проекта",
    "Региональный Менеджер Проекта",
    "Заместитель (по совместительству кассир и снабженец)",
    "Посудамойщица",
    "Инженер лабор.",
    "Спецалист по подготовке документации",
    "Руководитель группы МЖД",
    "Руководитель группы ВЛ и КЛ",
    "Руководитель группы ПС/ТП/Комм. Абонт.",
    "Руководитель группы ПТО (контроль качества и подсчета материалов)",
    "Медецинский персонал",
    "Проектировщик",
    "Обходчик",
    "Прораб по организации работа на объекте",
    "Мастер по организации работа на объекте",
    "Специалист по контролю качества работ и подсчета материалов",
    "Супервайзер",
  ]
  const [currentJobTitle, setCurrentJobTitle] = useState<IReactSelectOptions<string>>({label: "", value: ""})
  const onJobTitleSelect = (value: null | IReactSelectOptions<string>) => {
    if (!value) {
      setCurrentJobTitle({value: "", label: ""})
      setWorkerMutationData({...workerMutationData, jobTitle: ""})
      return
    }

    setCurrentJobTitle(value)
    setWorkerMutationData({...workerMutationData, jobTitle: value.value})
  }
  const [showMutationModal, setShowMutationModal] = useState<boolean>(false)
  const [mutationModalType, setMutationModalType] = useState<null | "update" | "create">()
  const [workerMutationData, setWorkerMutationData] = useState<IWorker>({
    id: 0,
    jobTitle: "",
    mobileNumber:"",
    name:"",
  })
  const [mutationModalErrors, setMutationModalErrors] = useState({
    jobTitle: false,
    mobileNumber: false,
    name: false,
  })
  const createMaterialMutation = useMutation<IWorker, Error, IWorker>({
    mutationFn: createWorker,
    onSettled: () => {
      queryClient.invalidateQueries(["workers"])
      setShowMutationModal(false)
    }
  })
  const updateMaterialMutation = useMutation<IWorker, Error, IWorker>({
    mutationFn: updateWorker,
    onSettled: () => {
      queryClient.invalidateQueries(["workers"])
      setShowMutationModal(false)
    }
  })
  const onMutationSubmit = () => {
    if (workerMutationData.jobTitle == "") setMutationModalErrors((prev) => ({...prev, jobTitle: true}))
    else setMutationModalErrors((prev) => ({...prev, jobTitle: false}))
    
    if (workerMutationData.name == "") setMutationModalErrors((prev) => ({...prev, name: true}))
    else setMutationModalErrors((prev) => ({...prev, name: false}))

    if (workerMutationData.mobileNumber == "") setMutationModalErrors((prev) => ({...prev, mobileNumber: true}))
    else setMutationModalErrors((prev) => ({...prev, mobileNumber: false}))
    
    const isThereError = Object.keys(workerMutationData).some((value) => {
      if (workerMutationData[value as keyof typeof workerMutationData] == "" && value != "id") {
        return true
      }
    })
    if (isThereError) return
    
    switch(mutationModalType) {
      case "create":
        createMaterialMutation.mutate(workerMutationData)
        return
      case "update":
        updateMaterialMutation.mutate(workerMutationData)
        return
      
      default:
        throw new Error("Неправильная операция была выбрана")
    }
  }

  return (
    <main>
      <div className="mt-2 pl-2 flex space-x-2">
        <span className="text-3xl font-bold">Работники</span>
      </div>
      <table className="table-auto text-sm text-left mt-2 w-full border-box">
        <thead className="shadow-md border-t-2">
          <tr>
            <th className="px-4 py-3 w-[350px]">
              <span>Имя</span>
            </th>
            <th className="px-4 py-3">
              <span>Должность</span>
            </th>
            <th className="px-4 py-3">
              <span>Номера</span>
            </th>
            <th className="px-4 py-3">
              <Button text="Добавить" onClick={() => {
                setMutationModalType("create")
                setShowMutationModal(true)
              }}/>
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
                <td className="px-4 py-3">{row.jobTitle}</td>
                <td className="px-4 py-3">{row.mobileNumber}</td>
                <td className="px-4 py-3 border-box flex space-x-3">
                  <Button text="Изменить" buttonType="default" onClick={() => {
                      setShowMutationModal(true)
                      setMutationModalType("update")
                      setWorkerMutationData(row)
                      setCurrentJobTitle({value: row.jobTitle, label: row.jobTitle})
                    }}
                  />
                  <Button text="Удалить" buttonType="delete" onClick={() => onDeleteButtonClick(row)}/>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
      {showDeleteModal && 
        <DeleteModal {...modalProps}> 
          <span>При подтверждении материал под именем {modalProps.no_delivery} и все его данные в ней будут удалены</span>
        </DeleteModal>
      }
      {showMutationModal &&
        <Modal setShowModal={setShowMutationModal}>
          <div className="">
            <h3 className="text-xl font-medium text-gray-800">
              {mutationModalType == "create" && "Добавление матераила"}
              {mutationModalType == "update" && "Изменение матераила"}
            </h3>
            <div className="flex flex-col space-y-3 mt-2">
              <div className="flex flex-col space-y-1">
                <label htmlFor="name">Фамилия Имя</label>
                <Input 
                  name="name"
                  type="text"
                  value={workerMutationData.name}
                  onChange={(e) => setWorkerMutationData({...workerMutationData, [e.target.name]: e.target.value})}
                />
                {mutationModalErrors.name && <span className="text-red-600 text-sm font-bold">Не указано имя работника</span>}
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="jobTitle">Должность</label>
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  isClearable={true}
                  name={"job-title-select"}
                  placeholder={""}
                  value={currentJobTitle}
                  options={jobTitles.map<IReactSelectOptions<string>>((value) => ({label: value, value: value}))}
                  onChange={(value) => onJobTitleSelect(value)}
                />
                {mutationModalErrors.jobTitle && <span className="text-red-600 text-sm font-bold">Не указана должность работника</span>}
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="mobileNumber">Номера телефона</label>
                <Input 
                  name="mobileNumber"
                  type="text"
                  value={workerMutationData.mobileNumber}
                  onChange={(e) => setWorkerMutationData({...workerMutationData, [e.target.name]: e.target.value})}
                />
                {mutationModalErrors.mobileNumber && <span className="text-red-600 text-sm font-bold">Не указано номер телефона</span>}
              </div>
              <div>
                <Button 
                  text={mutationModalType=="create" ? "Добавить" : "Подтвердить изменения"}
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