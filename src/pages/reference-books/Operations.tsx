import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ENTRY_LIMIT } from "../../services/api/constants";
import { useEffect, useState } from "react";
import Button from "../../components/UI/button";
import LoadingDots from "../../components/UI/loadingDots";
import DeleteModal from "../../components/deleteModal";
import Modal from "../../components/Modal";
import Input from "../../components/UI/Input";
import getPaginatedOperations, { OperationGetAllResponse } from "../../services/api/operations/getAllPaginated";
import { IOperation } from "../../services/interfaces/operation";
import deleteOperation from "../../services/api/operations/delete";
import createOperation from "../../services/api/operations/create";
import updateOperation from "../../services/api/operations/update";

export default function Operatons() {
  //fetching data logic
  const tableDataQuery = useInfiniteQuery<OperationGetAllResponse, Error>({
    queryKey: ["operations"],
    queryFn: ({ pageParam }) => getPaginatedOperations({pageParam}),
    getNextPageParam: (lastPage) => {
      if (lastPage.page * ENTRY_LIMIT > lastPage.count) return undefined
      return lastPage.page + 1
    }
  })
  const [tableData, setTableData] = useState<IOperation[]>([])
  useEffect(() => {
    if (tableDataQuery.isSuccess && tableDataQuery.data) {
      const data: IOperation[] = tableDataQuery.data.pages.reduce<IOperation[]>((acc, page) => [...acc, ...page.data], [])
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
    mutationFn: deleteOperation,
    onSuccess: () => {
      queryClient.invalidateQueries(["operations"])
    }
  })
  const [modalProps, setModalProps] = useState({
    setShowModal: setShowDeleteModal,
    no_delivery: "",
    deleteFunc: () => {}
  })
  const onDeleteButtonClick = (row: IOperation) => {
    setShowDeleteModal(true)
    setModalProps({
      deleteFunc: () => deleteMutation.mutate(row.id),
      no_delivery: row.name,
      setShowModal: setShowDeleteModal,
    })
  }

  //mutation CREATE AND EDIT logic
  const [showMutationModal, setShowMutationModal] = useState<boolean>(false)
  const [mutationModalType, setMutationModalType] = useState<null | "update" | "create">()
  const [materialMutationData, setMaterialMutationData] = useState<IOperation>({
    id: 0,
    code: "",
    costPrime: 0,
    costWithCustomer: 0,
    name: "",
  })
  const [mutationModalErrors, setMutationModalErrors] = useState({
    costPrime: false,
    costWithCustomer: false,
    name: false,
  })
  const createMaterialMutation = useMutation<IOperation, Error, IOperation>({
    mutationFn: createOperation,
    onSettled: () => {
      queryClient.invalidateQueries(["operations"])
      setShowMutationModal(false)
    }
  })
  const updateMaterialMutation = useMutation<IOperation, Error, IOperation>({
    mutationFn: updateOperation,
    onSettled: () => {
      queryClient.invalidateQueries(["operations"])
      setShowMutationModal(false)
    }
  })
   const onMutationSubmit = () => {
    if (materialMutationData.costPrime <= 0) setMutationModalErrors((prev) => ({...prev, costPrime: true}))
    else setMutationModalErrors((prev) => ({...prev, costPrime: false}))
    
    if (materialMutationData.name == "") setMutationModalErrors((prev) => ({...prev, name: true}))
    else setMutationModalErrors((prev) => ({...prev, name: false}))

    if (materialMutationData.costWithCustomer <= 0) setMutationModalErrors((prev) => ({...prev, costWithCustomer: true}))
    else setMutationModalErrors((prev) => ({...prev, costWithCustomer: false}))
    
    const isThereError = Object.keys(materialMutationData).some((value) => {
      if (materialMutationData[value as keyof typeof materialMutationData] == "" && value != "id" && value != "code") {
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
        <span className="text-3xl font-bold">Сервисы</span>
      </div>
      <table className="table-auto text-sm text-left mt-2 w-full border-box">
        <thead className="shadow-md border-t-2">
          <tr>
            <th className="px-4 py-3 w-[350px]">
              <span>Код</span>
            </th>
            <th className="px-4 py-3">
              <span>Наименование</span>
            </th>
            <th className="px-4 py-3">
              <span>Изначальная цена</span>
            </th>
            <th className="px-4 py-3">
              <span>Цена с заказчиком</span>
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
                <td className="px-4 py-3">{row.code}</td>
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3">{row.costPrime}</td>
                <td className="px-4 py-3">{row.costWithCustomer}</td>
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
              {mutationModalType == "create" && "Добавление сервиса"}
              {mutationModalType == "update" && "Изменение сервиса"}
            </h3>
            <div className="flex flex-col space-y-3 mt-2">
              <div className="flex flex-col space-y-1">
                <label htmlFor="name">Наименование</label>
                <Input 
                  name="name"
                  type="text"
                  value={materialMutationData.name}
                  onChange={(e) => setMaterialMutationData({...materialMutationData, [e.target.name]: e.target.value})}
                />
                {mutationModalErrors.name && <span className="text-red-600 text-sm font-bold">Не указано наименоваие сервиса</span>}
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="costPrime">Изначальная Цена</label>
                <Input 
                  name="costPrime"
                  type="number"
                  value={materialMutationData.costPrime}
                  onChange={(e) => setMaterialMutationData({...materialMutationData, [e.target.name]: e.target.value})}
                />
                {mutationModalErrors.costPrime && <span className="text-red-600 text-sm font-bold">Не указана изначальная цена за сервис</span>}
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="costWithCustomer">Цена с заказчиком</label>
                <Input 
                  name="costWithCustomer"
                  type="text"
                  value={materialMutationData.costWithCustomer}
                  onChange={(e) => setMaterialMutationData({...materialMutationData, [e.target.name]: e.target.value})}
                />
                {mutationModalErrors.costWithCustomer && <span className="text-red-600 text-sm font-bold">Не указана цена с заказчиком</span>}
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