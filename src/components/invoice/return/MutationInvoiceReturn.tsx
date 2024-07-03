import Modal from "../../Modal";
import Select from 'react-select'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Fragment, useEffect, useState } from "react";
import { IInvoiceReturn, IInvoiceReturnMaterials } from "../../../services/interfaces/invoiceReturn";
import ObjectSelect from "../../ObjectSelect";
import TeamSelect from "../../TeamSelect";
import Button from "../../UI/button";
import IReactSelectOptions from "../../../services/interfaces/react-select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Material from "../../../services/interfaces/material";
import { IMaterialCost } from "../../../services/interfaces/materialCost";
import { InvoiceReturnItem, InvoiceReturnMutation, createInvoiceReturn, getMaterialAmountInLocation, getMaterialCostsInLocation, getUniqueMaterialsInLocation } from "../../../services/api/invoiceReturn";
import Input from "../../UI/Input";
import toast from "react-hot-toast";
import SerialNumberSelectReturnModal from "./SerialNumberSelectReturn";
import DistrictSelect from "../../DistrictSelect";
import IconButton from "../../IconButtons";
import { FaBarcode } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";
import WorkerSelect from "../../WorkerSelect";

interface Props {
  setShowMutationModal: React.Dispatch<React.SetStateAction<boolean>>
  mutationType: "create" | "update"
}


export default function MutationInvoiceReturnObject({
  mutationType,
  setShowMutationModal,
}: Props) {

  // Main invoice information
  const [mutationData, setMutationData] = useState<IInvoiceReturn>({
    dateOfInvoice: new Date(),
    deliveryCode: "",
    districtID: 0,
    id: 0,
    notes: "",
    projectID: 0,
    returnerID: 0,
    returnerType: "object",
    acceptorID: 0,
    acceptorType: "team",
    acceptedByWorkerID: 0,
    confirmation: false,
  })

  // District, Object, Team and District select logic
  const [selectedDistrictID, setSelectedDistrictID] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  const [selectedObjectID, setSelectedObjectID] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  const [selectedTeamID, setSelectedTeamID] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  const [selectedAcceptedByWorkerID, setSelectedAcceptedByWorkerID] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  useEffect(() => {
    setMutationData({
      ...mutationData,
      returnerID: selectedObjectID.value,
      acceptorID: selectedTeamID.value,
      districtID: selectedDistrictID.value,
      acceptedByWorkerID: selectedAcceptedByWorkerID.value
    })
    setSelectedMaterial({ label: "", value: 0 })
    setSelectedMaterialCost({ label: "", value: 0 })
    setInvoiceMaterial({
      materialID: 0,
      holderAmount: 0,
      unit: "",
      materialCostID: 0,
      amount: 0,
      materialName: "",
      materialCost: "",
      hasSerialNumber: false,
      serialNumbers: [],
      isDefective: false,
      notes: "",
    })
  }, [selectedObjectID, selectedTeamID, selectedDistrictID, selectedAcceptedByWorkerID])

  //Invoice material information
  const [invoiceMaterials, setInvoiceMaterials] = useState<IInvoiceReturnMaterials[]>([])
  const [invoiceMaterial, setInvoiceMaterial] = useState<IInvoiceReturnMaterials>({
    materialID: 0,
    amount: 0,
    materialName: "",
    unit: "",
    holderAmount: 0,
    materialCostID: 0,
    materialCost: "",
    hasSerialNumber: false,
    serialNumbers: [],
    isDefective: false,
    notes: "",
  })

  //Logic for Material Select
  //The data is based on the returner type and the returnerID
  const [selectedMaterial, setSelectedMaterial] = useState<IReactSelectOptions<number>>({ value: 0, label: "" })
  const [allAvaialableMaterials, setAllAvailableMaterails] = useState<IReactSelectOptions<number>[]>([])
  const allMaterialInALocation = useQuery<Material[], Error, Material[]>({
    queryKey: ["available-materials", mutationData.returnerType, mutationData.returnerID],
    queryFn: () => getUniqueMaterialsInLocation(mutationData.returnerType, mutationData.returnerID),
  })

  useEffect(() => {
    if (allMaterialInALocation.isSuccess) {
      if (allMaterialInALocation.data)
        setAllAvailableMaterails([
          ...allMaterialInALocation.data.map<IReactSelectOptions<number>>((value) => ({ label: value.name, value: value.id }))
        ])
      else
        setAllAvailableMaterails([]);
    }
  }, [allMaterialInALocation.data])

  const onAllAvailableMaterialSelect = (value: IReactSelectOptions<number> | null) => {
    if (!value) {
      setSelectedMaterial({ label: "", value: 0 })
      setSelectedMaterialCost({ label: "", value: 0 })
      setAvailableMaterialCosts([])
      setInvoiceMaterial({
        ...invoiceMaterial,
        unit: "",
        holderAmount: 0,
        materialName: "",
        materialCost: "",
        materialCostID: 0,
        hasSerialNumber: false,
        serialNumbers: [],
        materialID: 0,
      })
      return
    }
    if (allMaterialInALocation.data) {
      setSelectedMaterial(value)
      setSelectedMaterialCost({ label: "", value: 0 })
      const material = allMaterialInALocation.data.find((material) => material.id == value.value)!
      setInvoiceMaterial({
        ...invoiceMaterial,
        materialID: material.id,
        unit: material.unit,
        holderAmount: 0,
        materialName: material.name,
        materialCostID: 0,
        materialCost: "",
        hasSerialNumber: material.hasSerialNumber,
        serialNumbers: [],
      })
    }
  }

  //Logic for Material cost
  const [selectedMaterialCost, setSelectedMaterialCost] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  const [availableMaterialCosts, setAvailableMaterialCosts] = useState<IReactSelectOptions<number>[]>([])
  const materialCostQuery = useQuery<IMaterialCost[], Error, IMaterialCost[]>({
    queryKey: ["material-cost-in-a-location", selectedMaterial],
    queryFn: () => getMaterialCostsInLocation(selectedMaterial.value, mutationData.returnerType, mutationData.returnerID),
    enabled: selectedMaterial.value != 0,
  })
  useEffect(() => {
    if (materialCostQuery.isSuccess && materialCostQuery.data) {
      setAvailableMaterialCosts([
        ...materialCostQuery.data.map<IReactSelectOptions<number>>((value) => ({ label: value.costM19.toString(), value: value.id }))
      ])
    }
  }, [materialCostQuery.data])

  const onMaterialCostSelect = (value: IReactSelectOptions<number> | null) => {
    if (!value) {
      setSelectedMaterialCost({ label: "", value: 0 })
      setInvoiceMaterial({
        ...invoiceMaterial,
        holderAmount: 0,
        materialCost: "",
        materialCostID: 0
      })
      return
    }
    setSelectedMaterialCost(value)
    setInvoiceMaterial({
      ...invoiceMaterial,
      holderAmount: 0,
      materialCost: value.label,
      materialCostID: value.value
    })
  }

  // Logic of displaying the amount of material available based on cost and name
  const materialAmountQuery = useQuery<number, Error, number>({
    queryKey: ["materail-amount", selectedMaterial, selectedMaterialCost],
    queryFn: () => getMaterialAmountInLocation(selectedMaterialCost.value, mutationData.returnerType, mutationData.returnerID,),
    enabled: selectedMaterialCost.value != 0 && selectedMaterial.value != 0,
  })

  useEffect(() => {
    if (materialAmountQuery.isSuccess && materialAmountQuery.data) {
      setInvoiceMaterial({ ...invoiceMaterial, holderAmount: materialAmountQuery.data })
    }
  }, [materialAmountQuery.data])

  //Logic of serial numbers
  const [showSerialNumberSelectModal, setShowSerialNumberSelectModal] = useState(false)
  const addSerialNumbersToInvoice = (serialNumbers: string[]) => {
    setShowSerialNumberSelectModal(false)
    setInvoiceMaterial({
      ...invoiceMaterial,
      serialNumbers: serialNumbers,
    })
  }

  //Logic of adding material into the list of materials for invoice
  const onAddClick = () => {
    if (invoiceMaterial.amount <= 0) {
      toast.error("Не указано количество материала")
      return
    }

    if (invoiceMaterial.amount > invoiceMaterial.holderAmount) {
      toast.error("Выбранное количество привышает доступное")
      return
    }

    if (invoiceMaterial.hasSerialNumber && invoiceMaterial.serialNumbers.length !== invoiceMaterial.amount) {
      toast.error("Количество материала не совпадает с количеством сирийных номеров")
      return
    }

    if (invoiceMaterial.materialID == 0) {
      toast.error("Не выбран материал")
      return
    }

    if (invoiceMaterial.materialCostID == 0) {
      toast.error("Не выбрана цена материала")
      return
    }

    const index = invoiceMaterials.findIndex((value) => value.materialCostID == invoiceMaterial.materialCostID)
    if (index != -1) {
      if (invoiceMaterials[index].materialCost == invoiceMaterial.materialCost) {
        if (invoiceMaterials[index].isDefective == invoiceMaterial.isDefective) {
          toast.error("Материал с такой ценой и с такими статусом браковоности был указан")
          return
        }
        if (invoiceMaterial.isDefective != !invoiceMaterials[index].isDefective) {
          toast.error("Данный материал уже указан с такой ценой. Либо укажаите что он бракованный либо помяйте цену материла")
          return
        }
        if (invoiceMaterial.amount + invoiceMaterials[index].amount > invoiceMaterial.holderAmount) {
          toast.error("Сумма даннаго материала с выбранной ценой и (не-)браковынным вариантом превышают имееющееся количество")
          return
        }

      }
    }

    setInvoiceMaterials([invoiceMaterial, ...invoiceMaterials])
    setInvoiceMaterial({
      materialID: 0,
      amount: 0,
      holderAmount: 0,
      materialCost: "",
      materialCostID: 0,
      materialName: "",
      unit: "",
      notes: "",
      hasSerialNumber: false,
      serialNumbers: [],
      isDefective: false,
    })
    setSelectedMaterial({ label: "", value: 0 })
    setSelectedMaterialCost({ label: "", value: 0 })
  }

  //Logic of deleting material from list of materials
  const onDeleteClick = (index: number) => {
    setInvoiceMaterials(invoiceMaterials.filter((_, i) => i != index))
  }

  //Logic of sending the Invoice
  const queryClient = useQueryClient()
  const createInvoiceReturnMutation = useMutation<InvoiceReturnMutation, Error, InvoiceReturnMutation>({
    mutationFn: createInvoiceReturn,
    onSettled: () => {
      queryClient.invalidateQueries(["invoice-return-object"])
      setShowMutationModal(false)
    }
  })
  const onMutationSubmit = () => {
    if (selectedDistrictID.value == 0) {
      toast.error("Не выбран район")
    }

    if (selectedTeamID.value == 0) {
      toast.error("Не выбрана бригада")
      return
    }

    if (selectedObjectID.value == 0) {
      toast.error("Не выбран Объект")
      return
    }

    if (selectedAcceptedByWorkerID.value == 0) {
      toast.error("Не выбран принимающий")
      return
    }

    if (invoiceMaterials.length == 0) {
      toast.error("Накладная не имеет материалов")
      return
    }

    switch (mutationType) {
      case "create":
        createInvoiceReturnMutation.mutate({
          details: mutationData,
          items: invoiceMaterials.map<InvoiceReturnItem>((value) => ({
            amount: value.amount,
            materialCostID: value.materialCostID,
            isDefected: value.isDefective,
            serialNumbers: value.serialNumbers,
            notes: value.notes,
          })),
        })
        return
      case "update":
        // updateMaterialMutation.mutate(mutationData)
        return

      default:
        throw new Error("Неправильная операция была выбрана")
    }
  }

  return (
    <Modal setShowModal={setShowMutationModal} bigModal>
      <div className="mb-2">
        <h3 className="text-2xl font-medium text-gray-800">
          {mutationType == "create" && "Добавление накладной возврат из объекта"}
          {mutationType == "update" && "Изменение накладной"}
        </h3>
      </div>
      <div className="flex flex-col w-full max-h-[80vh] space-y-2">
        <p className="text-xl font-semibold text-gray-800">Детали накладной</p>
        <div className="flex flex-col space-y-2 w-full">
          <div className="flex space-x-2">
            <DistrictSelect
              selectedDistrictID={selectedDistrictID}
              setSelectedDistrictID={setSelectedDistrictID}
            />
            <ObjectSelect
              selectedObjectID={selectedObjectID}
              setSelectedObjectID={setSelectedObjectID}
            />
          </div>
          <div className="flex space-x-2 items-center">
            <TeamSelect
              selectedTeamID={selectedTeamID}
              setSelectedTeamID={setSelectedTeamID}
            />
            <WorkerSelect 
              title="Принял"
              jobTitle="Бригадир"
              selectedWorkerID={selectedAcceptedByWorkerID}
              setSelectedWorkerID={setSelectedAcceptedByWorkerID}
            />
            <div className="flex flex-col space-y-1">
              <label htmlFor="dateOfInvoice">Дата накладной</label>
              <div className="py-[4px] px-[8px] border-[#cccccc] border rounded-[4px]">
                <DatePicker
                  name="dateOfInvoice"
                  className="outline-none w-full"
                  dateFormat={"dd-MM-yyyy"}
                  selected={mutationData.dateOfInvoice}
                  onChange={(date) => setMutationData({ ...mutationData, dateOfInvoice: date ?? new Date(+0) })}
                />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button text="Опубликовать" onClick={() => onMutationSubmit()} />
          </div>
        </div>
        <div>
          <div className="flex space-x-2 items-center justify-between">
            <p className="text-xl font-semibold text-gray-800">Материалы наклданой</p>
          </div>
          {/* table head START */}
          <div className="grid grid-cols-8 text-sm font-bold shadow-md text-left mt-2 w-full border-box">
            <div className="px-4 py-3">
              <span>Наименование</span>
            </div>
            <div className="px-4 py-3">
              <span>Ед.Изм.</span>
            </div>
            <div className="px-4 py-3">
              <span>Цена</span>
            </div>
            <div className="px-4 py-3">
              <span>Доступно</span>
            </div>
            <div className="px-4 py-3">
              <span>Количество</span>
            </div>
            <div className="px-4 py-3">
              <span>Брак</span>
            </div>
            <div className="px-4 py-3">
              <span>Примичание</span>
            </div>
            <div className="px-4 py-3"></div>
          </div>
          {/* table head END */}
          <div className="grid grid-cols-8 text-sm text-left mt-2 w-full border-box">
            <div className="px-4 py-3">
              <Select
                className="basic-single"
                classNamePrefix="select"
                isSearchable={true}
                isClearable={true}
                menuPosition="fixed"
                name={"materials"}
                placeholder={""}
                value={selectedMaterial}
                options={allAvaialableMaterials}
                onChange={(value) => onAllAvailableMaterialSelect(value)}
              />
            </div>
            <div className="px-4 py-3 flex items-center">{invoiceMaterial.unit}</div>
            <div className="px-4 py-3">
              <Select
                className="basic-single"
                classNamePrefix="select"
                isSearchable={true}
                isClearable={true}
                menuPosition="fixed"
                name={"materials-costs"}
                placeholder={""}
                value={selectedMaterialCost}
                options={availableMaterialCosts}
                onChange={(value) => onMaterialCostSelect(value)}
              />
            </div>
            <div className="px-4 py-3 flex items-center">{invoiceMaterial.holderAmount}</div>
            <div className="px-4 py-3">
              <Input
                name="amount"
                value={invoiceMaterial.amount}
                type="number"
                onChange={(e) => setInvoiceMaterial((prev) => ({ ...prev, amount: e.target.valueAsNumber }))}
              />
            </div>
            <div className="px-4 py-3 flex items-center">
              <input
                type="checkbox"
                checked={invoiceMaterial.isDefective}
                onChange={(e) => setInvoiceMaterial({ ...invoiceMaterial, isDefective: e.currentTarget.checked })}
              />
            </div>
            <div className="px-4 py-3">
              <Input
                name="notes"
                value={invoiceMaterial.notes}
                type="text"
                onChange={(e) => setInvoiceMaterial((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 items-center">
              {invoiceMaterial.hasSerialNumber &&
                <div>
                  <IconButton
                    icon={<FaBarcode
                      size="25px"
                      title={`Привязать серийные номера`} />}
                    onClick={() => setShowSerialNumberSelectModal(true)}
                  />
                </div>
              }
              <div className="text-center">
                <IconButton
                  icon={<IoIosAddCircleOutline
                    size="25px"
                    title={`Привязать серийные номера`} />}
                  onClick={() => onAddClick()}
                />
              </div>
            </div>
          </div>
          {invoiceMaterials.length > 0 &&
            <div className="grid grid-cols-8 text-sm text-left mt-2 w-full border-box overflow-y-auto max-h-[50vh]">
              {invoiceMaterials.map((value, index) =>
                <Fragment key={index}>
                  <div className="px-4 py-3">{value.materialName}</div>
                  <div className="px-4 py-3">{value.unit}</div>
                  <div className="px-4 py-3">{value.materialCost}</div>
                  <div className="px-4 py-3">{value.holderAmount}</div>
                  <div className="px-4 py-3">{value.amount}</div>
                  <div className="px-4 py-3">{value.isDefective ? "ДА" : "НЕТ"}</div>
                  <div className="px-4 py-3">{value.notes}</div>
                  <div className="px-4 py-3 flex items-center">
                    <Button buttonType="delete" onClick={() => onDeleteClick(index)} text="Удалить" />
                  </div>
                </Fragment>
              )}
            </div>
          }
        </div>
      </div>
      {showSerialNumberSelectModal &&
        <SerialNumberSelectReturnModal
          setShowModal={setShowSerialNumberSelectModal}
          alreadySelectedSerialNumers={invoiceMaterial.serialNumbers}
          locationType={mutationData.returnerType}
          locationID={mutationData.returnerID}
          addSerialNumbersToInvoice={addSerialNumbersToInvoice}
          materialID={invoiceMaterial.materialID}
        />
      }
    </Modal>
  )
}