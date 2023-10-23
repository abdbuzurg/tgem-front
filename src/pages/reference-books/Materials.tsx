import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LinkBox from "../../components/UI/LinkButton";
import { useState, useEffect } from "react";
import { ENTRY_LIMIT } from "../../services/api/constants";
import getPaginatedMaterials, { MaterialsGetAllResponse } from "../../services/api/materials/getPaginated";
import Material from "../../services/interfaces/material";
import Button from "../../components/UI/button";
import deleteMaterial from "../../services/api/materials/delete";
import LoadingDots from "../../components/UI/loadingDots";
import DeleteModal from "../../components/deleteModal";
import Modal from "../../components/Modal";
import Input from "../../components/UI/Input";
import createMaterial from "../../services/api/materials/create";
import updateMaterial from "../../services/api/materials/update";

export default function Materials() {

  const tableDataQuery = useInfiniteQuery<MaterialsGetAllResponse, Error>({
    queryKey: ["materials"],
    queryFn: ({pageParam}) => getPaginatedMaterials({pageParam}),
    getNextPageParam: (lastPage) => {
      if (lastPage.page * ENTRY_LIMIT > lastPage.count) return undefined
      return lastPage.page + 1
    }
  })
  const [tableData, setTableData] = useState<Material[]>([])
  useEffect(() => {
    if (tableDataQuery.isSuccess && tableDataQuery.data) {
      const data: Material[] = tableDataQuery.data.pages.reduce<Material[]>((acc, page) => [...acc, ...page.data], [])
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

  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: deleteMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries(["materials"])
    }
  })
  const [modalProps, setModalProps] = useState({
    setShowModal: setShowModal,
    no_delivery: "",
    deleteFunc: () => {}
  })
  const onDeleteButtonClick = (row: Material) => {
    setShowModal(true)
    setModalProps({
      deleteFunc: () => deleteMutation.mutate(row.id),
      no_delivery: row.name,
      setShowModal: setShowModal,
    })
  }

  const [showMutationModal, setShowMutationModal] = useState(false)
  const [mutationModalType, setMutationModalType] = useState<null | "update" | "create">()
  const [materialMutationData, setMaterialMutationData] = useState<Material>({
    category: "",
    code: "",
    id: 0,
    name: "",
    notes: "",
    unit: "",
  })


  const [mutationModalErrors, setMutationModalErrors] = useState({
    category: false,
    name: false,
    unit: false,
  })

  const createMaterialMutation = useMutation<Material, Error, Material>({
    mutationFn: createMaterial,
    onSettled: () => {
      queryClient.invalidateQueries(["materials"])
      setShowMutationModal(false)
    }
  })
  const updateMaterialMutation = useMutation<Material, Error, Material>({
    mutationFn: updateMaterial,
    onSettled: () => {
      queryClient.invalidateQueries(["materials"])
      setShowMutationModal(false)
    }
  })

  const onMutationSubmit = () => {
    if (materialMutationData.category == "") setMutationModalErrors((prev) => ({...prev, category: true}))
    else setMutationModalErrors((prev) => ({...prev, category: false}))
    
    if (materialMutationData.name == "") setMutationModalErrors((prev) => ({...prev, name: true}))
    else setMutationModalErrors((prev) => ({...prev, name: false}))

    if (materialMutationData.unit == "") setMutationModalErrors((prev) => ({...prev, unit: true}))
    else setMutationModalErrors((prev) => ({...prev, unit: false}))
    
    const isThereError = Object.keys(materialMutationData).some((value) => {
      if (materialMutationData[value as keyof typeof materialMutationData] == "" && value != "notes" && value != "id" && value != "code") {
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
        <span className="text-3xl font-bold">Материалы</span>
      </div>
      <table className="table-auto text-sm text-left mt-2 w-full border-box">
        <thead className="shadow-md border-t-2">
          <tr>
            <th className="px-4 py-3 w-[100px]">
              <span>Код</span>
            </th>
            <th className="px-4 py-3">
              <span>Категория</span>
            </th>
            <th className="px-4 py-3">
              <span>Наименование</span>
            </th>
            <th className="px-4 py-3 w-[100px]">
              <span>Ед. Изм.</span>
            </th>
            <th className="px-4 py-3">
              <span>Примичание</span>
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
                <td className="px-4 py-3">{row.category}</td>
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3">{row.unit}</td>
                <td className="px-4 py-3">{row.notes}</td>
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
      {showModal && 
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
                <label htmlFor="name">Категория материала</label>
                <Input 
                  name="category"
                  type="text"
                  value={materialMutationData.category}
                  onChange={(e) => setMaterialMutationData({...materialMutationData, [e.target.name]: e.target.value})}
                />
                {mutationModalErrors.category && <span className="text-red-600 text-sm font-bold">Не указана категория материала</span>}
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="name">Наименование</label>
                <Input 
                  name="name"
                  type="text"
                  value={materialMutationData.name}
                  onChange={(e) => setMaterialMutationData({...materialMutationData, [e.target.name]: e.target.value})}
                />
                {mutationModalErrors.name && <span className="text-red-600 text-sm font-bold">Не указано наименование материала</span>}
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="unit">Еденица изменения</label>
                <Input 
                  name="unit"
                  type="text"
                  value={materialMutationData.unit}
                  onChange={(e) => setMaterialMutationData({...materialMutationData, [e.target.name]: e.target.value})}
                />
                {mutationModalErrors.unit && <span className="text-red-600 text-sm font-bold">Не указана еденица изменения материала</span>}
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="code">Код материала</label>
                <Input 
                  name="code"
                  type="text"
                  value={materialMutationData.code != "" ? materialMutationData.code : "Код будет сгенерирован"}
                  onChange={() => {}}
                  disabled={true}
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="notes">Примичание</label>
                <textarea 
                  name="notes"
                  value={materialMutationData.notes}
                  onChange={(e) => setMaterialMutationData({...materialMutationData, [e.target.name]: e.target.value})}
                  className="py-1.5 px-2 resize-none w-full h-[100px] rounded border  border-gray-800"
                >
                </textarea>
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