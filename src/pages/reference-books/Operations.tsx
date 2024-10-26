import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Select from 'react-select'
import { ENTRY_LIMIT } from "../../services/api/constants";
import { useEffect, useState } from "react";
import Button from "../../components/UI/button";
import LoadingDots from "../../components/UI/loadingDots";
import DeleteModal from "../../components/deleteModal";
import Modal from "../../components/Modal";
import Input from "../../components/UI/Input";
import { IOperation } from "../../services/interfaces/operation";
import toast from "react-hot-toast";
import IReactSelectOptions from "../../services/interfaces/react-select";
import Material from "../../services/interfaces/material";
import getAllMaterials from "../../services/api/materials/getAll";
import updateOperation, { OperationGetAllResponse, OperationMutation, OperationPaginated, OperationSearchParameters, createOperation, deleteOperation, getAllOperations, getPaginatedOperations } from "../../services/api/operation";

export default function Operatons() {
  //fetching data logic

  const [searchParameters, setSearchParameters] = useState<OperationSearchParameters>({
    name: "",
    code: "",
    materialID: 0,
  })

  const tableDataQuery = useInfiniteQuery<OperationGetAllResponse, Error>({
    queryKey: ["operations", searchParameters],
    queryFn: ({ pageParam }) => getPaginatedOperations({ pageParam }, searchParameters),
    getNextPageParam: (lastPage) => {
      if (lastPage.page * ENTRY_LIMIT > lastPage.count) return undefined
      return lastPage.page + 1
    }
  })
  const [tableData, setTableData] = useState<OperationPaginated[]>([])
  useEffect(() => {
    if (tableDataQuery.isSuccess && tableDataQuery.data) {
      const data: OperationPaginated[] = tableDataQuery.data.pages.reduce<OperationPaginated[]>((acc, page) => [...acc, ...page.data], [])
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
    deleteFunc: () => { }
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
  const [operationMutationData, setOperationMutationData] = useState<OperationMutation>({
    id: 0,
    projectID: 0,
    name: "",
    code: "",
    costPrime: 0,
    costWithCustomer: 0,
    materialID: 0,
    plannedAmountForProject: 0,
    showPlannedAmountInReport: false,
  })

  const [selectedMaterial, setSelectedMaterial] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })
  const [allMaterials, setAllMaterials] = useState<IReactSelectOptions<number>[]>([])
  const allMaterialsQuery = useQuery<Material[], Error, Material[]>({
    queryKey: ["all-materials"],
    queryFn: getAllMaterials,
  })
  useEffect(() => {
    if (allMaterialsQuery.isSuccess && allMaterialsQuery.data) {
      setAllMaterials(allMaterialsQuery.data.map<IReactSelectOptions<number>>(val => ({
        label: val.name,
        value: val.id,
      })))
    }
  }, [allMaterialsQuery.data])

  const createOperationMutation = useMutation<IOperation, Error, OperationMutation>({
    mutationFn: createOperation,
    onSuccess: () => {
      queryClient.invalidateQueries(["operations"])
      setShowMutationModal(false)
      setOperationMutationData({
        id: 0,
        projectID: 0,
        code: "",
        costPrime: 0,
        costWithCustomer: 0,
        name: "",
        materialID: 0,
        plannedAmountForProject: 0,
        showPlannedAmountInReport: false,
      })
      setSelectedMaterial({ label: "", value: 0 })
    }
  })

  const updateOperationMutation = useMutation<IOperation, Error, OperationMutation>({
    mutationFn: updateOperation,
    onSuccess: () => {
      queryClient.invalidateQueries(["operations"])
      setShowMutationModal(false)
      setOperationMutationData({
        id: 0,
        projectID: 0,
        code: "",
        costPrime: 0,
        costWithCustomer: 0,
        name: "",
        materialID: 0,
        plannedAmountForProject: 0,
        showPlannedAmountInReport: false,
      })
      setSelectedMaterial({ label: "", value: 0 })
    }
  })
  const onMutationSubmit = () => {

    if (operationMutationData.name == "") {
      toast.error("Не указано наименование услуги")
      return
    }

    if (operationMutationData.code == "") {
      toast.error("Не указан код услуги")
      return
    }

    if (operationMutationData.showPlannedAmountInReport && operationMutationData.plannedAmountForProject <= 0) {
      toast.error('Запланированное количество должны быть больше 0 если вы ставите галочку в - Показать в отчете "Xод работы проекта"')
      return
    }


    switch (mutationModalType) {
      case "create":
        createOperationMutation.mutate(operationMutationData)
        break

      case "update":
        updateOperationMutation.mutate(operationMutationData)
        break

      default:
        throw new Error("Неправильная операция была выбрана")
    }
  }

  const [showSearchModal, setShowSearchModal] = useState(false)

  const [selectedOperationName, setSelectedOperationName] = useState<IReactSelectOptions<string>>({ label: "", value: "" })
  const [allOperationsNames, setAllOperationsNames] = useState<IReactSelectOptions<string>[]>([])
  const [selectedOperationCode, setSelectedOperationCode] = useState<IReactSelectOptions<string>>({ label: "", value: "" })
  const [allOperationCodes, setAllOperationsCodes] = useState<IReactSelectOptions<string>[]>([])
  const allOperationQuery = useQuery<OperationPaginated[], Error, OperationPaginated[]>({
    queryKey: ["all-operations"],
    queryFn: getAllOperations,
    enabled: false,
  })
  useEffect(() => {
    if (allOperationQuery.isSuccess && allOperationQuery.data) {
      setAllOperationsNames(allOperationQuery.data.map<IReactSelectOptions<string>>(val => ({
        label: val.name,
        value: val.name,
      })))

      setAllOperationsCodes(allOperationQuery.data.map<IReactSelectOptions<string>>(val => ({
        label: val.code,
        value: val.code,
      })))
    }
  }, [allOperationQuery.data])

  const [selectedMaterialForSearch, setSelectedMaterialForSearch] = useState<IReactSelectOptions<number>>({ label: "", value: 0 })

  return (
    <main>
      <div className="mt-2 pl-2 flex space-x-2">
        <span className="text-3xl font-bold">Услуги</span>
        <div
          onClick={() => {
            allOperationQuery.refetch()
            setShowSearchModal(true)
          }}
          className="text-white py-2.5 px-5 rounded-lg bg-gray-700 hover:bg-gray-800 hover:cursor-pointer"
        >
          Поиск
        </div>
        <div
          onClick={() => {
            setSearchParameters({
              name: "",
              code: "",
              materialID: 0,
            })
            setSelectedOperationCode({ label: "", value: "" })
            setSelectedOperationName({ label: "", value: "" })
            setSelectedMaterialForSearch({ label: "", value: 0 })
          }}
          className="text-white py-2.5 px-5 rounded-lg bg-red-700 hover:bg-red-800 hover:cursor-pointer"
        >
          Сброс поиска
        </div>
      </div>
      <table className="table-auto text-sm text-left mt-2 w-full border-box">
        <thead className="shadow-md border-t-2">
          <tr>
            <th className="px-4 py-3 w-[100px]">
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
              <span>Привязанный материал</span>
            </th>
            <th className="px-4 py-3">
              <Button text="Добавить" onClick={() => {
                setMutationModalType("create")
                setShowMutationModal(true)
                setOperationMutationData({
                  id: 0,
                  projectID: 0,
                  code: "",
                  costPrime: 0,
                  costWithCustomer: 0,
                  name: "",
                  materialID: 0,
                  plannedAmountForProject: 0,
                  showPlannedAmountInReport: false,
                })
                setSelectedMaterial({ label: "", value: 0 })
              }} />
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
                <td className="px-4 py-3">{row.materialName}</td>
                <td className="px-4 py-3 border-box flex space-x-3">
                  <Button text="Изменить" buttonType="default" onClick={() => {
                    setShowMutationModal(true)
                    setMutationModalType("update")
                    setOperationMutationData(row)
                    setSelectedMaterial({ label: row.materialName, value: row.materialID })
                  }}
                  />
                  <Button text="Удалить" buttonType="delete" onClick={() => onDeleteButtonClick(row)} />
                </td>
              </tr>
            ))
          }
          {tableDataQuery.hasNextPage &&
            <tr>
              <td colSpan={5}>
                <div className="w-full py-4 flex justify-center">
                  <div
                    onClick={() => tableDataQuery.fetchNextPage()}
                    className="text-white py-2.5 px-5 rounded-lg bg-gray-700 hover:bg-gray-800 hover:cursor-pointer"
                  >
                    {tableDataQuery.isLoading && <LoadingDots height={30} />}
                    {!tableDataQuery.isLoading && "Загрузить еще"}
                  </div>
                </div>
              </td>
            </tr>
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
              {mutationModalType == "create" && "Добавление услуги"}
              {mutationModalType == "update" && "Изменение услуги"}
            </h3>
            <div className="flex flex-col space-y-3 mt-2">
              <div className="flex flex-col space-y-1">
                <label htmlFor="name">Наименование<span className="text-red-600">*</span></label>
                <Input
                  name="name"
                  type="text"
                  value={operationMutationData.name}
                  onChange={(e) => setOperationMutationData({ ...operationMutationData, name: e.target.value })}
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="code">Код<span className="text-red-600">*</span></label>
                <Input
                  name="code"
                  type="text"
                  value={operationMutationData.code}
                  onChange={(e) => setOperationMutationData({ ...operationMutationData, code: e.target.value })}
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="costPrime">Изначальная Цена</label>
                <Input
                  name="costPrime"
                  type="number"
                  value={operationMutationData.costPrime}
                  onChange={(e) => setOperationMutationData({ ...operationMutationData, costPrime: e.target.valueAsNumber })}
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="costWithCustomer">Цена с заказчиком</label>
                <Input
                  name="costWithCustomer"
                  type="number"
                  value={operationMutationData.costWithCustomer}
                  onChange={(e) => setOperationMutationData({ ...operationMutationData, costWithCustomer: e.target.valueAsNumber })}
                />
              </div>
              <div className="flex flex-col space-y-1">
                {allMaterialsQuery.isLoading && <LoadingDots height={30} />}
                {allMaterialsQuery.isSuccess &&
                  <>
                    <label htmlFor="material">Материал</label>
                    <Select
                      className="basic-single"
                      classNamePrefix="select"
                      isSearchable={true}
                      isClearable={true}
                      name={"material"}
                      placeholder={""}
                      value={selectedMaterial}
                      options={allMaterials}
                      onChange={(value) => {
                        setSelectedMaterial(value ?? { label: "", value: 0 })
                        setOperationMutationData({
                          ...operationMutationData,
                          materialID: value?.value ?? 0,
                        })
                      }}
                    />
                  </>
                }
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="code">Запланированное количество<span className="text-red-600">*</span></label>
                <Input
                  name="plannedAmountForProject"
                  type="number"
                  value={operationMutationData.plannedAmountForProject}
                  onChange={(e) => setOperationMutationData({ ...operationMutationData, [e.target.name]: e.target.valueAsNumber })}
                />
              </div>
              <div className="flex flex-col space-y-1">
                <div className="flex space-x-2 items-center">
                  <input type="checkbox" id="hasSerialNumber" value={1} name="hasSerialNumber" onChange={
                    (e) => {
                      if (e.target.checked) {
                        setOperationMutationData({ ...operationMutationData, showPlannedAmountInReport: true })
                      } else {
                        setOperationMutationData({ ...operationMutationData, showPlannedAmountInReport: false })
                      }
                    }
                  }
                  />
                  <label htmlFor="hasSerialNumber">Показать в отчете "Xод работы проекта"</label>
                </div>
              </div>
              <div className="flex">
                <div className="text-white py-2.5 px-5 rounded-lg bg-gray-700 hover:bg-gray-800 hover:cursor-pointer" onClick={() => onMutationSubmit()}>
                  {mutationModalType == "create" && !createOperationMutation.isLoading && "Добавить"}
                  {mutationModalType == "create" && createOperationMutation.isLoading && <LoadingDots height={30} />}
                  {mutationModalType == "update" && !updateOperationMutation.isLoading && "Подтвердить изменения"}
                  {mutationModalType == "update" && updateOperationMutation.isLoading && <LoadingDots height={30} />}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      }
      {showSearchModal &&
        <Modal setShowModal={setShowSearchModal}>
          <span className="font-bold text-xl py-1">Параметры Поиска по сравочнику услуг</span>
          {allMaterialsQuery.isLoading && <LoadingDots />}
          {allMaterialsQuery.isSuccess &&
            <div className="p-2 flex flex-col space-y-2">
              <div className="flex flex-col space-y-1">
                <label htmlFor="material-names">Наименование</label>
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  isClearable={true}
                  name={"operation-names"}
                  placeholder={""}
                  value={selectedOperationName}
                  options={allOperationsNames}
                  onChange={value => {
                    setSelectedOperationName(value ?? { label: "", value: "" })
                    setSearchParameters({
                      ...searchParameters,
                      name: value?.value ?? "",
                    })
                  }}
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="material-category">Код</label>
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  isClearable={true}
                  name={"operation-code"}
                  placeholder={""}
                  value={selectedOperationCode}
                  options={allOperationCodes}
                  onChange={value => {
                    setSelectedOperationCode(value ?? { label: "", value: "" })
                    setSearchParameters({
                      ...searchParameters,
                      code: value?.value ?? "",
                    })
                  }}
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="material-code">Название материала</label>
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  isClearable={true}
                  name={"material-code"}
                  placeholder={""}
                  value={selectedMaterialForSearch}
                  options={allMaterials}
                  onChange={value => {
                    setSelectedMaterialForSearch(value ?? { label: "", value: 0 })
                    setSearchParameters({
                      ...searchParameters,
                      materialID: value?.value ?? 0,
                    })
                  }}
                />
              </div>
            </div>
          }
        </Modal>
      }
    </main>
  )
}
