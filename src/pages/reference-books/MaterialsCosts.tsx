import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import getPaginatedMaterialCost, { MaterialCostGetAllResponse } from "../../services/api/materialscosts/getAllPaginated"
import { ENTRY_LIMIT } from "../../services/api/constants"
import { useEffect, useState } from "react"
import { IMaterialCost, IMaterialCostView } from "../../services/interfaces/materialCost"
import createMaterialCost from "../../services/api/materialscosts/create"
import deleteMaterialCost from "../../services/api/materialscosts/delete"
import updateMaterialCost from "../../services/api/materialscosts/update"
import Button from "../../components/UI/button"
import LoadingDots from "../../components/UI/loadingDots"
import DeleteModal from "../../components/deleteModal"
import Modal from "../../components/Modal"
import Input from "../../components/UI/Input"
import Select from "react-select"
import IReactSelectOptions from "../../services/interfaces/react-select"
import Material from "../../services/interfaces/material"
import getAllMaterials from "../../services/api/materials/getAll"

export default function MaterialsCosts() {
  //fetching data logic
  const tableDataQuery = useInfiniteQuery<MaterialCostGetAllResponse, Error>({
    queryKey: ["materials-costs"],
    queryFn: ({ pageParam }) => getPaginatedMaterialCost({pageParam}),
    getNextPageParam: (lastPage) => {
      if (lastPage.page * ENTRY_LIMIT > lastPage.count) return undefined
      return lastPage.page + 1
    }
  })
  const [tableData, setTableData] = useState<IMaterialCostView[]>([])
  useEffect(() => {
    if (tableDataQuery.isSuccess && tableDataQuery.data) {
      const data: IMaterialCostView[] = tableDataQuery.data.pages.reduce<IMaterialCostView[]>((acc, page) => [...acc, ...page.data], [])
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
    mutationFn: deleteMaterialCost,
    onSuccess: () => {
      queryClient.invalidateQueries(["materials-costs"])
    }
  })
  const [modalProps, setModalProps] = useState({
    setShowModal: setShowDeleteModal,
    no_delivery: "",
    deleteFunc: () => {}
  })
  const onDeleteButtonClick = (row: IMaterialCostView) => {
    setShowDeleteModal(true)
    setModalProps({
      deleteFunc: () => deleteMutation.mutate(row.id),
      no_delivery: row.materialName,
      setShowModal: setShowDeleteModal,
    })
  }

  //mutation CREATE AND EDIT logic
  const [selectedMaterial, setSelectedMaterial] = useState<IReactSelectOptions<number>>({label:"", value: 0})
  const [allMaterials, setAllMaterials] = useState<IReactSelectOptions<number>[]>([])
  const allMaterialQuery = useQuery<Material[], Error>({
    queryKey: ["material-all"],
    queryFn: getAllMaterials,
  })
  useEffect(() => {
    if (allMaterialQuery.isSuccess && allMaterialQuery.data) {
      setAllMaterials(allMaterialQuery.data.map<IReactSelectOptions<number>>((v) => ({value: v.id, label: v.name})))
    }
  }, [allMaterialQuery.isSuccess])
  const onMaterialSelect = (value: IReactSelectOptions<number> | null) => {
    if (!value) {
      setSelectedMaterial({value: 0, label: ""})
      setMutationData({...mutationData, materialID: 0})
      return
    }

    setMutationData({...mutationData, materialID: value.value})
    setSelectedMaterial(value)
  }
  
  const [showMutationModal, setShowMutationModal] = useState<boolean>(false)
  const [mutationModalType, setMutationModalType] = useState<null | "update" | "create">()
  const [mutationData, setMutationData] = useState<IMaterialCost>({
    id: 0,
    costPrime: 0,
    costWithCustomer: 0,
    costM19: 0,
    materialID: 0,
  })
  const [mutationModalErrors, setMutationModalErrors] = useState({
    costPrime: false,
    costWithCustomer: false,
    costM19: false,
    materialID: false,
  })
  const createMaterialMutation = useMutation<IMaterialCost, Error, IMaterialCost>({
    mutationFn: createMaterialCost,
    onSettled: () => {
      queryClient.invalidateQueries(["materials-costs"])
      setShowMutationModal(false)
    }
  })
  const updateMaterialMutation = useMutation<IMaterialCost, Error, IMaterialCost>({
    mutationFn: updateMaterialCost,
    onSettled: () => {
      queryClient.invalidateQueries(["materials-costs"])
      setShowMutationModal(false)
    }
  })
  const onMutationSubmit = () => {
    console.log(mutationData)

    if (mutationData.costPrime <= 0) setMutationModalErrors((prev) => ({...prev, costPrime: true}))
    else setMutationModalErrors((prev) => ({...prev, costPrime: false}))
    
    if (mutationData.materialID == 0) setMutationModalErrors((prev) => ({...prev, materialID: true}))
    else setMutationModalErrors((prev) => ({...prev, materialID: false}))

    if (mutationData.costWithCustomer <= 0) setMutationModalErrors((prev) => ({...prev, costWithCustomer: true}))
    else setMutationModalErrors((prev) => ({...prev, costWithCustomer: false}))

    if (mutationData.costM19 <= 0) setMutationModalErrors((prev) => ({...prev, costM19: true}))
    else setMutationModalErrors((prev) => ({...prev, costM19: false}))
    
    const isThereError = Object.keys(mutationData).some((value) => {
      if (mutationData[value as keyof typeof mutationData] == 0 && value != "id") {
        return true
      }
    })
    if (isThereError) return
    
    switch(mutationModalType) {
      case "create":
        createMaterialMutation.mutate(mutationData)
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
        <span className="text-3xl font-bold">Ценники Материалов</span>
      </div>
      <table className="table-auto text-sm text-left mt-2 w-full border-box">
        <thead className="shadow-md border-t-2">
          <tr>
            <th className="px-4 py-3 w-[350px]">
              <span>Наименование материала</span>
            </th>
            <th className="px-4 py-3">
              <span>Изначальная цена</span>
            </th>
            <th className="px-4 py-3">
              <span>Цена М19</span>
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
                <td className="px-4 py-3">{row.materialName}</td>
                <td className="px-4 py-3">{row.costPrime}</td>
                <td className="px-4 py-3">{row.costM19}</td>
                <td className="px-4 py-3">{row.costWithCustomer}</td>
                <td className="px-4 py-3 border-box flex space-x-3">
                  <Button text="Изменить" buttonType="default" onClick={() => {
                      setShowMutationModal(true)
                      setMutationModalType("update")
                      //TODO get ID of the material
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
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  isClearable={true}
                  name={"material-cost-material-select"}
                  placeholder={""}
                  value={selectedMaterial}
                  options={allMaterials}
                  onChange={(value) => onMaterialSelect(value)}
                />
                {mutationModalErrors.materialID && <span className="text-red-600 text-sm font-bold">Не указан материал</span>}
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="costPrime">Изначальная Цена</label>
                <Input 
                  name="costPrime"
                  type="number"
                  value={mutationData.costPrime}
                  onChange={(e) => setMutationData({...mutationData, [e.target.name]: +e.target.value})}
                />
                {mutationModalErrors.costPrime && <span className="text-red-600 text-sm font-bold">Не указана изначальная цена за материал</span>}
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="costPrime">Цена M19</label>
                <Input 
                  name="costM19"
                  type="number"
                  value={mutationData.costM19}
                  onChange={(e) => setMutationData({...mutationData, [e.target.name]: +e.target.value})}
                />
                {mutationModalErrors.costPrime && <span className="text-red-600 text-sm font-bold">Не указана изначальная цена М19 за материал</span>}
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="costWithCustomer">Цена с заказчиком</label>
                <Input 
                  name="costWithCustomer"
                  type="number"
                  value={mutationData.costWithCustomer}
                  onChange={(e) => setMutationData({...mutationData, [e.target.name]: +e.target.value})}
                />
                {mutationModalErrors.costWithCustomer && <span className="text-red-600 text-sm font-bold">Не указана цена материала с заказчиком</span>}
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