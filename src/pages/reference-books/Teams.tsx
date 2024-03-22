import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ENTRY_LIMIT } from "../../services/api/constants";
import Button from "../../components/UI/button";
import LoadingDots from "../../components/UI/loadingDots";
import DeleteModal from "../../components/deleteModal";
import getPaginatedTeams, { TeamGetAllResponse, TeamPaginated } from "../../services/api/teams/getAllPaginated";
import { ITeam } from "../../services/interfaces/teams";
import deleteTeam from "../../services/api/teams/delete";
import createTeam from "../../services/api/teams/create";
import updateTeam from "../../services/api/teams/update";
import Modal from "../../components/Modal";
import Input from "../../components/UI/Input";
import WorkerSelect from "../../components/WorkerSelect";
import IReactSelectOptions from "../../services/interfaces/react-select";

export default function Team() {
  //fetching data logic
  const tableDataQuery = useInfiniteQuery<TeamGetAllResponse, Error>({
    queryKey: ["teams"],
    queryFn: ({pageParam}) => getPaginatedTeams({pageParam}),
    getNextPageParam: (lastPage) => {
      if (lastPage.page * ENTRY_LIMIT > lastPage.count) return undefined
      return lastPage.page + 1
    }
  })
  const [tableData, setTableData] = useState<TeamPaginated[]>([])
  useEffect(() => {
    if (tableDataQuery.isSuccess && tableDataQuery.data) {
      const data: TeamPaginated[] = tableDataQuery.data.pages.reduce<TeamPaginated[]>((acc, page) => [...acc, ...page.data], [])
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

  //delete logic
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries(["teams"])
    }
  })
  const [modalProps, setModalProps] = useState({
    setShowModal: setShowModal,
    no_delivery: "",
    deleteFunc: () => {}
  })
  const onDeleteButtonClick = (row: TeamPaginated) => {
    setShowModal(true)
    setModalProps({
      deleteFunc: () => deleteMutation.mutate(row.id),
      no_delivery: row.number,
      setShowModal: setShowModal,
    })
  }

  //mutation CREATE AND EDIT logic
  const [showMutationModal, setShowMutationModal] = useState<boolean>(false)
  const [mutationModalType, setMutationModalType] = useState<null | "update" | "create">()
  const [selectedTeamLeaderWorkerID, setSelectedTeamLeaderWorkerID] = useState<IReactSelectOptions<number>>({label:"", value: 0})
  const [mutationData, setMutationData] = useState<ITeam>({
    company: "",
    id: 0,
    leaderWorkerID: 0,
    mobileNumber: "",
    number: "",
  })
  const [mutationModalErrors, setMutationModalErrors] = useState({
    company: false,
    mobileNumber: false,
    number: false,
    leaderWorkerID: false,
  })

  useEffect(() => {
    setMutationData({...mutationData, leaderWorkerID: selectedTeamLeaderWorkerID.value})
  }, [selectedTeamLeaderWorkerID])
  const createMaterialMutation = useMutation<ITeam, Error, ITeam>({
    mutationFn: createTeam,
    onSettled: () => {  









      
      queryClient.invalidateQueries(["teams"])
      setShowMutationModal(false)
    }
  })
  const updateMaterialMutation = useMutation<ITeam, Error, ITeam>({
    mutationFn: updateTeam,
    onSettled: () => {
      queryClient.invalidateQueries(["teams"])
      setShowMutationModal(false)
    }
  })

  const onMutationSubmit = () => {
    if (mutationData.company == "") setMutationModalErrors((prev) => ({...prev, company: true}))
    else setMutationModalErrors((prev) => ({...prev, company: false}))
    
    if (mutationData.leaderWorkerID == 0) setMutationModalErrors((prev) => ({...prev, leaderWorkerID: true}))
    else setMutationModalErrors((prev) => ({...prev, leaderWorkerID: false}))
    
    if (mutationData.number == "") setMutationModalErrors((prev) => ({...prev, number: true}))
    else setMutationModalErrors((prev) => ({...prev, number: false}))

    if (mutationData.mobileNumber == "") setMutationModalErrors((prev) => ({...prev, mobileNumber: true}))
    else setMutationModalErrors((prev) => ({...prev, mobileNumber: false}))
    
    const isThereError = Object.keys(mutationData).some((value) => {
      if (mutationData[value as keyof typeof mutationData] == "" && value != "id") {
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
        <span className="text-3xl font-bold">Бригады</span>
      </div>
      <table className="table-auto text-sm text-left mt-2 w-full border-box">
        <thead className="shadow-md border-t-2">
          <tr>
            <th className="px-4 py-3 w-[150px]">
              <span>Бригада №</span>
            </th>
            <th className="px-4 py-3">
              <span>Бригадир</span>
            </th>
            <th className="px-4 py-3">
              <span>Телефон</span>
            </th>
            <th className="px-4 py-3 w-[150px]">
              <span>Компания</span>
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
                <td className="px-4 py-3">{row.number}</td>
                <td className="px-4 py-3">{row.leaderName}</td>
                <td className="px-4 py-3">{row.mobileNumber}</td>
                <td className="px-4 py-3">{row.company}</td>
                <td className="px-4 py-3 border-box flex space-x-3">
                  <Button text="Изменить" buttonType="default" onClick={() => {
                      setShowMutationModal(true)
                      setMutationModalType("update")
                      setMutationData({
                        company: row.company,
                        id: row.id,
                        mobileNumber: row.mobileNumber,
                        number: row.number,
                        leaderWorkerID: row.id,
                      })
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
          <span>При подтверждении бригада под номером {modalProps.no_delivery} и все их данные будут удалены</span>
        </DeleteModal>
      }
      {showMutationModal &&
        <Modal setShowModal={setShowMutationModal}>
          <div className="">
            <h3 className="text-xl font-medium text-gray-800">
              {mutationModalType == "create" && "Добавление бригады"}
              {mutationModalType == "update" && "Изменение бригады"}
            </h3>
            <div className="flex flex-col space-y-3 mt-2">
              <div className="flex flex-col space-y-1">
                <label htmlFor="number">Номер Бригады</label>
                <Input 
                  name="number"
                  type="text"
                  value={mutationData.number}
                  onChange={(e) => setMutationData({...mutationData, [e.target.name]: e.target.value})}
                />
                {mutationModalErrors.number && <span className="text-red-600 text-sm font-bold">Не указано номер бригады</span>}
              </div>
              <WorkerSelect 
                jobTitle="Бригадир"
                selectedWorkerID={selectedTeamLeaderWorkerID}
                setSelectedWorkerID={setSelectedTeamLeaderWorkerID}
                title="Лидер бригады"
              />
              <div className="flex flex-col space-y-1">
                <label htmlFor="mobileNumber">Основной номер телефона бригады</label>
                <Input 
                  name="mobileNumber"
                  type="text"
                  value={mutationData.mobileNumber}
                  onChange={(e) => setMutationData({...mutationData, [e.target.name]: e.target.value})}
                />
                {mutationModalErrors.mobileNumber && <span className="text-red-600 text-sm font-bold">Не указан номер телефона бригады</span>}
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="company">Компания</label>
                <Input 
                  name="company"
                  type="text"
                  value={mutationData.company}
                  onChange={(e) => setMutationData({...mutationData, [e.target.name]: e.target.value})}
                />
                {mutationModalErrors.company && <span className="text-red-600 text-sm font-bold">Не указана компания бригады</span>}
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