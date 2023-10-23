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
      deleteFunc: () => deleteMutation.mutate(row.id),
      no_delivery: row.name,
      setShowModal: setShowModal,
    })
  }

  //mutation CREATE AND EDIT logic
  const [showMutationModal, setShowMutationModal] = useState<boolean>(false)
  const [mutationModalType, setMutationModalType] = useState<null | "update" | "create">()
  const [materialMutationData, setMaterialMutationData] = useState<IObject>({
    id: 0,
    name: "",
    objectDetailedID: 0,
    status: "",
    supervisorWorkerID: 0,
    type: "",
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
      queryClient.invalidateQueries(["teams"])
      setShowMutationModal(false)
    }
  })
  const updateMaterialMutation = useMutation<IObject, Error, IObject>({
    mutationFn: updateObject,
    onSettled: () => {
      queryClient.invalidateQueries(["teams"])
      setShowMutationModal(false)
    }
  })
   const onMutationSubmit = () => {
    if (materialMutationData.name == "") setMutationModalErrors((prev) => ({...prev, name: true}))
    else setMutationModalErrors((prev) => ({...prev, name: false}))
    
    if (materialMutationData.objectDetailedID == 0) setMutationModalErrors((prev) => ({...prev, objectDetailedID: true}))
    else setMutationModalErrors((prev) => ({...prev, objectDetailedID: false}))
    
    if (materialMutationData.supervisorWorkerID == 0) setMutationModalErrors((prev) => ({...prev, supervisorWorkerID: true}))
    else setMutationModalErrors((prev) => ({...prev, supervisorWorkerID: false}))
    
    if (materialMutationData.status == "") setMutationModalErrors((prev) => ({...prev, status: true}))
    else setMutationModalErrors((prev) => ({...prev, status: false}))

    if (materialMutationData.type == "") setMutationModalErrors((prev) => ({...prev, type: true}))
    else setMutationModalErrors((prev) => ({...prev, type: false}))
    
    const isThereError = Object.keys(materialMutationData).some((value) => {
      if (materialMutationData[value as keyof typeof materialMutationData] == "" && value != "id") {
        return true
      }
    })
    if (isThereError) return
    
    switch(mutationModalType) {
      case "create":
        createMaterialMutation.mutate(materialMutationData)
        return
      case "update":
        updateMaterialMutation.mutate(materialMutationData)
        return
      
      default:
        throw new Error("Неправильная операция была выбрана")
    }
  }

  return (
    <main>
      <div className="mt-2 pl-2 flex space-x-2">
        <span className="text-3xl font-bold">Бригады</span>
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
                <td className="px-4 py-3">{row.type}</td>
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3">{row.status}</td>
                <td className="px-4 py-3">{row.supervisorName}</td>
                <td className="px-4 py-3 border-box flex space-x-3">
                  <Button text="Изменить" buttonType="default" onClick={() => {
                      setShowMutationModal(true)
                      setMutationModalType("update")
                      setMaterialMutationData({
                        id: row.id,
                        name: row.name,
                        objectDetailedID: row.objectDetailedID,
                        status: row.status,
                        supervisorWorkerID: row.id,
                        type: row.type,
                      })
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
                <label htmlFor="type">Категория объекта</label>
                <Input 
                  name="type"
                  type="text"
                  value={materialMutationData.type}
                  onChange={(e) => setMaterialMutationData({...materialMutationData, [e.target.name]: e.target.value})}
                />
                {mutationModalErrors.type && <span className="text-red-600 text-sm font-bold">Не указан тип объекта</span>}
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="name">Наименование</label>
                <Input 
                  name="name"
                  type="number"
                  value={materialMutationData.name}
                  onChange={(e) => setMaterialMutationData({...materialMutationData, [e.target.name]: Number(e.target.value)})}
                />
                {mutationModalErrors.name && <span className="text-red-600 text-sm font-bold">Не указано наименование объекта</span>}
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="supervisorWorkerID">Супервайзер</label>
                <Input 
                  name="supervisorWorkerID"
                  type="text"
                  value={materialMutationData.supervisorWorkerID}
                  onChange={(e) => setMaterialMutationData({...materialMutationData, [e.target.name]: e.target.value})}
                />
                {mutationModalErrors.supervisorWorkerID && <span className="text-red-600 text-sm font-bold">Не указан Супервайзер объекта</span>}
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="status">Статус</label>
                <Input 
                  name="status"
                  type="text"
                  value={materialMutationData.status}
                  onChange={(e) => setMaterialMutationData({...materialMutationData, [e.target.name]: e.target.value})}
                />
                {mutationModalErrors.status && <span className="text-red-600 text-sm font-bold">Не указана Статус объекта</span>}
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