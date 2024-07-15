import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Select from "react-select"
import { ITPObjectCreate, ITPObjectGetAllResponse, ITPObjectPaginated, createTPObject, deleteTPObject, getPaginatedTPObjects, getTPTemplateDocument, importTP, updateTPObject } from "../../../services/api/tp_object"
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
import { OBJECT_STATUSES_FOR_SELECT, TP_OBJECT_MODELS_FOR_SELECT, TP_OBJECT_VOLTAGE_CLASS_FOR_SELECT } from "../../../services/lib/objectStatuses"
import { ITeam } from "../../../services/interfaces/teams"
import { getAllTeams } from "../../../services/api/team"
import arrayListToString from "../../../services/lib/arrayListToStringWithCommas"

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
    teams: [],
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

  const [selectedTeamID, setSelectedTeamID] = useState<IReactSelectOptions<number>[]>([])
  const [availableTeams, setAvailableTeams] = useState<IReactSelectOptions<number>[]>([])
  const teamsQuery = useQuery<ITeam[], Error, ITeam[]>({
    queryKey: ["all-teams"],
    queryFn: () => getAllTeams()
  })
  useEffect(() => {
    if (teamsQuery.isSuccess && teamsQuery.data) {
      setAvailableTeams([
        ...teamsQuery.data.map<IReactSelectOptions<number>>((val) => ({ label: val.number, value: val.id }))
      ])
    }
  }, [teamsQuery.data])



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

    const teams = tableData[index].teams.map<IReactSelectOptions<number>>((value) => {
      const subIndex = availableTeams.findIndex((val) => val.label == value)!
      return availableTeams[subIndex]
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
      teams: teams.map(val => val.value)
    })

    setselectedSupervisorsWorkerID(supervisors)
    setSelectedTeamID(teams)

    setShowMutationModal(true)
    setMutationType("update")
  }

  const [showImportModal, setShowImportModal] = useState(false)

  const importMutation = useMutation<boolean, Error, File>({
    mutationFn: importTP,
  })

  const acceptExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    importMutation.mutate(e.target.files[0], {
      onSuccess: () => {
        queryClient.invalidateQueries(["tp-object"])
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
        <span className="text-3xl font-bold">Объекты - ТП</span>
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
            <th className="px-4 py-3">
              <span>Класс Напряжения</span>
            </th>
            <th className="px-4 py-3">
              <span>Питает</span>
            </th>
            <th className="px-4 py-3 w-[150px]">
              <span>Супервайзер</span>
            </th>
            <th className="px-4 py-3 w-[150px]">
              <span>Бригады</span>
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
                  teams: [],
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
                <td className="px-4 py-3">{arrayListToString(row.supervisors)}</td>
                <td className="px-4 py-3">{arrayListToString(row.teams)}</td>
                <td className="px-4 py-3 border-box flex space-x-3">
                  <Button text="Изменить" onClick={() => onEditClick(index)} />
                  <Button text="Удалить" buttonType="delete" onClick={() => onDeleteButtonClick(row)} />
                </td>
              </tr>
            ))
          }
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
              <label htmlFor="name">Наименование<span className="text-red-600">*</span></label>
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
              <label htmlFor="status">Статус<span className="text-red-600">*</span></label>
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
            <div>
              <label htmlFor="">Бригады</label>
              <Select
                className="basic-single text-black"
                classNamePrefix="select"
                isSearchable={true}
                isClearable={true}
                isMulti
                name={"supervisors-select"}
                placeholder={""}
                value={selectedTeamID}
                options={availableTeams}
                onChange={(value) => {
                  setSelectedTeamID([...value])
                  setMutationData({
                    ...mutationData,
                    teams: value.map((val) => val.value),
                  })
                }}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label htmlFor="name">Тип<span className="text-red-600">*</span></label>
              <Select
                className="basic-single text-black"
                classNamePrefix="select"
                isSearchable={true}
                isClearable={true}
                name={"object-status-select"}
                placeholder={""}
                value={{
                  label: mutationData.detailedInfo.model,
                  value: mutationData.detailedInfo.model,
                }}
                options={TP_OBJECT_MODELS_FOR_SELECT}
                onChange={(value) => setMutationData({
                  ...mutationData,
                  detailedInfo: {
                    ...mutationData.detailedInfo,
                    model: value?.value ?? "",
                  }
                })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label htmlFor="name">Класс Напряжения<span className="text-red-600">*</span></label>
              <Select
                className="basic-single text-black"
                classNamePrefix="select"
                isSearchable={true}
                isClearable={true}
                name={"object-status-select"}
                placeholder={""}
                value={{
                  label: mutationData.detailedInfo.voltageClass,
                  value: mutationData.detailedInfo.voltageClass,
                }}
                options={TP_OBJECT_VOLTAGE_CLASS_FOR_SELECT}
                onChange={(value) => setMutationData({
                  ...mutationData,
                  detailedInfo: {
                    ...mutationData.detailedInfo,
                    voltageClass: value?.value ?? "",
                  }
                })}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label htmlFor="name">Питает<span className="text-red-600">*</span></label>
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
      {showImportModal &&
        <Modal setShowModal={setShowImportModal}>
          <span className="font-bold text-xl px-2 py-1">Импорт данных в Справочник - ТП</span>
          <div className="grid grid-cols-2 gap-2 items-center px-2 pt-2">
            <Button text="Скачать шаблон" onClick={() => getTPTemplateDocument()} />
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
