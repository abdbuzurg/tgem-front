interface Props {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
  children: React.ReactNode
}

export default function Modal({setShowModal, children}: Props) {
  return (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto">
          <div
              className="fixed inset-0 w-full h-full bg-black opacity-40"
              onClick={() => setShowModal(false)}
          ></div>
          <div className="flex items-center min-h-screen px-4 py-8">
              <div className="relative w-full max-w-lg p-4 mx-auto bg-white rounded-md shadow-lg">
                  <div className="flex">
                      <div className="mt-2 text-center sm:text-left w-full">
                        {children}
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </>
  )
}