import { useEffect, useState } from "react";
import Button from "../../components/UI/button";
import Modal from "../../components/Modal";
import Select from 'react-select'
import IReactSelectOptions from "../../services/interfaces/react-select";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Material from "../../services/interfaces/material";
import getAllMaterials from "../../services/api/materials/getAll";
import { IMaterialCost } from "../../services/interfaces/materialCost";
import getMaterailCostByMaterialID from "../../services/api/materialscosts/getByMaterailID";
import { IInvoiceWriteOff, IInvoiceWriteOffMaterials, IInvoiceWriteOffView } from "../../services/interfaces/invoiceWriteOff";
import Input from "../../components/UI/Input";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { InvoiceWriteOffItem, InvoiceWriteOffMutation, InvoiceWriteOffPagianted, createInvoiceWriteOff, deleteInvoiceWriteOff, getInvoiceWriteOffDocument, getPaginatedInvoiceWriteOff } from "../../services/api/invoiceWriteoff";
import { ENTRY_LIMIT } from "../../services/api/constants";
import DeleteModal from "../../components/deleteModal";

export default function InvoiceWriteOff() {
  //FETCHING LOGIC
const tableDataQuery = useInfiniteQuery<InvoiceWriteOffPagianted, Error>({
  queryKey: ["invoice-writeoff"],
  queryFn: ({pageParam}) => getPaginatedInvoiceWriteOff({pageParam}),
  getNextPageParam: (lastPage) => {
    if (lastPage.page * ENTRY_LIMIT > lastPage.count) return undefined
    return lastPage.page + 1
  }
  })
  const [tableData, setTableData] = useState<IInvoiceWriteOffView[]>([])
  useEffect(() => {
    if (tableDataQuery.isSuccess && tableDataQuery.data) {
      const data: IInvoiceWriteOffView[] = tableDataQuery.data.pages.reduce<IInvoiceWriteOffView[]>((acc, page) => [...acc, ...page.data], [])
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

  //DELETE LOGIC
  const [showModal, setShowModal] = useState(false)
  const deleteMutation = useMutation({
    mutationFn: deleteInvoiceWriteOff,
    onSuccess: () => {
      queryClient.invalidateQueries(["invoice-writeoff"])
    }
  })
  const [modalProps, setModalProps] = useState({
    setShowModal: setShowModal,
    no_delivery: "",
    deleteFunc: () => {}
  })
  const onDeleteButtonClick = (row: IInvoiceWriteOffView) => {
    setShowModal(true)
    setModalProps({
      deleteFunc: () => deleteMutation.mutate(row.id),
      no_delivery: row.deliveryCode,
      setShowModal: setShowModal,
    })
  }

  //

  const queryClient = useQueryClient()
  const [mutationData, setMutationData] = useState<IInvoiceWriteOff>({
    dateOfAdd: new Date(),
    dateOfEdit: new Date(),
    dateOfInvoice: new Date(),
    id: 0,
    operatorAddWorkerID: 0,
    operatorEditWorkerID: 0,
    writeOffType: "акт склад 1",
    deliveryCode: "",
  })

  const [mutationModalType, setMutationModalType] = useState<null | "update" | "create">()
  const [showMutationModal, setShowMutationModal] = useState(false)

  const [invoiceMaterials, setInvoiceMaterials] = useState<IInvoiceWriteOffMaterials[]>([])
  const [invoiceMaterial, setInvoiceMaterial] = useState<IInvoiceWriteOffMaterials>({
    amount: 0,
    materialCost: "",
    materialCostID: 0,
    materialName: "",
    unit: "",
  })

  const [selectedMaterial, setSelectedMaterial] = useState<IReactSelectOptions<number>>({label: "", value: 0})
  const [allMaterials, setAllMaterials] = useState<IReactSelectOptions<number>[]>([])
  const materialsQuery = useQuery<Material[], Error, Material[]>({
    queryKey: ["all-materials"],
    queryFn: getAllMaterials
  })
  useEffect(() => {
    if (materialsQuery.isSuccess && materialsQuery.data) {
      setAllMaterials([
        ...materialsQuery.data.map<IReactSelectOptions<number>>((value) => ({label: value.name, value: value.id}))
      ])
    }
  }, [materialsQuery.data])
  const onMaterialSelect = (value: null | IReactSelectOptions<number>) => {
    if (!value) {
      setSelectedMaterial({label: "", value: 0})
      setSelectedMaterialCost({label: "", value: 0})
      setInvoiceMaterial({
        amount: 0,
        materialCost: "",
        materialCostID: 0,
        materialName: "",
        unit: "",
      })
      return
    }

    setSelectedMaterial(value)
    const unit = materialsQuery.data!.find((material) => material.id == value.value)!.unit
    setInvoiceMaterial({
      ...invoiceMaterial,
      unit: unit,
      materialName: value.label,
      materialCost: "",
      materialCostID: 0,
    })
  }

  const [selectedMaterialCost, setSelectedMaterialCost] = useState<IReactSelectOptions<number>>({label: "", value: 0})
  const [allMaterialCost, setAllMaterialCost] = useState<IReactSelectOptions<number>[]>([])
  const materialCostQuery = useQuery<IMaterialCost[], Error, IMaterialCost[]>({
    queryKey: ["material-cost", selectedMaterial.value],
    queryFn: () => getMaterailCostByMaterialID(selectedMaterial.value),
    enabled: selectedMaterial.value != 0,
  })
  useEffect(() => {
    if (materialCostQuery.isSuccess && materialCostQuery.data) {
      setAllMaterialCost([
        ...materialCostQuery.data.map<IReactSelectOptions<number>>((value) => ({label: value.costM19.toString(), value: value.id}))
      ])
    }
  }, [materialCostQuery.data])
  const onMaterialCostSelect = (value: null | IReactSelectOptions<number>) => {
    if (!value) {
      setSelectedMaterialCost({label: "", value: 0})
      setInvoiceMaterial({
        ...invoiceMaterial,
        materialCost: "",
        materialCostID: 0,
      })
      return
    }

    setSelectedMaterialCost(value)
    setInvoiceMaterial({
      ...invoiceMaterial,
      materialCost: value.label,
      materialCostID: value.value,
    })
  } 

  const [invoiceMaterialErrors, setInvoiceMaterialErrors] = useState({
    materialID: false,
    materialCostID: false,
    amount: false,
    materialExist: false,
  })
  const addItem = () => {
    setInvoiceMaterialErrors({
      materialCostID: selectedMaterial.value == 0,
      amount: invoiceMaterial.amount <= 0,
      materialID: selectedMaterial.value == 0,
      materialExist: invoiceMaterials.findIndex((value) => value.materialCostID == invoiceMaterial.materialCostID) != -1  
    })
  }

  useEffect(() => {
    const isThereError = Object.keys(invoiceMaterialErrors).some((value) => {
      if (invoiceMaterialErrors[value as keyof typeof invoiceMaterialErrors]) {
        return true
      }
    })

    const isThereEmptyFields = Object.keys(invoiceMaterial).some((value) => {
      if(!invoiceMaterial[value as keyof typeof invoiceMaterial]) {
        return true
      }
    })

    if (!isThereError && !isThereEmptyFields) {
      setInvoiceMaterials([...invoiceMaterials, invoiceMaterial])
    }
  }, [invoiceMaterialErrors])

  const onDeleteClick = (index: number) => {
    setInvoiceMaterials(invoiceMaterials.filter((_, i) => i != index))
  }

  const [mutationModalErrors, setMutationModalErrors] = useState({
    invoiceMaterials: false,
  })

  const onMutationSubmit = () => {
    setMutationModalErrors({
      invoiceMaterials: invoiceMaterials.length <= 0
    })
  }

  const createInvoiceWriteOffMutation = useMutation<InvoiceWriteOffMutation, Error, InvoiceWriteOffMutation>({
    mutationFn: createInvoiceWriteOff,
    onSettled: () => {
      queryClient.invalidateQueries(["invoice-writeoff"])
      setShowMutationModal(false)
    }
  })

  useEffect(() => {
    const isThereError = Object.keys(mutationModalErrors).some((value) => {
      if (mutationModalErrors[value as keyof typeof mutationModalErrors]) {
        return true
      }
    })

    if (!isThereError && invoiceMaterials.length > 0) {
      createInvoiceWriteOffMutation.mutate({
        details: mutationData,
        items: [
          ...invoiceMaterials.map<InvoiceWriteOffItem>((value) => ({amount: +value.amount,  materialCostID: +value.materialCostID}))
        ]
      })
    }
  }, [mutationModalErrors])

  return (
    <main>
      <div className="mt-2 pl-2 flex space-x-2">
        <span className="text-3xl font-bold">Накладные списание</span>
        {/* <Button text="Экспорт" onClick={() => {}}/> */}
      </div>
      <table className="table-auto text-sm text-left mt-2 w-full border-box">
        <thead className="shadow-md border-t-2">
          <tr>
            <th className="px-4 py-3 w-[100px]">
              <span>Код</span>
            </th>
            <th className="px-4 py-3">
              <span>Тип списания</span>
            </th>
            <th className="px-4 py-3 w-[150px]">
              <span>Дата</span>
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
          {tableData.map((value, index) => 
           <tr key={index}>
              <td className="px-4 py-3">{value.deliveryCode}</td>
              <td className="px-4 py-3">{value.writeOffType}</td>
              <td className="px-4 py-3">{value.dateOfInvoice.toString().substring(0, 10)}</td>
              <td className="px-4 py-3 border-box flex space-x-3">
                {/* <Button text="Подробнее" onClick={() => showDetails(index)}/> */}
                {/* <Button text="Изменить" buttonType="default" onClick={() => {}}/> */}
                <Button text="Документ" buttonType="default" onClick={() => getInvoiceWriteOffDocument(value.deliveryCode)}/>
                <Button text="Удалить" buttonType="delete" onClick={() => onDeleteButtonClick(value)}/>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {showModal && 
        <DeleteModal {...modalProps}> 
          <span>При подтверждении накладая приход с кодом {modalProps.no_delivery} и все связанные материалы будут удалены</span>
        </DeleteModal>
      }
      {showMutationModal &&
        <Modal setShowModal={setShowMutationModal} bigModal>
          <div className="mb-2">
            <h3 className="text-2xl font-medium text-gray-800">
              {mutationModalType == "create" && "Добавление накладной"}
              {mutationModalType == "update" && "Изменение накладной"}
            </h3>
          </div>
          <div className="flex w-full space-x-8 max-h-[85vh]">
            <div className="flex flex-col w-[25%]">
              <p className="text-xl font-semibold text-gray-800">Детали накладной</p>
              <div className="flex flex-col space-y-2">
                <div className="flex flex-col space-y-1 py-2">
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="dateOfInvoice">Дата накладной</label>
                    <div className="py-[4px] px-[8px] border-[#cccccc] border rounded-[4px]">
                      <DatePicker
                        name="dateOfInvoice"
                        className="outline-none w-full"
                        dateFormat={"dd-MM-yyyy"}
                        selected={mutationData.dateOfInvoice} 
                        onChange={(date) => setMutationData({...mutationData, dateOfInvoice: date ?? new Date(+0)})}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-4">
                    <div className="flex space-x-1 items-center">
                      <input 
                        name="returnType" 
                        type="radio" 
                        value="акт склад 1" 
                        id="акт склад 1" 
                        checked={mutationData.writeOffType == "акт склад 1"}
                        onChange={() => setMutationData({...mutationData, writeOffType: "акт склад 1"})}
                      />
                      <label className="text-xl" htmlFor="акт склад 1">Акт Склад 1</label>
                    </div>
                    <div className="flex space-x-1 items-center">
                      <input 
                        name="returnType" 
                        type="radio" 
                        value="акт склад 2" 
                        id="акт склад 2"
                        checked={mutationData.writeOffType == "акт склад 2"}
                        onChange={() => setMutationData({...mutationData, writeOffType: "акт склад 2"})}
                      />
                      <label className="text-xl" htmlFor="акт склад 2">Акт Склад 2</label>
                    </div>
                    <div className="flex space-x-1 items-center">
                      <input 
                        name="returnType" 
                        type="radio" 
                        value="акт склад 3" 
                        id="акт склад 3"
                        checked={mutationData.writeOffType == "акт склад 3"}
                        onChange={() => setMutationData({...mutationData, writeOffType: "акт склад 3"})}
                      />
                      <label className="text-xl" htmlFor="акт склад 3">Акт Склад 3</label>
                    </div>
                    <div className="flex space-x-1 items-center">
                      <input 
                        name="returnType" 
                        type="radio" 
                        value="акт ГСМ" 
                        id="акт ГСМ"
                        checked={mutationData.writeOffType == "акт ГСМ"}
                        onChange={() => setMutationData({...mutationData, writeOffType: "акт ГСМ"})}
                      />
                      <label className="text-xl" htmlFor="акт ГСМ">Акт ГСМ</label>
                    </div>
                    <div className="flex space-x-1 items-center">
                      <input 
                        name="returnType" 
                        type="radio" 
                        value="Акт ПТО утерени брига" 
                        id="Акт ПТО утерени брига"
                        checked={mutationData.writeOffType == "акт ПТО утерени брига"}
                        onChange={() => setMutationData({...mutationData, writeOffType: "акт ПТО утерени брига"})}
                      />
                      <label className="text-xl" htmlFor="Акт ПТО утерени брига">Акт ПТО утерени брига</label>
                    </div>
                    <div className="flex space-x-1 items-center">
                      <input 
                        name="returnType" 
                        type="radio" 
                        value="Акт ПТО материал пас" 
                        id="Акт ПТО материал пас"
                        checked={mutationData.writeOffType == "акт ПТО материал пас"}
                        onChange={() => setMutationData({...mutationData, writeOffType: "акт ПТО материал пас"})}
                      />
                      <label className="text-xl" htmlFor="Акт ПТО материал пас">Акт ПТО материал пас</label>
                    </div>
                    <div className="flex space-x-1 items-center">
                      <input 
                        name="returnType" 
                        type="radio" 
                        value="Акт ПТО услуго" 
                        id="Акт ПТО услуго"
                        checked={mutationData.writeOffType == "акт ПТО услуго"}
                        onChange={() => setMutationData({...mutationData, writeOffType: "акт ПТО услуго"})}
                      />
                      <label className="text-xl" htmlFor="Акт ПТО услуго">Акт ПТО услуго</label>
                    </div>
                    <div className="flex space-x-1 items-center">
                      <input 
                        name="returnType" 
                        type="radio" 
                        value="Акт ПТО M19" 
                        id="Акт ПТО M19"
                        checked={mutationData.writeOffType == "Акт ПТО M19"}
                        onChange={() => setMutationData({...mutationData, writeOffType: "Акт ПТО M19"})}
                      />
                      <label className="text-xl" htmlFor="Акт ПТО M19">Акт ПТО M19</label>
                    </div>
                  </div>
                  <div className="py-2">
                    <Button text="Опубликовать" onClick={() => onMutationSubmit()} />
                    <div className="flex flex-col space-y-2 mt-2">
                      {/* {mutationModalErrors.district && <p className="text-red-500 text-sm font-semibold">Не указан район</p>} */}
                      {mutationModalErrors.invoiceMaterials && <p className="text-red-500 text-sm font-semibold">Не выбраны материалы для накладной</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="overflow-y-scroll w-[75%] px-2">
              <div className="flex space-x-2 items-center justify-between">
                <p className="text-xl font-semibold text-gray-800">Материалы наклданой</p>
              </div>  
              <table className="table-auto text-sm text-left mt-2 w-full border-box">
                <thead className="shadow-md border-t-2">
                  <tr>
                    <th className="px-4 py-3">
                      <span>Наименование</span>
                    </th>
                    <th className="px-4 py-3">
                      <span>Ед.Изм.</span>
                    </th>
                    <th className="px-4 py-3">
                      <span>Цена</span>
                    </th>
                    <th className="px-4 py-3">
                      <span>Кол-во </span>
                    </th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceMaterials.map((value, index) => 
                    <tr key={index}>
                      <th className="px-4 py-3">
                        <span>{value.materialName}</span>
                      </th>
                      <th className="px-4 py-3">
                        <span>{value.unit}</span>
                      </th>
                      <th className="px-4 py-3">
                        <span>{value.materialCost}</span>
                      </th>
                      <th className="px-4 py-3">
                        <span>{value.amount}</span>
                      </th>
                      <th className="px-4 py-3">
                        <Button text="Удалить" buttonType="delete" onClick={() => onDeleteClick(index)}/>
                      </th>
                    </tr>
                  )}
                  <tr>
                    <th className="px-4 py-3">
                      <Select
                        className="basic-single"
                        classNamePrefix="select"
                        isSearchable={true}
                        isClearable={true}
                        menuPosition="fixed"
                        name={"materials"}
                        placeholder={""}
                        value={selectedMaterial}
                        options={allMaterials}
                        onChange={(value) => onMaterialSelect(value)}
                      />
                      {invoiceMaterialErrors.materialID && <p className="text-red-500 text-xs font-semibold">Не выбран материал</p>}
                    </th>
                    <th className="px-4 py-3">
                      <span>{invoiceMaterial.unit}</span>
                    </th>
                    <th className="px-4 py-3">
                      <Select
                        className="basic-single"
                        classNamePrefix="select"
                        isSearchable={true}
                        isClearable={true}
                        menuPosition="fixed"
                        name={"material-costs"}
                        placeholder={""}
                        value={selectedMaterialCost}
                        options={allMaterialCost}
                        onChange={(value) => onMaterialCostSelect(value)}
                      />
                      {invoiceMaterialErrors.materialCostID && <p className="text-red-500 text-xs font-semibold">Не выбрана цена материала</p>}
                      {invoiceMaterialErrors.materialExist && <p className="text-red-500 text-xs font-semibold">Данный материал с этой же ценой уже был выбран</p>}
                    </th>
                    <th className="px-4 py-3">
                      <Input 
                        name="amount"
                        type="number"
                        value={invoiceMaterial.amount}
                        onChange={(e) => setInvoiceMaterial({...invoiceMaterial, amount:+e.target.value})}
                      />
                      {invoiceMaterialErrors.amount && <p className="text-red-500 text-xs font-semibold">Не указано количество</p>}
                    </th>
                    <td className="px-4 py-3">
                      <Button text="Добавить" onClick={() => addItem()} buttonType="default"/>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      }
    </main>
  )
}