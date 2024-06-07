import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ENTRY_LIMIT } from "../../services/api/constants";
import IWorker from "../../services/interfaces/worker";
import { useEffect, useState } from "react";
import Button from "../../components/UI/button";
import LoadingDots from "../../components/UI/loadingDots";
import DeleteModal from "../../components/deleteModal";
import Modal from "../../components/Modal";
import Input from "../../components/UI/Input";
import Select from 'react-select'
import IReactSelectOptions from "../../services/interfaces/react-select";
import { JOB_TITLES } from "../../services/lib/jobTitles";
import { WorkerPaginatedData, createWorker, deleteWorker, getPaginatedWorker, getWorkerTemplateDocument, importWorker, updateWorker } from "../../services/api/worker";
import toast from "react-hot-toast";

export default function Worker() {
  //fetching data logic
  const tableDataQuery = useInfiniteQuery<WorkerPaginatedData, Error>({
    queryKey: ["workers"],
    queryFn: ({ pageParam }) => getPaginatedWorker({ pageParam }),
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
    deleteFunc: () => { }
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

  const [currentJobTitle, setCurrentJobTitle] = useState<IReactSelectOptions<string>>({ label: "", value: "" })
  const onJobTitleSelect = (value: null | IReactSelectOptions<string>) => {
    if (!value) {
      setCurrentJobTitle({ value: "", label: "" })
      setWorkerMutationData({ ...workerMutationData, jobTitle: "" })
      return
    }

    setCurrentJobTitle(value)
    setWorkerMutationData({ ...workerMutationData, jobTitle: value.value })
  }
  const [showMutationModal, setShowMutationModal] = useState<boolean>(false)
  const [mutationModalType, setMutationModalType] = useState<null | "update" | "create">()
  const [workerMutationData, setWorkerMutationData] = useState<IWorker>({
    id: 0,
    jobTitle: "",
    mobileNumber: "",
    name: "",
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

    if (workerMutationData.name == "") {
      toast.error("Не указано имя работника")
      return
    }

    if (workerMutationData.jobTitle == "") {
      toast.error("Не указано имя должность рабоника")
      return
    }

    if (workerMutationData.mobileNumber == "") {
      toast.error("Не указано мобильный номер работника")
      return
    }

    switch (mutationModalType) {
      case "create":
        createMaterialMutation.mutate(workerMutationData)
        return
      case "update":
        updateMaterialMutation.mutate(workerMutationData)
        return

      default:
        throw new Error("Неправильная операция была выбрана")
    }
  }

  const [showImportModal, setShowImportModal] = useState(false)

  const importMutation = useMutation<boolean, Error, File>({
    mutationFn: importWorker,
  })

  const acceptExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    importMutation.mutate(e.target.files[0], {
      onSuccess: () => {
        queryClient.invalidateQueries(["workers"])
        setShowImportModal(false)
      },
      onSettled: () => {
        e.target.value = ""
      },
      onError: (error) => {
        toast.error(`Импортированный файл имеет неправильные данные: ${error.message}`)
      }
    })
  }

  return (
    <main>
      <div className="mt-2 pl-2 flex space-x-2">
        <span className="text-3xl font-bold">Рабочий Персонал</span>
        <Button text="Импорт" onClick={() => setShowImportModal(true)} />
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
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3">{row.jobTitle}</td>
                <td className="px-4 py-3">{row.mobileNumber}</td>
                <td className="px-4 py-3 border-box flex space-x-3">
                  <Button text="Изменить" buttonType="default" onClick={() => {
                    setShowMutationModal(true)
                    setMutationModalType("update")
                    setWorkerMutationData(row)
                    setCurrentJobTitle({ value: row.jobTitle, label: row.jobTitle })
                  }}
                  />
                  <Button text="Удалить" buttonType="delete" onClick={() => onDeleteButtonClick(row)} />
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
              {mutationModalType == "create" && "Добавление работника"}
              {mutationModalType == "update" && "Изменение работника"}
            </h3>
            <div className="flex flex-col space-y-3 mt-2">
              <div className="flex flex-col space-y-1">
                <label htmlFor="name">Фамилия Имя</label>
                <Input
                  name="name"
                  type="text"
                  value={workerMutationData.name}
                  onChange={(e) => setWorkerMutationData({ ...workerMutationData, [e.target.name]: e.target.value })}
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="jobTitle">Должность</label>
                <Select
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  isClearable={true}
                  name={"job-title-select"}
                  placeholder={""}
                  value={currentJobTitle}
                  options={JOB_TITLES.map<IReactSelectOptions<string>>((value) => ({ label: value, value: value }))}
                  onChange={(value) => onJobTitleSelect(value)}
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="mobileNumber">Номера телефона</label>
                <Input
                  name="mobileNumber"
                  type="text"
                  value={workerMutationData.mobileNumber}
                  onChange={(e) => setWorkerMutationData({ ...workerMutationData, [e.target.name]: e.target.value })}
                />
              </div>
              <div>
                <Button
                  text={mutationModalType == "create" ? "Добавить" : "Подтвердить изменения"}
                  onClick={onMutationSubmit}
                />
              </div>
            </div>
          </div>
        </Modal>
      }
      {showImportModal &&
        <Modal setShowModal={setShowImportModal}>
          <span className="font-bold text-xl px-2 py-1">Импорт данных в Справочник - Персонал</span>
          <div className="grid grid-cols-2 gap-2 items-center px-2 pt-2">
            <Button text="Скачать шаблон" onClick={() => getWorkerTemplateDocument()} />
            <div className="w-full">
              <label
                htmlFor="file"
                className="w-full text-white py-3 px-5 rounded-lg bg-gray-700 hover:bg-gray-800 hover:cursor-pointer"
              >
                Импортировать данные
              </label>
              <input
                name="file"
                type="file"
                id="file"
                onChange={(e) => acceptExcel(e)}
                className="hidden"
              />
            </div>
          </div>
          <span className="text-sm italic px-2 w-full text-center">При импортировке система будет следовать правилам шаблона</span>
        </Modal>
      }
    </main>
  )
}
