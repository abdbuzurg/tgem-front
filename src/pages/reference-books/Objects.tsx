import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { ENTRY_LIMIT } from "../../services/api/constants"
import getPaginatedObjects, { IObjectGetAllResponse, IObjectPaginated } from "../../services/api/objects/getPaginated"
import deleteObject from "../../services/api/objects/delete"
import { IObject } from "../../services/interfaces/objects"
import createObject from "../../services/api/objects/create"
import updateObject from "../../services/api/objects/update"
import Input from "../../components/UI/Input"
import Modal from "../../components/Modal"
import Button from "../../components/UI/button"
import LoadingDots from "../../components/UI/loadingDots"
import DeleteModal from "../../components/deleteModal"
import WorkerSelect from "../../components/WorkerSelect"
import IReactSelectOptions from "../../services/interfaces/react-select"
import Select from "react-select"

const objectTypes = [        
  {label:"КЛ 04 КВ", value: "kl04kv_objects"},
  {label:"МЖД", value: "mjd_objects"},
  {label:"СИП", value: "sip_objects"},
  {label:"СТВТ", value: "stvt_objects"},
  {label:"ТП", value: "tp_objects"},
]

export default function Objects() {
  //fetching data logic
  const tableDataQuery = useInfiniteQuery<IObjectGetAllResponse, Error>({
    queryKey: ["objects"],
    queryFn: ({pageParam}) => getPaginatedObjects({pageParam}),
    getNextPageParam: (lastPage) => {
      if (lastPage.page * ENTRY_LIMIT > lastPage.count) return undefined
      return lastPage.page + 1
    }
  })
  const [tableData, setTableData] = useState<IObjectPaginated[]>([])
  useEffect(() => {
    if (tableDataQuery.isSuccess && tableDataQuery.data) {
      const data: IObjectPaginated[] = tableDataQuery.data.pages.reduce<IObjectPaginated[]>((acc, page) => [...acc, ...page.data], [])
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
    mutationFn: deleteObject,
    onSuccess: () => {
      queryClient.invalidateQueries(["objects"])
    }
  })
  const [modalProps, setModalProps] = useState({
    setShowModal: setShowModal,
    no_delivery: "",
    deleteFunc: () => {}
  })
  const onDeleteButtonClick = (row: IObjectPaginated) => {
    setShowModal(true)
    setModalProps({
      deleteFunc: () => deleteMutation.mutate(row.object.id),
      no_delivery: row.object.name,
      setShowModal: setShowModal,
    })
  }

  //mutation CREATE AND EDIT logic
  const [showMutationModal, setShowMutationModal] = useState<boolean>(false)
  const [mutationModalType, setMutationModalType] = useState<null | "update" | "create">()

  const [selectedSupervisorWorkerID, setSupervisorWorkerID] = useState<IReactSelectOptions<number>>({label:"", value: 0})
  const [selectedObjectType, setSelectedObjectType] = useState<IReactSelectOptions<string>>({label: "", value: ""}) 

  const onSelectObjectType = (value: null | IReactSelectOptions<string>) => {
    if (!value) {
      setSelectedObjectType({label: "", value: ""})
      setMutationData({...mutationData, type: ""})
      return
    }

    setSelectedObjectType(value)
    setMutationData({...mutationData, type: value.value})
  }

  useEffect(() => {
      setMutationData({...mutationData, supervisorWorkerID: selectedSupervisorWorkerID.value})
  }, [selectedSupervisorWorkerID])

  const [mutationData, setMutationData] = useState<IObject>({
    id: 0,
    name: "",
    objectDetailedID: 0,
    status: "",
    supervisorWorkerID: 0,
    type: "",
  })
  const [secondaryMutationData, setSecondaryMutation] = useState({
    model: "",
    amountStores: 0,
    amountEntrances: 0,
    hasBasement: true,
    voltageClass: "",
    nourashes: "",
    ttCoefficient: "",
    amountFeeders: "",
    length: 0,
  })
  const [mutationModalErrors, setMutationModalErrors] = useState({
    name: false,
    objectDetailedID: false,
    status: false,
    supervisorWorkerID: false,
    type: false,
  })
  const createMaterialMutation = useMutation<IObject, Error, IObject>({
    mutationFn: createObject,
    onSettled: () => {
      queryClient.invalidateQueries(["objects"])
      setShowMutationModal(false)
    }
  })
  const updateMaterialMutation = useMutation<IObject, Error, IObject>({
    mutationFn: updateObject,
    onSettled: () => {
      queryClient.invalidateQueries(["objects"])
      setShowMutationModal(false)
    }
  })
   const onMutationSubmit = () => {
    if (mutationData.name == "") setMutationModalErrors((prev) => ({...prev, name: true}))
    else setMutationModalErrors((prev) => ({...prev, name: false}))
    
    if (mutationData.supervisorWorkerID == 0) setMutationModalErrors((prev) => ({...prev, supervisorWorkerID: true}))
    else setMutationModalErrors((prev) => ({...prev, supervisorWorkerID: false}))
    
    if (mutationData.status == "") setMutationModalErrors((prev) => ({...prev, status: true}))
    else setMutationModalErrors((prev) => ({...prev, status: false}))

    if (mutationData.type == "") setMutationModalErrors((prev) => ({...prev, type: true}))
    else setMutationModalErrors((prev) => ({...prev, type: false}))
    
    const isThereError = Object.keys(mutationData).some((value) => {
      if (mutationData[value as keyof typeof mutationData] == "" && value != "id" && value != "objectDetailedID") {
        return true
      }
    })
    console.log(mutationData)
    if (isThereError) return
    
    switch(mutationModalType) {
      case "create":
        createMaterialMutation.mutate({...mutationData, ...secondaryMutationData})
        return
      case "update":
        updateMaterialMutation.mutate(mutationData)
        return
      
      default:
        throw new Error("Неправильная операция была выбрана")
    }
  }

  return (
    <main>
      <div className="mt-2 pl-2 flex space-x-2">
        <span className="text-3xl font-bold">Объекты</span>
      </div>
      <table className="table-auto text-sm text-left mt-2 w-full border-box">
        <thead className="shadow-md border-t-2">
          <tr>
            <th className="px-4 py-3 w-[150px]">
              <span>Тип</span>
            </th>
            <th className="px-4 py-3">
              <span>Наименование</span>
            </th>
            <th className="px-4 py-3">
              <span>Статус</span>
            </th>
            <th className="px-4 py-3 w-[150px]">
              <span>Супервайзер</span>
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
                <td className="px-4 py-3">{row.object.type}</td>
                <td className="px-4 py-3">{row.object.name}</td>
                <td className="px-4 py-3">{row.object.status}</td>
                <td className="px-4 py-3">{row.supervisorName}</td>
                <td className="px-4 py-3 border-box flex space-x-3">
                  <Button text="Изменить" buttonType="default" onClick={() => {
                      setShowMutationModal(true)
                      setMutationModalType("update")
                      setMutationData({
                        id: row.object.id,
                        name: row.object.name,
                        objectDetailedID: row.object.objectDetailedID,
                        status: row.object.status,
                        supervisorWorkerID: row.object.supervisorWorkerID,
                        type: row.object.type,
                      })
                      setSelectedObjectType({label: row.object.type, value: row.object.type})
                      setSupervisorWorkerID({label: row.supervisorName, value: row.object.supervisorWorkerID})
                    }}
                  />
                  <Button text="Удалить" buttonType="delete" onClick={() => onDeleteButtonClick(row)}/>
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
          <div className="">
            <h3 className="text-xl font-medium text-gray-800">
              {mutationModalType == "create" && "Добавление матераила"}
              {mutationModalType == "update" && "Изменение матераила"}
            </h3>
            <div className="flex flex-col space-y-3 mt-2">
              <div className="flex flex-col space-y-1">
                <label htmlFor="type">Тип объекта</label>
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  isClearable={true}
                  name={"objects"}
                  placeholder={""}
                  value={selectedObjectType}
                  options={objectTypes}
                  onChange={(value) => onSelectObjectType(value)}
                />
                {mutationModalErrors.type && <span className="text-red-600 text-sm font-bold">Не указан тип объекта</span>}
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="name">Наименование</label>
                <Input 
                  name="name"
                  type="text"
                  value={mutationData.name}
                  onChange={(e) => setMutationData({...mutationData, [e.target.name]: e.target.value})}
                />
                {mutationModalErrors.name && <span className="text-red-600 text-sm font-bold">Не указано наименование объекта</span>}
              </div>
              <WorkerSelect 
                jobTitle="Супервайзер"
                title="Супервайзер объекта"
                selectedWorkerID={selectedSupervisorWorkerID}
                setSelectedWorkerID={setSupervisorWorkerID}
              />
              {mutationModalErrors.supervisorWorkerID && <span className="text-red-600 text-sm font-bold">Не указан указан Супервайзер объекта</span>}
              <div className="flex flex-col space-y-1">
                <label htmlFor="status">Статус</label>
                <Input 
                  name="status"
                  type="text"
                  value={mutationData.status}
                  onChange={(e) => setMutationData({...mutationData, [e.target.name]: e.target.value})}
                />
                {mutationModalErrors.status && <span className="text-red-600 text-sm font-bold">Не указана Статус объекта</span>}
              </div>
              {(selectedObjectType.value == "mjd_objects" || selectedObjectType.value == "tp_objects") && 
                <div className="flex flex-col space-y-1">
                  <label htmlFor="model">Тип</label>
                  <Input 
                    name="model"
                    type="text"
                    value={secondaryMutationData.model}
                    onChange={(e) => setSecondaryMutation({...secondaryMutationData, [e.target.name]: e.target.value})}
                  />
                </div>
              }
              {selectedObjectType.value == "mjd_objects" &&
                <div className="flex flex-col space-y-1">
                  <label htmlFor="amountStores">Количество этажей</label>
                  <Input 
                    name="amountStores"
                    type="number"
                    value={secondaryMutationData.amountStores}
                    onChange={(e) => setSecondaryMutation({...secondaryMutationData, [e.target.name]: +e.target.value})}
                  />
                </div>
              }
              {selectedObjectType.value == "mjd_objects" &&
                <div className="flex flex-col space-y-1">
                  <label htmlFor="amountEntrances">Количество подъездов</label>
                  <Input 
                    name="amountEntrances"
                    type="number"
                    value={secondaryMutationData.amountEntrances}
                    onChange={(e) => setSecondaryMutation({...secondaryMutationData, [e.target.name]: +e.target.value})}
                  />
                </div>
              }
              {selectedObjectType.value == "mjd_objects" &&
                <div className="flex flex-col space-y-1">
                  <label htmlFor="amountEntrances">Присутсвует падвал?</label>
                  <div className="flex space-x-3">
                    <div className="flex space-x-1">
                      <input 
                        type="radio"
                        name="hasBasement" 
                        value={"1"}
                        onChange={() => setSecondaryMutation({...secondaryMutationData, hasBasement: true})}
                        checked={secondaryMutationData.hasBasement}
                        id="hasBasementTrue"
                      />
                      <label htmlFor="hasBasementTrue">Да</label>
                    </div>
                    <div className="flex space-x-1">
                      <input 
                        type="radio"
                        name="hasBasement" 
                        value={"1"}
                        onChange={() => setSecondaryMutation({...secondaryMutationData, hasBasement: false})}
                        checked={!secondaryMutationData.hasBasement}
                        id="hasBasementFalse"
                      />
                      <label htmlFor="hasBasementFalse">Нет</label>
                    </div>
                  </div>
                </div>
              }
              {(selectedObjectType.value == "tp_objects" || selectedObjectType.value == "stvt_objects") &&
                <div className="flex flex-col space-y-1">
                  <label htmlFor="voltageClass">Класс напряжения</label>
                  <Input 
                    name="voltageClass"
                    type="text"
                    value={secondaryMutationData.voltageClass}
                    onChange={(e) => setSecondaryMutation({...secondaryMutationData, [e.target.name]: e.target.value})}
                  />
                </div>
              }
              {(selectedObjectType.value == "tp_objects" || selectedObjectType.value == "kl04kv_objects") &&
                <div className="flex flex-col space-y-1">
                  <label htmlFor="nourashes">Питает</label>
                  <Input 
                    name="nourashes"
                    type="text"
                    value={secondaryMutationData.nourashes}
                    onChange={(e) => setSecondaryMutation({...secondaryMutationData, [e.target.name]: e.target.value})}
                  />
                </div>
              }
              {selectedObjectType.value =="stvt_objects" && 
                <div className="flex flex-col space-y-1">
                  <label htmlFor="ttCoefficient">ТТ Коэффицент</label>
                  <Input 
                    name="ttCoefficient"
                    type="text"
                    value={secondaryMutationData.ttCoefficient}
                    onChange={(e) => setSecondaryMutation({...secondaryMutationData, [e.target.name]: e.target.value})}
                  />
                </div>
              }
              {selectedObjectType.value =="sip_objects" && 
                <div className="flex flex-col space-y-1">
                  <label htmlFor="amountFeeders">Количество питащих</label>
                  <Input 
                    name="amountFeeders"
                    type="number"
                    value={secondaryMutationData.amountFeeders}
                    onChange={(e) => setSecondaryMutation({...secondaryMutationData, [e.target.name]: +e.target.value})}
                  />
                </div>
              }
              {selectedObjectType.value =="kl04kv_objects" && 
                <div className="flex flex-col space-y-1">
                  <label htmlFor="length">Длина</label>
                  <Input 
                    name="length"
                    type="text"
                    value={secondaryMutationData.length}
                    onChange={(e) => setSecondaryMutation({...secondaryMutationData, [e.target.name]: +e.target.value})}
                  />
                </div>
              }
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