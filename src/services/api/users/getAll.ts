import IUsers from "../../interfaces/users";
import IAPIResposeFormat from "../IAPIResposeFormat";
import axiosClient from "../axiosClient";

export default async function getAllUsers() {
  const responseRaw = await axiosClient.get<IAPIResposeFormat<IUsers[]>>("/users/all")
  const response = responseRaw.data
  if (response.success) {
    return response.data
  } else {
    throw new Error(response.error)
  }
}