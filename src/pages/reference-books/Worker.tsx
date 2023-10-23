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
  const [showMutationModal, setShowMutationModal] = useState<boolean>(false)
  const [mutationModalType, setMutationModalType] = useState<null | "update" | "create">()
  const [materialMutationData, setMaterialMutationData] = useState<IWorker>({
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
    if (materialMutationData.jobTitle == "") setMutationModalErrors((prev) => ({...prev, jobTitle: true}))
    else setMutationModalErrors((prev) => ({...prev, jobTitle: false}))
    
    if (materialMutationData.name == "") setMutationModalErrors((prev) => ({...prev, name: true}))
    else setMutationModalErrors((prev) => ({...prev, name: false}))

    if (materialMutationData.mobileNumber == "") setMutationModalErrors((prev) => ({...prev, mobileNumber: true}))
    else setMutationModalErrors((prev) => ({...prev, mobileNumber: false}))
    
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
                      setMaterialMutationData(row)
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
                  value={materialMutationData.name}
                  onChange={(e) => setMaterialMutationData({...materialMutationData, [e.target.name]: e.target.value})}
                />
                {mutationModalErrors.name && <span className="text-red-600 text-sm font-bold">Не указано имя работника</span>}
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="jobTitle">Должность</label>
                <Input 
                  name="jobTitle"
                  type="text"
                  value={materialMutationData.jobTitle}
                  onChange={(e) => setMaterialMutationData({...materialMutationData, [e.target.name]: e.target.value})}
                />
                {mutationModalErrors.jobTitle && <span className="text-red-600 text-sm font-bold">Не указана должность работника</span>}
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="mobileNumber">Номера телефона</label>
                <Input 
                  name="mobileNumber"
                  type="text"
                  value={materialMutationData.mobileNumber}
                  onChange={(e) => setMaterialMutationData({...materialMutationData, [e.target.name]: e.target.value})}
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