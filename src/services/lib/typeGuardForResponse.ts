import IAPIResposeFormat from "../api/IAPIResposeFormat";

export default function isCorrectResponseFormat<T>(object: any): object is IAPIResposeFormat<T> {
  return 'data' in object && 'success' in object && 'permission' in object && 'error' in object
}
