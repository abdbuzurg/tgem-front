import { useEffect, useState } from 'react'
import Select from 'react-select'
import IReactSelectOptions from '../services/interfaces/react-select'
import { useQuery } from '@tanstack/react-query'
import IWorker from '../services/interfaces/worker'
import axiosClient from '../services/api/axiosClient'
import IAPIResposeFormat from '../services/api/IAPIResposeFormat'

interface Props {
  title: string
  jobTitle: string
  selectedWorkerID: IReactSelectOptions<number>
  setSelectedWorkerID: React.Dispatch<React.SetStateAction<IReactSelectOptions<number>>>
  error?: boolean
  
}

export default function WorkerSelect({ title, jobTitle, selectedWorkerID, setSelectedWorkerID, error }:Props) {
  const [allData, setAllData] = useState<IReactSelectOptions<number>[]>([])

  const query = useQuery<IWorker[], Error, IWorker[]>({
    queryKey: [`worker`, jobTitle],
    queryFn: async () => {
      const responseRaw = await axiosClient.get<IAPIResposeFormat<IWorker[]>>(`/worker/job-title/${jobTitle}`)
      const response = responseRaw.data
      if (response.permission && response.success) {
        return response.data
      } else {
        throw new Error(response.error)
      }
    }
  })

  useEffect(() => {
    if (query.isSuccess && query.data) {
      setAllData([...query.data.map<IReactSelectOptions<number>>((value) => ({label: value.name, value: value.id}))])
    }
  }, [query.data])

  const onSelectChange = (value: IReactSelectOptions<number> | null) => {
    if (!value) {
      setSelectedWorkerID({label: "", value: 0})
      return
    }

    setSelectedWorkerID(value)
  }

  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={jobTitle}>{title[0].toUpperCase() + title.substring(1, title.length)}</label>
      <div className="w-[200px]">
        <Select
          className="basic-single"
          classNamePrefix="select"
          isSearchable={true}
          isClearable={true}
          name={jobTitle}
          placeholder={""}
          value={selectedWorkerID}
          options={allData}
          onChange={(value) => onSelectChange(value)}
        />
      </div>
      {error && <p className="text-red-500 text-sm font-semibold">Не выбрано</p>}
    </div>
  )
}