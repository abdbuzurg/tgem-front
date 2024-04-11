import { Fragment, useState } from "react"
import Modal from "../../Modal"
import Input from "../../UI/Input"
import { Accordion } from "flowbite-react"
import { Permission } from "../../../services/interfaces/permission"
import { AVAILABLE_PERMISSION_LIST } from "../../../services/lib/availablePermissionList"
import Button from "../../UI/button"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createRole } from "../../../services/api/role"
import { createPermissions } from "../../../services/api/permission"
import toast from "react-hot-toast"

interface Props {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
}

export default function AddNewRoleModal({ setShowModal }: Props) {
  //Role Data
  const [roleData, setRoleData] = useState<IRole>({
    id: 0,
    name: "",
    description: "",
  })

  const [permissions, setPermissions] = useState<Permission[]>([])

  const onChange = (e: React.FormEvent<HTMLInputElement>) => {
    
    const url = e.currentTarget.name
    const value = e.currentTarget.value

    const index = permissions.findIndex((permission) => 
      permission.resourceURL == url 
    )

    if (index != -1) {

      if (value == "r") permissions[index].r = !permissions[index].r
      if (value == "w") permissions[index].w = !permissions[index].w 
      if (value == "u") permissions[index].u = !permissions[index].u
      if (value == "d") permissions[index].d = !permissions[index].d
      
      if (!permissions[index].r && !permissions[index].w && !permissions[index].u && !permissions[index].d) {
        permissions.splice(index, 1)
      }

      setPermissions(permissions)

    } else {
      const permission = {
        id: 0,
        roleID: 0,
        resourceName: "",
        resourceURL: url,
        r: value == "r",
        w: value == "w",
        u: value == "u",
        d: value == "d"
      }

      setPermissions([
        ...permissions, 
        permission,
      ])

    } 
  }

  const queryClient = useQueryClient()

  const createPermissionsMutation = useMutation<boolean, Error, Permission[]>({
    mutationFn: createPermissions,
  })

  const createRoleMutation = useMutation<IRole, Error, IRole>({
    mutationFn: createRole,
    onSuccess: () => {
      createPermissionsMutation.mutate(permissions)
      queryClient.invalidateQueries(["all-roles"]) 
      setShowModal(false)
    }
  })

  const onSubmitRole = () => {

    if (roleData.name == "") {
      toast.error("Не указано имя роли")
      return
    } 

    if (roleData.description == "") {
      toast.error("Не указано описание для роли")
      return
    } 

    if (permissions.length == 0) {
      toast.error("Роль должна иметь хоть 1 доступ.")
      return
    }
  
    const loadingToast = toast.loading("Сохранение новых данных...")
    createRoleMutation.mutate(roleData, {
      onSuccess: () => {
        toast.success("Сохранение прошло успешно")
        setShowModal(false)
      },
      onSettled: () => {
        toast.dismiss(loadingToast)
      }
    })

  }

  return (
    <Modal setShowModal={setShowModal}>
      <div className="flex flex-col space-y-2">
        <h3 className="text-2xl font-medium text-gray-800">
          Добавление роли
        </h3>
        <div className="flex flex-col space-y-1">
          <label htmlFor="roleName">Имя роли</label>
          <Input
            id="roleName"
            value={roleData.name}
            type="text"
            onChange={(e) => setRoleData({ ...roleData, name: e.target.value })}
            name={"roleName"}
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label htmlFor="description">Описание роли</label>
          <Input
            id="description"
            value={roleData.description}
            type="text"
            onChange={(e) => setRoleData({ ...roleData, description: e.target.value })}
            name={"description"}
          />
        </div>
        <div className="flex flex-col space-y-1">
          <span>Список доступов для роли</span>
          <Accordion>
            {AVAILABLE_PERMISSION_LIST.map((permission, index) => (
              <Accordion.Panel key={index} className="outline-none">
                <Accordion.Title className="h-5">
                  {permission.title[0].toUpperCase() + permission.title.slice(1)}
                </Accordion.Title>
                <Accordion.Content className="px-2 py-2">
                  <div className="w-full text-center grid grid-cols-5 auto-cols-max gap-y-1">
                    <div className="w-full">
                      <span className="font-semibold">Ресурс</span>
                    </div>
                    <div className="w-full">
                      <span className="font-semibold">Просмотр</span>
                    </div>
                    <div className="w-full">
                      <span className="font-semibold">Добавление</span>
                    </div>
                    <div className="w-full">
                      <span className="font-semibold">Изменение</span>
                    </div>
                    <div className="w-full">
                      <span className="font-semibold">Удаление</span>
                    </div>
                    {permission.resource.map((value, resourceIndex) => (
                      <Fragment key={resourceIndex}>
                        <div className="w-full">
                          <span>
                            {value.name[0].toUpperCase() + value.name.slice(1)}
                          </span>
                        </div>
                        <div className="w-full">
                          <input 
                            type="checkbox" 
                            name={value.url} 
                            value="r"  
                            onChange={(e) => onChange(e)}
                          />
                        </div>
                        <div className="w-full">
                          <input 
                            type="checkbox" 
                            name={value.url} 
                            value="w" 
                            onChange={(e) => onChange(e)}
                          />
                        </div>
                        <div className="w-full">
                          <input 
                            type="checkbox" 
                            name={value.url} 
                            value="u" 
                            onChange={(e) => onChange(e)}
                          />
                        </div>
                        <div className="w-full">
                          <input 
                            type="checkbox" 
                            name={value.url} 
                            value="d" 
                            onChange={(e) => onChange(e)}
                          />
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </Accordion.Content>
              </Accordion.Panel>
            ))}          
          </Accordion>
        </div>
        <div>
          <Button 
            text="Добавить"
            onClick={() => onSubmitRole()}
          />
        </div>
      </div>
    </Modal>
  )
}
