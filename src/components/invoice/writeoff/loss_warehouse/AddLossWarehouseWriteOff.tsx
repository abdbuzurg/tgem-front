import { Fragment, useEffect, useState } from "react"
import { IInvoiceWriteOff, IInvoiceWriteOffMaterials } from "../../../../services/interfaces/invoiceWriteOff"
import IReactSelectOptions from "../../../../services/interfaces/react-select"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { InvoiceWriteOffItem, InvoiceWriteOffMaterialsForSelect, InvoiceWriteOffMutation, createInvoiceWriteOff, getUniqueMaterialsInLocation } from "../../../../services/api/invoiceWriteoff"
import toast from "react-hot-toast"
import Modal from "../../../Modal"
import Button from "../../../UI/button"
import IconButton from "../../../IconButtons"
import { IoIosAddCircleOutline } from "react-icons/io"
import Input from "../../../UI/Input"
import Select from 'react-select'
import LoadingDots from "../../../UI/loadingDots"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  setShowAddModal: React.Dispatch<React.SetStateAction<boolean>>
}

export default function AddLossWarehouseWriteOff({
  setShowAddModal,
}: Props) {
  const [addInvoiceWriteOff, setAddInvoiceWriteOff] = useState<IInvoiceWriteOff>({
    id: 0,
    projectID: 0,
    releasedWorkerID: 0,
    writeOffType: "loss-warehouse",
    writeOffLocationID: 0,
    dateOfInvoice: new Date(),
    confirmation: false,
    dateOfConfirmation: new Date(),
    deliveryCode: "",
  })

  // Invoice materials information
  const [invoiceMaterials, setInvoiceMaterials] = useState<IInvoiceWriteOffMaterials[]>([])
  const [invoiceMaterial, setInvoiceMaterial] = useState<IInvoiceWriteOffMaterials>({
    materialID: 0,
    materialName: "",
    unit: "",
    amount: 0,
    notes: "",
    hasSerialNumber: false,
    serialNumbers: [],
    locationAmount: 0,
  })

  // MATERIAL SELECT LOGIC
  const materialQuery = useQuery<InvoiceWriteOffMaterialsForSelect[], Error, InvoiceWriteOffMaterialsForSelect[]>({
    queryKey: ["material-location-all"],
    queryFn: () => getUniqueMaterialsInLocation("warehouse", 0),
  })
  const [allMaterialData, setAllMaterialData] = useState<IReactSelectOptions<number>[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<IReactSelectOptions<number>>({ value: 0, label: "" })
  useEffect(() => {
    if (materialQuery.isSuccess && materialQuery.data) {
      setAllMaterialData([
        ...materialQuery
          .data
          .map<IReactSelectOptions<number>>((value) => ({ value: value.materialID, label: value.materialName })),
      ])
    }
  }, [materialQuery.data])
  const onMaterialSelect = (value: IReactSelectOptions<number> | null) => {
    if (!value) {
      setSelectedMaterial({ label: "", value: 0 })
      setInvoiceMaterial({
        ...invoiceMaterial,
        unit: "",
        materialID: 0,
        materialName: "",
        hasSerialNumber: false,
      })

      return
    }
    setSelectedMaterial(value)
    if (materialQuery.data && materialQuery.isSuccess) {
      const material = materialQuery.data.find((material) => material.materialID == value.value)!
      setInvoiceMaterial({
        ...invoiceMaterial,
        unit: material.materialUnit,
        materialID: material.materialID,
        materialName: material.materialName,
        hasSerialNumber: material.hasSerialNumber,
        locationAmount: material.amount,
      })
    }
  }

  //ADDING MATERIAL TO LIST LOGIC
  const onAddClick = () => {

    if (invoiceMaterial.materialID == 0) {
      toast.error("Не выбран материал")
      return
    }

    const index = invoiceMaterials.findIndex((value) => value.materialID == invoiceMaterial.materialID)
    if (index != -1) {
      if (invoiceMaterial.materialID == invoiceMaterials[index].materialID) {
        toast.error("Такой материал с такой ценой уже был выбран. Выберите другой ценник или же другой материл")
        return
      }
    }


    if (invoiceMaterial.amount <= 0) {
      toast.error("Неправильно указано количество")
      return
    }

    if (invoiceMaterial.amount > invoiceMaterial.locationAmount) {
      toast.error("Выбранное количество привышает доступное")
      return
    }

    if (invoiceMaterial.hasSerialNumber && invoiceMaterial.serialNumbers.length !== invoiceMaterial.amount) {
      toast.error("Количство материала не совпадает с количеством серийных намеров")
      return
    }

    setInvoiceMaterials([invoiceMaterial, ...invoiceMaterials])
    setInvoiceMaterial({
      amount: 0,
      materialName: "",
      materialID: 0,
      notes: "",
      unit: "",
      hasSerialNumber: false,
      serialNumbers: [],
      locationAmount: 0,
    })
    setSelectedMaterial({ label: "", value: 0 })
  }

  // DELETE MATERIAL LOGIC
  const onDeleteClick = (index: number) => {
    setInvoiceMaterials(invoiceMaterials.filter((_, i) => i != index))
  }

  //SUBMIT THE INVOICE LOGIC
  const queryClient = useQueryClient()
  const createInvoiceWriteOffMutation = useMutation<InvoiceWriteOffMutation, Error, InvoiceWriteOffMutation>({
    mutationFn: createInvoiceWriteOff,
    onSuccess: () => {
      queryClient.invalidateQueries(["invoice-writeoff", "writeoff-warehouse"])
      setShowAddModal(false)
    }
  })

  const onMutationSubmit = () => {

    if (!addInvoiceWriteOff.dateOfInvoice) {
      toast.error("Дата не выбрана")
      return
    }

    if (invoiceMaterials.length == 0) {
      toast.error("Накладная не имеет материалов")
      return
    }

    createInvoiceWriteOffMutation.mutate({
      details: addInvoiceWriteOff,
      items: invoiceMaterials.map<InvoiceWriteOffItem>(val => ({
        materialID: val.materialID,
        amount: val.amount,
        notes: val.notes,
      }))
    })
  }

  return (
    <Modal setShowModal={setShowAddModal} bigModal>
      <div className="mb-2">
        <h3 className="text-2xl font-medium text-gray-800">
          Добавление накладной
        </h3>
      </div>
      <div className="flex flex-col w-full max-h-[85vh] ">
        <div className="flex flex-col">
          <p className="text-xl font-semibold text-gray-800">Детали накладной</p>
          <div className="flex space-x-2 items-center w-full">
            <div className="flex flex-col space-y-1">
              <label htmlFor="dateOfInvoice">Дата накладной</label>
              <div className="py-[4px] px-[8px] border-[#cccccc] border rounded-[4px]">
                <DatePicker
                  name="dateOfInvoice"
                  className="outline-none w-full"
                  dateFormat={"dd-MM-yyyy"}
                  selected={addInvoiceWriteOff.dateOfInvoice}
                  onChange={(date) => setAddInvoiceWriteOff({ ...addInvoiceWriteOff, dateOfInvoice: date ?? new Date(+0) })}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex">
            <div
              onClick={() => onMutationSubmit()}
              className="text-white py-2.5 px-5 rounded-lg bg-gray-700 hover:bg-gray-800 hover:cursor-pointer"
            >
              {createInvoiceWriteOffMutation.isLoading
                ?
                <LoadingDots height={30} />
                :
                "Опубликовать"
              }
            </div>
          </div>
        </div>
        <div>
          <div className="flex space-x-2 items-center justify-between">
            <p className="text-xl font-semibold text-gray-800">Материалы наклданой</p>

          </div>
          <div className="grid grid-cols-6 text-sm font-bold shadow-md text-left mt-2 w-full border-box">
            {/* table head START */}
            <div className="px-4 py-3">
              <span>Наименование</span>
            </div>
            <div className="px-4 py-3">
              <span>Ед.Изм.</span>
            </div>
            <div className="px-4 py-3">
              <span>На складе</span>
            </div>
            <div className="px-4 py-3">
              <span>Количество</span>
            </div>
            <div className="px-4 py-3">
              <span>Примичание</span>
            </div>
            <div className="px-4 py-3"></div>
            {/* table head END */}
          </div>
          <div className="grid grid-cols-6 text-sm text-left mt-2 w-full border-box items-center">
            {materialQuery.isLoading &&
              <div className="px-4 py-3">
                <LoadingDots height={36} />
              </div>
            }
            {materialQuery.isSuccess  &&
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
                  options={allMaterialData}
                  onChange={(value) => onMaterialSelect(value)}
                />
              </div>
            }
            <div className="px-4 py-3 flex items-center">{invoiceMaterial.unit}</div>
            <div className="px-4 py-3">{invoiceMaterial.locationAmount}</div>
            <div className="px-4 py-3">
              <Input
                name="amount"
                value={invoiceMaterial.amount}
                type="number"
                onChange={(e) => setInvoiceMaterial((prev) => ({ ...prev, amount: e.target.valueAsNumber }))}
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
            <div className="grid grid-cols-2 gap-2 text-center justify-items-center">
              {/* {invoiceMaterial.hasSerialNumber && */}
              {/*   <div> */}
              {/*     <IconButton */}
              {/*       icon={<FaBarcode */}
              {/*         size="25px" */}
              {/*         title={`Привязать серийные номера`} />} */}
              {/*       onClick={() => setShowSerialNumberAddModal(true)} */}
              {/*     /> */}
              {/*   </div> */}
              {/* } */}
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
            <div className="grid grid-cols-6 text-sm text-left mt-2 w-full border-box overflow-y-auto max-h-[35vh]">
              {invoiceMaterials.map((value, index) =>
                <Fragment key={index}>
                  <div className="px-4 py-3">{value.materialName}</div>
                  <div className="px-4 py-3">{value.unit}</div>
                  <div className="px-4 py-3">{value.locationAmount}</div>
                  <div className="px-4 py-3">{value.amount}</div>
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
    </Modal>
  )
}
