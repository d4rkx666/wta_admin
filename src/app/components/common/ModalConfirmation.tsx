import { XMarkIcon } from "@heroicons/react/24/outline"

type ConfirmationModalProps = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  isDangerous?: boolean
  additionalContent?: React.ReactNode
}

const ModalConfirmation = ({
  isOpen,
  setIsOpen,
  onConfirm,
  title = "Confirmation",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  isDangerous = true,
  additionalContent,
}: ConfirmationModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-100 overflow-y-auto">
      <div
        className="fixed inset-0 bg-gray-600/70 transition-opacity"
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
      ></div>

      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all w-full max-w-2xl">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <button
                type="button"
                className="rounded-md p-1 text-white hover:bg-blue-500 focus:outline-none"
                onClick={() => setIsOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className={`space-y-4 text-center ${isDangerous ? "text-red-600" : "text-gray-700"}`}>
              <p className="text-lg">{message}</p>
              {additionalContent}
            </div>

            <div className="mt-6 flex justify-center space-x-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {cancelText}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={onConfirm}
                className={`inline-flex items-center rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-70 ${
                  isDangerous
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isLoading ? "Processing..." : confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalConfirmation