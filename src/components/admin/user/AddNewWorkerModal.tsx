import Modal from "../../Modal"
import Input from "../../UI/Input"
import Select from 'react-select'
import Button from "../../UI/button"
import IReactSelectOptions from "../../../services/interfaces/react-select"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import IWorker from "../../../services/interfaces/worker"
import { useState } from "react"
import { JOB_TITLES } from "../../../services/lib/jobTitles"
import { createWorker } from "../../../services/api/worker"

interface Props {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
}

export default function AddNewWorkerModal({ setShowModal }: Props) {
  const [workerMutationData, setWorkerMutationData] = useState<IWorker>({
    id: 0,
    jobTitle: "",
    mobileNumber: "",
    name: "",
  })
  //Job Select logic
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

  //Submitting the worker repo
  const queryClient = useQueryClient()

  const createMaterialMutation = useMutation<IWorker, Error, IWorker>({
    mutationFn: createWorker,
    onSettled: () => {
      queryClient.invalidateQueries(["workers"])
      setShowModal(false)
    }
  })

  const onMutationSubmit = () => {
    if (workerMutationData.jobTitle == "") {
      toast.error("Не выбрана должность")
      return
    }

    if (workerMutationData.name == "") {
      toast.error("Не указано имя сотрудника")
      return
    }

    if (workerMutationData.mobileNumber == "") {
      toast.error("Не указан мобильный номер")
      return
    }

    const loadingToast = toast.loading("Сохранение новых данных...")
    createMaterialMutation.mutate(workerMutationData, {
      onSuccess: () => {
        toast.success("Сохранение прошло успешно")
        queryClient.invalidateQueries(["all-workers"])
        setShowModal(false)
      },
      onSettled: () => {
        toast.dismiss(loadingToast)
      }
    })
  }

  return (
    <Modal setShowModal={setShowModal}>
      <div className="">
        <h3 className="text-xl font-medium text-gray-800">
          Добавление матераила
        </h3>
        <div className="flex flex-col space-y-3 mt-2">
          <div className="flex flex-col space-y-1">
            <label htmlFor="name">Фамилия Имя</label>
            <Input
              id="name"
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
              options={JOB_TITLES.map<IReactSelectOptions<string>>((value: string) => ({ label: value, value: value }))}
              onChange={(value) => onJobTitleSelect(value)}
            />
          </div>
          <div className="flex flex-col space-y-1">
            <label htmlFor="mobileNumber">Номера телефона</label>
            <Input
              id="mobileNumber"
              name="mobileNumber"
              type="text"
              value={workerMutationData.mobileNumber}
              onChange={(e) => setWorkerMutationData({ ...workerMutationData, [e.target.name]: e.target.value })}
            />
          </div>
          <div>
            <Button
              text="Добавить"
              onClick={onMutationSubmit}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}
