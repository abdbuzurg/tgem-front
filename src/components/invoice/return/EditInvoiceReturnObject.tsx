import Modal from "../../Modal";
import Select from 'react-select'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Fragment, useEffect, useState } from "react";
import { IInvoiceReturn, IInvoiceReturnMaterials, IInvoiceReturnView } from "../../../services/interfaces/invoiceReturn";
import Button from "../../UI/button";
import IReactSelectOptions from "../../../services/interfaces/react-select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InvoiceReturnItem, InvoiceReturnMaterialsForSelect, InvoiceReturnMutation, getInvoiceReturnMaterialsForEdit, getUniqueMaterialsInLocation, updateInvoiceReturn } from "../../../services/api/invoiceReturn";
import Input from "../../UI/Input";
import toast from "react-hot-toast";
import SerialNumberSelectReturnModal from "./SerialNumberSelectReturn";
import IconButton from "../../IconButtons";
import { FaBarcode } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";
import { getAllDistricts } from "../../../services/api/district";
import { IDistrict } from "../../../services/interfaces/district";
import { TeamDataForSelect } from "../../../services/interfaces/teams";
import { getAllTeamsForSelect } from "../../../services/api/team";
import IWorker from "../../../services/interfaces/worker";
import { getAllWorkers } from "../../../services/api/worker";
import LoadingDots from "../../UI/loadingDots";
import { getAllObjects } from "../../../services/api/object";
import { IObject } from "../../../services/interfaces/objects";
import { objectTypeIntoRus } from "../../../services/lib/objectStatuses";

interface Props {
  setShowMutationModal: React.Dispatch<React.SetStateAction<boolean>>
  invoiceReturnObject: IInvoiceReturnView
}

export default function EditInvoiceReturnObject({
  setShowMutationModal,
  invoiceReturnObject,
}: Props) {

  // Main invoice information
  const [editInvoiceReturnObject, setEditInvoiceReturnObject] = useState<IInvoiceReturn>({
    dateOfInvoice: new Date(invoiceReturnObject.dateOfInvoice),
    deliveryCode: invoiceReturnObject.deliveryCode,
    districtID: 0,
    id: invoiceReturnObject.id,
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
  const [allDistricts, setAllDistricts] = useState<IReactSelectOptions<number>[]>([])
  const allDistrictsQuery = useQuery<IDistrict[], Error, IDistrict[]>({
    queryKey: [`all-districts`],
    queryFn: getAllDistricts,
  })
  useEffect(() => {
    if (allDistrictsQuery.isSuccess && allDistrictsQuery.data) {
      setAllDistricts(allDistrictsQuery.data.map<IReactSelectOptions<number>>(val => ({
        label: val.name,
        value: val.id,
      })))

      const district = allDistrictsQuery.data.find(val => val.name = invoiceReturnObject.districtName)!
      setSelectedDistrictID({
        label: district.name,
        value: district.id,
      })

      setEditInvoiceReturnObject(prev => ({
        ...prev,
        districtID: district.id,
      }))
    }
  }, [allDistrictsQuery.data])

  const [selectedObject, setSelectedObject] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  const [allObjects, setAllObjects] = useState<IReactSelectOptions<number>[]>([])
  const allObjectsQuery = useQuery<IObject[], Error, IObject[]>({
    queryKey: ["all-objects"],
    queryFn: getAllObjects,
  })
  useEffect(() => {
    if (allObjectsQuery.isSuccess && allObjectsQuery.data) {
      setAllObjects(allObjectsQuery.data.map<IReactSelectOptions<number>>(val => ({
        label: val.name + " (" + objectTypeIntoRus(val.type) + ")",
        value: val.id,
      })))

      const object = allObjectsQuery.data.find(val => val.name == invoiceReturnObject.objectName && val.type == invoiceReturnObject.objectType)!
      console.log(object)
      setSelectedObject({
        label: object.name + " (" + objectTypeIntoRus(object.type) + ")",
        value: object.id,
      })

      setEditInvoiceReturnObject(prev => ({
        ...prev,
        returnerID: object.id,
      }))
    }
  }, [allObjectsQuery.data])

  const [selectedTeam, setSelectedTeam] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  const [allTeams, setAllTeams] = useState<IReactSelectOptions<number>[]>([])
  const allTeamsQuery = useQuery<TeamDataForSelect[], Error, TeamDataForSelect[]>({
    queryKey: ["all-teams-for-select"],
    queryFn: getAllTeamsForSelect,
  })
  useEffect(() => {
    if (allTeamsQuery.isSuccess && allTeamsQuery.data) {
      setAllTeams(allTeamsQuery.data.map<IReactSelectOptions<number>>(val => ({
        label: val.teamNumber + " (" + val.teamLeaderName + ")",
        value: val.id,
      })))

      const team = allTeamsQuery.data.find(val => val.teamNumber == invoiceReturnObject.teamNumber && val.teamLeaderName == invoiceReturnObject.teamLeaderName)!
      setSelectedTeam({
        label: team.teamNumber + " (" + team.teamLeaderName + ")",
        value: team.id,
      })

      setEditInvoiceReturnObject(prev => ({
        ...prev,
        acceptorID: team.id,
      }))

    }
  }, [allTeamsQuery.data])

  const [selectedAcceptor, setSelectedAcceptor] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  const [allWorkers, setAllWorkers] = useState<IReactSelectOptions<number>[]>([])
  const allWorkersQuery = useQuery<IWorker[], Error, IWorker[]>({
    queryKey: ["all-workers"],
    queryFn: getAllWorkers,
  })
  useEffect(() => {
    if (allWorkersQuery.isSuccess && allWorkersQuery.data) {
      setAllWorkers(allWorkersQuery.data.map<IReactSelectOptions<number>>(val => ({
        label: val.name,
        value: val.id,
      })))

      const worker = allWorkersQuery.data.find(val => val.name == invoiceReturnObject.acceptorName)!
      setSelectedAcceptor({
        label: worker.name,
        value: worker.id,
      })

      setEditInvoiceReturnObject(prev => ({
        ...prev,
        acceptedByWorkerID: worker.id,
      }))
    }
  }, [allWorkersQuery.data])

  //Invoice material information
  const [invoiceMaterials, setInvoiceMaterials] = useState<IInvoiceReturnMaterials[]>([])
  const invoiceMaterialsForEditQuery = useQuery<IInvoiceReturnMaterials[], Error, IInvoiceReturnMaterials[]>({
    queryKey: ["invoice-input-materials", invoiceReturnObject.id],
    queryFn: () => getInvoiceReturnMaterialsForEdit(invoiceReturnObject.id)
  })
  useEffect(() => {
    if (invoiceMaterialsForEditQuery.isSuccess && invoiceMaterialsForEditQuery.data) {
      setInvoiceMaterials(invoiceMaterialsForEditQuery.data)
    }
  }, [invoiceMaterialsForEditQuery.data])
  const [invoiceMaterial, setInvoiceMaterial] = useState<IInvoiceReturnMaterials>({
    materialID: 0,
    amount: 0,
    materialName: "",
    unit: "",
    holderAmount: 0,
    hasSerialNumber: false,
    serialNumbers: [],
    isDefective: false,
    notes: "",
  })

  //Logic for Material Select
  //The data is based on the returner type and the returnerID
  const [selectedMaterial, setSelectedMaterial] = useState<IReactSelectOptions<number>>({ value: 0, label: "" })
  const [allAvaialableMaterials, setAllAvailableMaterails] = useState<IReactSelectOptions<number>[]>([])
  const allMaterialInALocation = useQuery<InvoiceReturnMaterialsForSelect[], Error, InvoiceReturnMaterialsForSelect[]>({
    queryKey: ["available-materials", editInvoiceReturnObject.returnerType, editInvoiceReturnObject.returnerID],
    queryFn: () => getUniqueMaterialsInLocation(editInvoiceReturnObject.returnerType, editInvoiceReturnObject.returnerID),
  })

  useEffect(() => {
    if (allMaterialInALocation.isSuccess) {
      if (allMaterialInALocation.data)
        setAllAvailableMaterails([
          ...allMaterialInALocation.data.map<IReactSelectOptions<number>>((value) => ({ label: value.materialName, value: value.materialID }))
        ])
      else
        setAllAvailableMaterails([]);
    }
  }, [allMaterialInALocation.data])

  const onAllAvailableMaterialSelect = (value: IReactSelectOptions<number> | null) => {
    if (!value) {
      setSelectedMaterial({ label: "", value: 0 })
      setInvoiceMaterial({
        ...invoiceMaterial,
        unit: "",
        holderAmount: 0,
        materialName: "",
        hasSerialNumber: false,
        serialNumbers: [],
        materialID: 0,
      })
      return
    }
    if (allMaterialInALocation.data) {
      setSelectedMaterial(value)
      const materialInfo = allMaterialInALocation.data.find((material) => material.materialID == value.value)!
      setInvoiceMaterial({
        ...invoiceMaterial,
        materialID: materialInfo.materialID,
        unit: materialInfo.materialUnit,
        holderAmount: materialInfo.amount,
        materialName: materialInfo.materialName,
        hasSerialNumber: materialInfo.hasSerialNumber,
        serialNumbers: [],
      })
    }
  }

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

    const index = invoiceMaterials.findIndex((value) => value.materialID == invoiceMaterial.materialID)
    if (index != -1) {
      if (invoiceMaterials[index].materialID == invoiceMaterial.materialID) {
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
      materialName: "",
      unit: "",
      notes: "",
      hasSerialNumber: false,
      serialNumbers: [],
      isDefective: false,
    })
    setSelectedMaterial({ label: "", value: 0 })
  }

  //Logic of deleting material from list of materials
  const onDeleteClick = (index: number) => {
    setInvoiceMaterials(invoiceMaterials.filter((_, i) => i != index))
  }

  //Logic of sending the Invoice
  const queryClient = useQueryClient()
  const updateInvoiceReturnMutation = useMutation<InvoiceReturnMutation, Error, InvoiceReturnMutation>({
    mutationFn: updateInvoiceReturn,
    onSuccess: () => {
      queryClient.invalidateQueries(["invoice-return-team"])
      setShowMutationModal(false)
    }
  })
  const onMutationSubmit = () => {
    if (editInvoiceReturnObject.districtID == 0) {
      toast.error("Не выбран район")
    }

    if (editInvoiceReturnObject.acceptorID == 0) {
      toast.error("Не выбрана бригада")
      return
    }

    if (editInvoiceReturnObject.returnerID == 0) {
      toast.error("Не выбран Объект")
      return
    }

    if (editInvoiceReturnObject.acceptedByWorkerID == 0) {
      toast.error("Не выбран принимающий")
      return
    }

    if (invoiceMaterials.length == 0) {
      toast.error("Накладная не имеет материалов")
      return
    }

    updateInvoiceReturnMutation.mutate({
      details: editInvoiceReturnObject,
      items: invoiceMaterials.map<InvoiceReturnItem>((value) => ({
        amount: value.amount,
        materialID: value.materialID,
        isDefected: value.isDefective,
        serialNumbers: value.serialNumbers,
        notes: value.notes,
      })),
    })
  }

  return (
    <Modal setShowModal={setShowMutationModal} bigModal>
      <div className="mb-2">
        <h3 className="text-2xl font-medium text-gray-800">
          Изменение накладной {invoiceReturnObject.deliveryCode}
        </h3>
      </div>
      <div className="flex flex-col w-full max-h-[80vh] space-y-2">
        <p className="text-xl font-semibold text-gray-800">Детали накладной</p>
        <div className="flex flex-col space-y-2 w-full">
          <div className="flex space-x-2">
            {allDistrictsQuery.isLoading &&
              <div className="flex h-full w-[200px] items-center">
                <LoadingDots height={40} />
              </div>
            }
            {allDistrictsQuery.isSuccess &&
              <div className="flex flex-col space-y-1">
                <label htmlFor="district">Район</label>
                <div className="w-[200px]">
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isSearchable={true}
                    isClearable={true}
                    name="district"
                    placeholder={""}
                    value={selectedDistrictID}
                    options={allDistricts}
                    onChange={(value) => {
                      setSelectedDistrictID(value ?? { label: "", value: 0 })
                      setEditInvoiceReturnObject({
                        ...editInvoiceReturnObject,
                        districtID: value?.value ?? 0,
                      })
                    }}
                  />
                </div>
              </div>
            }

            {allObjectsQuery.isLoading &&
              <div className="flex h-full w-[200px] items-center">
                <LoadingDots height={40} />
              </div>
            }
            {allObjectsQuery.isSuccess &&
              <div className="flex flex-col space-y-1">
                <label htmlFor="object">Объект</label>
                <div className="w-[200px]">
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isSearchable={true}
                    isClearable={true}
                    name="object"
                    placeholder={""}
                    value={selectedObject}
                    options={allObjects}
                    onChange={(value) => {
                      setSelectedObject(value ?? { label: "", value: 0 })
                      setEditInvoiceReturnObject({
                        ...editInvoiceReturnObject,
                        returnerID: value?.value ?? 0,
                      })
                    }}
                  />
                </div>
              </div>
            }
          </div>
          <div className="flex space-x-2 items-center">
            {allTeamsQuery.isLoading &&
              <div className="flex h-full w-[200px] items-center">
                <LoadingDots height={40} />
              </div>
            }
            {allTeamsQuery.isSuccess &&
              <div className="flex flex-col space-y-1">
                <label htmlFor="team">Бригада</label>
                <div className="w-[200px]">
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isSearchable={true}
                    isClearable={true}
                    name="team"
                    placeholder={""}
                    value={selectedTeam}
                    options={allTeams}
                    onChange={(value) => {
                      setSelectedTeam(value ?? { label: "", value: 0 })
                      setEditInvoiceReturnObject({
                        ...editInvoiceReturnObject,
                        returnerID: value?.value ?? 0,
                      })
                    }}
                  />
                </div>
              </div>
            }
            {allWorkersQuery.isLoading &&
              <div className="flex h-full w-[200px] items-center">
                <LoadingDots height={40} />
              </div>
            }
            {allWorkersQuery.isSuccess &&
              <div className="flex flex-col space-y-1">
                <label htmlFor="acceptor">Принял</label>
                <div className="w-[200px]">
                  <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isSearchable={true}
                    isClearable={true}
                    name="acceptor"
                    placeholder={""}
                    value={selectedAcceptor}
                    options={allWorkers}
                    onChange={(value) => {
                      setSelectedAcceptor(value ?? { label: "", value: 0 })
                      setEditInvoiceReturnObject({
                        ...editInvoiceReturnObject,
                        acceptedByWorkerID: value?.value ?? 0,
                      })
                    }}
                  />
                </div>
              </div>
            }
            <div className="flex flex-col space-y-1">
              <label htmlFor="dateOfInvoice">Дата накладной</label>
              <div className="py-[4px] px-[8px] border-[#cccccc] border rounded-[4px]">
                <DatePicker
                  name="dateOfInvoice"
                  className="outline-none w-full"
                  dateFormat={"dd-MM-yyyy"}
                  selected={editInvoiceReturnObject.dateOfInvoice}
                  onChange={(date) => setEditInvoiceReturnObject({ ...editInvoiceReturnObject, dateOfInvoice: date ?? new Date(+0) })}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex">
            <div
              onClick={() => onMutationSubmit()}
              className="text-white py-2.5 px-5 rounded-lg bg-gray-700 hover:bg-gray-800 hover:cursor-pointer"
            >
              {updateInvoiceReturnMutation.isLoading ? <LoadingDots height={30} /> : "Опубликовать"}
            </div>
          </div>
        </div>
        <div>
          <div className="flex space-x-2 items-center justify-between">
            <p className="text-xl font-semibold text-gray-800">Материалы наклданой</p>
          </div>
          {/* table head START */}
          <div className="grid grid-cols-7 text-sm font-bold shadow-md text-left mt-2 w-full border-box">
            <div className="px-4 py-3">
              <span>Наименование</span>
            </div>
            <div className="px-4 py-3">
              <span>Ед.Изм.</span>
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
          <div className="grid grid-cols-7 text-sm text-left mt-2 w-full border-box">
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
          {invoiceMaterialsForEditQuery.isLoading &&
            <div className="grid grid-cols-6 text-sm text-left mt-2 w-full border-box overflow-y-auto max-h-[35vh]">
              <div className="px-4 py-3 col-span-6">
                <LoadingDots height={30} />
              </div>
            </div>
          }
          {invoiceMaterials.length > 0 &&
            <div className="grid grid-cols-7 text-sm text-left mt-2 w-full border-box overflow-y-auto max-h-[50vh]">
              {invoiceMaterials.map((value, index) =>
                <Fragment key={index}>
                  <div className="px-4 py-3">{value.materialName}</div>
                  <div className="px-4 py-3">{value.unit}</div>
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
          locationType={editInvoiceReturnObject.returnerType}
          locationID={editInvoiceReturnObject.returnerID}
          addSerialNumbersToInvoice={addSerialNumbersToInvoice}
          materialID={invoiceMaterial.materialID}
        />
      }
    </Modal>
  )
}
