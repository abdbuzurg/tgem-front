import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Select from "react-select"
import { ITPObjectCreate, ITPObjectGetAllResponse, ITPObjectPaginated, createTPObject, deleteTPObject, getPaginatedTPObjects, updateTPObject } from "../../../services/api/tp_object"
import { ENTRY_LIMIT } from "../../../services/api/constants"
import { useEffect, useState } from "react"
import IReactSelectOptions from "../../../services/interfaces/react-select"
import IWorker from "../../../services/interfaces/worker"
import { getWorkerByJobTitle } from "../../../services/api/worker"
import toast from "react-hot-toast"
import Button from "../../../components/UI/button"
import LoadingDots from "../../../components/UI/loadingDots"
import DeleteModal from "../../../components/deleteModal"
import Modal from "../../../components/Modal"
import Input from "../../../components/UI/Input"
import { OBJECT_STATUSES_FOR_SELECT } from "../../../services/lib/objectStatuses"

export default function TPObject() {

  //PAGINATED DATA
  const tableDataQuery = useInfiniteQuery<ITPObjectGetAllResponse, Error>({
    queryKey: ["tp-object"],
    queryFn: ({ pageParam }) => getPaginatedTPObjects({ pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page * ENTRY_LIMIT > lastPage.count) return undefined
      return lastPage.page + 1
    }
  })
  const [tableData, setTableData] = useState<ITPObjectPaginated[]>([])
  useEffect(() => {
    if (tableDataQuery.isSuccess && tableDataQuery.data) {
      const data: ITPObjectPaginated[] = tableDataQuery.data.pages.reduce<ITPObjectPaginated[]>((acc, page) => [...acc, ...page.data], [])
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
    mutationFn: deleteTPObject,
    onSuccess: () => {
      queryClient.invalidateQueries(["tp-object"])
    }
  })
  const [modalProps, setModalProps] = useState({
    setShowModal: setShowModal,
    no_delivery: "",
    deleteFunc: () => { }
  })
  const onDeleteButtonClick = (row: ITPObjectPaginated) => {
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

  const [mutationData, setMutationData] = useState<ITPObjectCreate>({
    baseInfo: {
      id: 0,
      projectID: 0,
      objectDetailedID: 0,
      type: "stvt_object",
      name: "",
      status: "",
    },
    detailedInfo: {
      model: "",
      voltageClass: "",
      nourashes: "",
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

  const createMutation = useMutation<boolean, Error, ITPObjectCreate>({
    mutationFn: createTPObject,
  })

  const updateMutation = useMutation<boolean, Error, ITPObjectCreate>({
    mutationFn: updateTPObject,
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
      toast.error("Не указан модель ТП")
      return
    }

    if (mutationData.detailedInfo.voltageClass == "") {
      toast.error("Не указан класс напряжения")
      return
    }

    if (mutationData.detailedInfo.nourashes == "") {
      toast.error("Не указано питание объекта ТП")
      return
    }

    if (mutationType == "create") createMutation.mutate(mutationData, {
      onSuccess: () => {
        queryClient.invalidateQueries(["tp-object"])
        setShowMutationModal(false)
      }
    })

    if (mutationType == "update") updateMutation.mutate(mutationData, {
      onSuccess: () => {
        queryClient.invalidateQueries(["tp-object"])
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
        type: "stvt_objects",
      },
      detailedInfo: {
        model: tableData[index].model,
        voltageClass: tableData[index].voltageClass,
        nourashes: tableData[index].nourashes,
      },
      supervisors: supervisors.map(val => val.value),
    })

    setselectedSupervisorsWorkerID(supervisors)

    setShowMutationModal(true)
    setMutationType("update")
  }

  return (
    <main>
      <div className="mt-2 pl-2 flex space-x-2">
        <span className="text-3xl font-bold">Объекты - СТВТ</span>
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
            <th className="px-4 py-3">
              <span>Класс Напряжения</span>
            </th>
            <th className="px-4 py-3">
              <span>Питает</span>
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
                    type: "tp_objects",
                    name: "",
                    status: "",
                  },
                  detailedInfo: {
                    model: "",
                    voltageClass: "",
                    nourashes: "",
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
                <td className="px-4 py-3">{row.voltageClass}</td>
                <td className="px-4 py-3">{row.nourashes}</td>
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
            {mutationType == "create" && <span className="font-bold text-xl">Добавление объекта - ТП</span>}
            {mutationType == "update" && <span className="font-bold text-xl">Изменение объекта - ТП</span>}
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
              <label htmlFor="name">Класс Напряжения</label>
              <Input
                name="voltageClass"
                type="text"
                value={mutationData.detailedInfo.voltageClass}
                onChange={(e) => setMutationData({
                  ...mutationData,
                  detailedInfo: {
                    ...mutationData.detailedInfo,
                    voltageClass: e.target.value,
                  },
                })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label htmlFor="name">Питает</label>
              <Input
                name="nourashes"
                type="text"
                value={mutationData.detailedInfo.nourashes}
                onChange={(e) => setMutationData({
                  ...mutationData,
                  detailedInfo: {
                    ...mutationData.detailedInfo,
                    nourashes: e.target.value,
                  },
                })}
              />
            </div>
          </div>
          <div>
            <Button text="Опубликовать" onClick={() => onMutationSubmitClick()} />
          </div>
        </Modal>
      }
    </main>
  )
}
