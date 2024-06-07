import Select from "react-select"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { IMJDObjectCreate, IMJDObjectGetAllResponse, IMJDObjectPaginated, createMJDObject, deleteMJDObject, getMJDTemplateDocument, getPaginatedMJDObjects, importMJD, updateMJDObject } from "../../../services/api/mjd"
import { ENTRY_LIMIT } from "../../../services/api/constants"
import { useEffect, useState } from "react"
import LoadingDots from "../../../components/UI/loadingDots"
import DeleteModal from "../../../components/deleteModal"
import Button from "../../../components/UI/button"
import IReactSelectOptions from "../../../services/interfaces/react-select"
import { getWorkerByJobTitle } from "../../../services/api/worker"
import IWorker from "../../../services/interfaces/worker"
import Modal from "../../../components/Modal"
import toast from "react-hot-toast"
import { OBJECT_STATUSES_FOR_SELECT } from "../../../services/lib/objectStatuses"
import Input from "../../../components/UI/Input"

export default function MJDObject() {

  //PAGINATED DATA
  const tableDataQuery = useInfiniteQuery<IMJDObjectGetAllResponse, Error>({
    queryKey: ["mjd-objects"],
    queryFn: ({ pageParam }) => getPaginatedMJDObjects({ pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page * ENTRY_LIMIT > lastPage.count) return undefined
      return lastPage.page + 1
    }
  })
  const [tableData, setTableData] = useState<IMJDObjectPaginated[]>([])
  useEffect(() => {
    if (tableDataQuery.isSuccess && tableDataQuery.data) {
      const data: IMJDObjectPaginated[] = tableDataQuery.data.pages.reduce<IMJDObjectPaginated[]>((acc, page) => [...acc, ...page.data], [])
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

  //delete logic
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: deleteMJDObject,
    onSuccess: () => {
      queryClient.invalidateQueries(["mjd-objects"])
    }
  })
  const [modalProps, setModalProps] = useState({
    setShowModal: setShowModal,
    no_delivery: "",
    deleteFunc: () => { }
  })
  const onDeleteButtonClick = (row: IMJDObjectPaginated) => {
    setShowModal(true)
    setModalProps({
      deleteFunc: () => deleteMutation.mutate(row.objectDetailedID),
      no_delivery: row.name,
      setShowModal: setShowModal,
    })
  }

  // Mutation Logic
  const [showMutationModal, setShowMutationModal] = useState(false)
  const [mutationType, setMutationType] = useState<null | "create" | "update">(null)

  const [mutationData, setMutationData] = useState<IMJDObjectCreate>({
    baseInfo: {
      id: 0,
      projectID: 0,
      objectDetailedID: 0,
      type: "mjd_objects",
      name: "",
      status: "",
    },
    detailedInfo: {
      model: "",
      amountStores: 0,
      amountEntrances: 0,
      hasBasement: true,
    },
    supervisors: [],
  })

  const [selectedSupervisorsWorkerID, setselectedSupervisorsWorkerID] = useState<IReactSelectOptions<number>[]>([])
  const [avaiableSupervisors, setAvailableSupervisors] = useState<IReactSelectOptions<number>[]>([])
  const supervisorsQuery = useQuery<IWorker[], Error, IWorker[]>({
    queryKey: ["worker-supervisors"],
    queryFn: () => getWorkerByJobTitle("Супервайзер")
  })
  useEffect(() => {
    if (supervisorsQuery.isSuccess && supervisorsQuery.data) {
      setAvailableSupervisors([
        ...supervisorsQuery.data.map<IReactSelectOptions<number>>((val) => ({ label: val.name, value: val.id }))
      ])
    }
  }, [supervisorsQuery.data])

  const createMutation = useMutation<boolean, Error, IMJDObjectCreate>({
    mutationFn: createMJDObject,
  })

  const updateMutation = useMutation<boolean, Error, IMJDObjectCreate>({
    mutationFn: updateMJDObject,
  })


  const onMutationSubmitClick = () => {

    if (mutationData.baseInfo.name == "") {
      toast.error("Не указано наименование объекта.")
      return
    }

    if (mutationData.baseInfo.status == "") {
      toast.error("Не указан статус объекта.")
      return
    }

    if (mutationData.supervisors.length == 0) {
      toast.error("Объект должен иметь хотя бы 1 супервайзера")
      return
    }

    if (mutationData.detailedInfo.model == "") {
      toast.error("Не указана модель объекта МЖД")
      return
    }

    if (mutationData.detailedInfo.amountEntrances == 0) {
      toast.error("Не указано количество подъездов")
      return
    }

    if (mutationData.detailedInfo.amountStores == 0) {
      toast.error("Не указано количество этажей")
      return
    }

    if (mutationType == "create") createMutation.mutate(mutationData, {
      onSuccess: () => {
        queryClient.invalidateQueries(["mjd-objects"])
        setShowMutationModal(false)
      }
    })

    if (mutationType == "update") updateMutation.mutate(mutationData, {
      onSuccess: () => {
        queryClient.invalidateQueries(["mjd-objects"])
        setShowMutationModal(false)
      }
    })
  }

  const onEditClick = (index: number) => {
    const supervisors = tableData[index].supervisors.map<IReactSelectOptions<number>>((value) => {
      const subIndex = avaiableSupervisors.findIndex((val) => val.label == value)!
      return avaiableSupervisors[subIndex]
    }).filter((val) => val)!

    setMutationData({
      baseInfo: {
        id: tableData[index].objectID,
        projectID: 0,
        objectDetailedID: tableData[index].objectDetailedID,
        name: tableData[index].name,
        status: tableData[index].status,
        type: "mjd_objects",
      },
      detailedInfo: {
        model: tableData[index].model,
        amountStores: tableData[index].amountStores,
        amountEntrances: tableData[index].amountEntrances,
        hasBasement: tableData[index].hasBasement,
      },
      supervisors: supervisors.map(val => val.value),
    })

    setselectedSupervisorsWorkerID(supervisors)

    setShowMutationModal(true)
    setMutationType("update")
  }

  const [showImportModal, setShowImportModal] = useState(false)

  const importMutation = useMutation<boolean, Error, File>({
    mutationFn: importMJD,
  })

  const acceptExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    importMutation.mutate(e.target.files[0], {
      onSuccess: () => {
        queryClient.invalidateQueries(["mjd-objects"])
        setShowImportModal(false)
      },
      onSettled: () => {
        e.target.value = ""
      },
      onError: (error) => {
        toast.error(`Импортированный файл имеет неправильные данные: ${error.message}`)
      }
    })
  }

  return (
    <main>
      <div className="mt-2 pl-2 flex space-x-2">
        <span className="text-3xl font-bold">Объекты - МЖД</span>
        <Button text="Импорт" onClick={() => setShowImportModal(true)} />
      </div>
      <table className="table-auto text-sm text-left mt-2 w-full border-box">
        <thead className="shadow-md border-t-2">
          <tr>
            <th className="px-4 py-3">
              <span>Наименование</span>
            </th>
            <th className="px-4 py-3">
              <span>Статус</span>
            </th>
            <th className="px-4 py-3">
              <span>Модель</span>
            </th>
            <th className="px-4 py-3 w-[110px]">
              <span>Кол-во подъездов</span>
            </th>
            <th className="px-4 py-3 w-[110px]">
              <span>Кол-во этажей</span>
            </th>
            <th className="px-4 py-3">
              <span>Наличие подвала</span>
            </th>
            <th className="px-4 py-3 w-[150px]">
              <span>Супервайзер</span>
            </th>
            <th className="px-4 py-3">
              <Button text="Добавить" onClick={() => {
                setMutationType("create")
                setShowMutationModal(true)
                setselectedSupervisorsWorkerID([])
                setMutationData({
                  baseInfo: {
                    id: 0,
                    projectID: 0,
                    objectDetailedID: 0,
                    type: "kl04kv_objects",
                    name: "",
                    status: "",
                  },
                  detailedInfo: {
                    model: "",
                    amountStores: 0,
                    amountEntrances: 0,
                    hasBasement: true,
                  },
                  supervisors: [],
                })
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
          {tableDataQuery.isSuccess && tableData.length != 0 &&
            tableData.map((row, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3">{row.status}</td>
                <td className="px-4 py-3">{row.model}</td>
                <td className="px-4 py-3">{row.amountStores}</td>
                <td className="px-4 py-3">{row.amountEntrances}</td>
                <td className="px-4 py-3">{row.hasBasement ? "Присутствует" : "Отсутствует"}</td>
                <td className="px-4 py-3">
                  {row.supervisors.reduce((acc, value) => acc + ", " + value)}
                </td>
                <td className="px-4 py-3 border-box flex space-x-3">
                  <Button text="Изменить" onClick={() => onEditClick(index)} />
                  <Button text="Удалить" buttonType="delete" onClick={() => onDeleteButtonClick(row)} />
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
      {showModal &&
        <DeleteModal {...modalProps}>
          <span>При подтверждении бригада под номером {modalProps.no_delivery} и все их данные будут удалены</span>
        </DeleteModal>
      }
      {showMutationModal &&
        <Modal setShowModal={setShowMutationModal}>
          <div>
            {mutationType == "create" && <span className="font-bold text-xl">Добавление объекта - МЖД</span>}
            {mutationType == "update" && <span className="font-bold text-xl">Изменение объекта - МЖД</span>}
          </div>
          <div className="flex flex-col space-y-2 py-2">
            <div className="flex flex-col space-y-1">
              <label htmlFor="name">Наименование</label>
              <Input
                name="name"
                type="text"
                value={mutationData.baseInfo.name}
                onChange={(e) => setMutationData({
                  ...mutationData,
                  baseInfo: {
                    ...mutationData.baseInfo,
                    name: e.target.value,
                  },
                })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label htmlFor="status">Статус</label>
              <Select
                className="basic-single text-black"
                classNamePrefix="select"
                isSearchable={true}
                isClearable={true}
                name={"object-status-select"}
                placeholder={""}
                value={{
                  label: mutationData.baseInfo.status,
                  value: mutationData.baseInfo.status,
                }}
                options={OBJECT_STATUSES_FOR_SELECT}
                onChange={(value) => setMutationData({
                  ...mutationData,
                  baseInfo: {
                    ...mutationData.baseInfo,
                    status: value?.value ?? "",
                  }
                })}
              />
            </div>
            <div>
              <label htmlFor="">Супервайзеры объекта</label>
              <Select
                className="basic-single text-black"
                classNamePrefix="select"
                isSearchable={true}
                isClearable={true}
                isMulti
                name={"supervisors-select"}
                placeholder={""}
                value={selectedSupervisorsWorkerID}
                options={avaiableSupervisors}
                onChange={(value) => {
                  setselectedSupervisorsWorkerID([...value])
                  setMutationData({
                    ...mutationData,
                    supervisors: value.map((val) => val.value),
                  })
                }}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label htmlFor="name">Модель</label>
              <Input
                name="model"
                type="text"
                value={mutationData.detailedInfo.model}
                onChange={(e) => setMutationData({
                  ...mutationData,
                  detailedInfo: {
                    ...mutationData.detailedInfo,
                    model: e.target.value,
                  },
                })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label htmlFor="name">Количество подъездом</label>
              <Input
                name="amountEntrances"
                type="number"
                value={mutationData.detailedInfo.amountEntrances}
                onChange={(e) => setMutationData({
                  ...mutationData,
                  detailedInfo: {
                    ...mutationData.detailedInfo,
                    amountEntrances: e.target.valueAsNumber,
                  },
                })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label htmlFor="name">Количество подъездом</label>
              <Input
                name="amountStores"
                type="number"
                value={mutationData.detailedInfo.amountStores}
                onChange={(e) => setMutationData({
                  ...mutationData,
                  detailedInfo: {
                    ...mutationData.detailedInfo,
                    amountStores: e.target.valueAsNumber,
                  },
                })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label htmlFor="amountEntrances">Присутсвует падвал?</label>
              <div className="flex space-x-3">
                <div className="flex space-x-1">
                  <input
                    type="radio"
                    name="hasBasement"
                    value={"1"}
                    onChange={() => setMutationData({
                      ...mutationData,
                      detailedInfo: {
                        ...mutationData.detailedInfo,
                        hasBasement: true,
                      }
                    })}
                    checked={mutationData.detailedInfo.hasBasement}
                    id="hasBasementTrue"
                  />
                  <label htmlFor="hasBasementTrue">Да</label>
                </div>
                <div className="flex space-x-1">
                  <input
                    type="radio"
                    name="hasBasement"
                    value={"2"}
                    onChange={() => setMutationData({
                      ...mutationData,
                      detailedInfo: {
                        ...mutationData.detailedInfo,
                        hasBasement: false,
                      }
                    })}
                    checked={!mutationData.detailedInfo.hasBasement}
                    id="hasBasementFalse"
                  />
                  <label htmlFor="hasBasementFalse">Нет</label>
                </div>
              </div>
            </div>

          </div>
          <div>
            <Button text="Опубликовать" onClick={() => onMutationSubmitClick()} />
          </div>
        </Modal>
      }
      {showImportModal &&
        <Modal setShowModal={setShowImportModal}>
          <span className="font-bold text-xl px-2 py-1">Импорт данных в Справочник - МЖД</span>
          <div className="grid grid-cols-2 gap-2 items-center px-2 pt-2">
            <Button text="Скачать шаблон" onClick={() => getMJDTemplateDocument()} />
            <div className="w-full">
              <label
                htmlFor="file"
                className="w-full text-white py-3 px-5 rounded-lg bg-gray-700 hover:bg-gray-800 hover:cursor-pointer"
              >
                Импортировать данные
              </label>
              <input
                name="file"
                type="file"
                id="file"
                onChange={(e) => acceptExcel(e)}
                className="hidden"
              />
            </div>
          </div>
          <span className="text-sm italic px-2 w-full text-center">При импортировке система будет следовать правилам шаблона</span>
        </Modal>
      }
    </main>
  )
}
