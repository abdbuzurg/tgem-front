import { useEffect,  useState } from "react";
import Button from "../components/UI/button";
import MutationUserModal from "../components/admin/user/MutationUserModal";
import { useInfiniteQuery } from "@tanstack/react-query";
import { UserPaginated, UserView, getPaginatedUser } from "../services/api/user";
import { ENTRY_LIMIT } from "../services/api/constants";
import UserPermissionModal from "../components/admin/user/UserPermissionModal";

export default function AdminUserPage() {
 //FETCHING LOGIC
  const tableDataQuery = useInfiniteQuery<UserPaginated, Error>({
    queryKey: ["users"],
    queryFn: ({ pageParam }) => getPaginatedUser({ pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page * ENTRY_LIMIT > lastPage.count) return undefined
      return lastPage.page + 1
    }
  })
  const [tableData, setTableData] = useState<UserView[]>([])
  useEffect(() => {
    if (tableDataQuery.isSuccess && tableDataQuery.data) {
      const data: UserView[] = tableDataQuery.data.pages.reduce<UserView[]>((acc, page) => [...acc, ...page.data], [])
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

  //Show Mutation Modal
  const [showMutationModal, setShowMutationModal] = useState(false)

  //Show User Permission Modal
  const [showUserPermissionModal, setShowUserPermissionModal] = useState(false)
  const [userPermissionModalProps, setUserPermissionModalProps] = useState({
    workerName: "",
    roleName: "",
  })
  const onShowUserPermissionButton = (workerName: string, roleName: string) => {
    setUserPermissionModalProps({
      workerName,
      roleName,
    })
    setShowUserPermissionModal(true)
  } 

  //Show User Logs Modal
  const [showUserLogsModal, setShowUserLogsModal] = useState(false)

  return (
    <main>
      <div className="mt-2 px-2 flex justify-between">
        <span className="text-3xl font-bold">Администрирование пользователями</span>
     </div>
      <div>
      </div>
      <table className="table-auto text-sm text-left mt-2 w-full border-box">
        <thead className="shadow-md border-t-2">
          <tr>
            <th className="px-4 py-3">
              <span>Логин</span>
            </th>
            <th className="px-4 py-3">
              <span>ФИО</span>
            </th>
             <th className="px-4 py-3">
              <span>Должность</span>
            </th>
            <th className="px-4 py-3">
              <span>Мобильный номер</span>
            </th>
            <th className="px-4 py-3">
              <span>Роль</span>
            </th>
             <th className="px-4 py-3">
                <Button 
                  text="Добавить" 
                  onClick = {() => setShowMutationModal(true)} 
                />
             </th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr key={index}>
              <td className="px-4 py-3">{row.username}</td>
              <td className="px-4 py-3">{row.workerName}</td>
              <td className="px-4 py-3">{row.workerJobTitle}</td>
              <td className="px-4 py-3">{row.workerMobileNumber}</td>
              <td className="px-4 py-3">{row.roleName}</td>
              <td className="px-4 py-3 flex space-x-2">
                <Button 
                  text="Доступы"
                  onClick={() => onShowUserPermissionButton(row.workerName, row.roleName)}
                />
                <Button
                  text="Логи"
                  onClick={() => setShowUserLogsModal(true)}
                />
              </td> 
            </tr>          
          ))}
        </tbody>
      </table>
      {showMutationModal && <MutationUserModal setShowModal={setShowMutationModal} />}
      {showUserPermissionModal && <UserPermissionModal 
          setShowModal={setShowUserPermissionModal}
          roleName={userPermissionModalProps.roleName}
          workerName={userPermissionModalProps.workerName}
        />
      }
      {showUserLogsModal}
    </main>
  ) 
}
