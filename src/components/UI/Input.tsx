interface Props {
  type: string
  name: string
  value: any
  disabled?: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export default function Input({
  type, 
  name, 
  value, 
  disabled = false,
  onChange, 
}: Props) {

  const disableStyles = () => {
    return disabled ? "bg-gray-500": "bg-white"
  }

  return (
    <input 
      type={type} 
      name={name}
      value={value} 
      onChange={onChange} 
      disabled={disabled}
      className={"py-1.5 px-2 rounded border-2 border-gray-800 " + disableStyles()}
    />
  )
}