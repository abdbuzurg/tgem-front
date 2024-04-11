interface Props {
  type: string
  name: string
  value: any
  disabled?: boolean
  id?: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export default function Input({
  type, 
  name, 
  value, 
  id = "",
  disabled = false,
  onChange, 
}: Props) {

  const disableStyles = () => {
    return disabled ? "bg-gray-500": "bg-white"
  }

  return (
    <input
      id={id}
      type={type} 
      name={name}
      value={value} 
      onChange={onChange} 
      disabled={disabled}
      className={"py-1.5 px-2 rounded border-2 border-gray-800 w-full box-border" + disableStyles()}
    />
  )
}
