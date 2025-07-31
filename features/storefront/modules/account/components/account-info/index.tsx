import { Badge } from "@/components/ui/badge" // Shadcn Badge
import { Button } from "@/components/ui/button" // Shadcn Button
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

import useToggleState from "@/features/storefront/lib/hooks/use-toggle-state"
import { useFormStatus } from "react-dom";
import { RiLoader2Fill } from "@remixicon/react"

type AccountInfoProps = {
  label: string
  currentInfo: string | React.ReactNode
  isSuccess?: boolean
  isError?: boolean
  errorMessage?: string
  clearState: () => void
  children?: React.ReactNode
  'data-testid'?: string
}

const AccountInfo = ({
  label,
  currentInfo,
  isSuccess,
  isError,
  clearState,
  errorMessage = "An error occurred, please try again",
  children,
  'data-testid': dataTestid
}: AccountInfoProps) => {
  const { state, close, toggle } = useToggleState()

  const { pending } = useFormStatus()

  const handleToggle = () => {
    clearState()
    setTimeout(() => toggle(), 100)
  }

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  return (
    <div className="text-xs font-normal" data-testid={dataTestid}> 
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="uppercase text-foreground">{label}</span> 
          <div className="flex items-center flex-1 basis-0 justify-end gap-x-4">
            {typeof currentInfo === "string" ? (
              <span className="font-semibold" data-testid="current-info">{currentInfo}</span>
            ) : (
              currentInfo
            )}
          </div>
        </div>
        <div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={handleToggle}
            type={state ? "reset" : "button"}
            data-testid="edit-button"
            data-active={state}
          >
            {state ? "Cancel" : "Edit"}
          </Button>
        </div>
      </div>

      {/* Success state - using regular div with custom animation */}
      <div 
        className={cn( 
          "transition-all duration-300 ease-in-out overflow-hidden",
          {
            "max-h-[1000px] opacity-100": isSuccess,
            "max-h-0 opacity-0": !isSuccess,
          }
        )}
        data-testid="success-message"
      >
        <Badge className="p-2 my-4" variant="default"> 
          <span>{label} updated succesfully</span>
        </Badge>
      </div>

      {/* Error state - using regular div with custom animation */}
      <div
        className={cn( 
          "transition-all duration-300 ease-in-out overflow-hidden",
          {
            "max-h-[1000px] opacity-100": isError,
            "max-h-0 opacity-0": !isError,
          }
        )}
        data-testid="error-message"
      >
        <Badge className="p-2 my-4" variant="destructive">
          <span>{errorMessage}</span>
        </Badge>
      </div>

      {/* Proper Collapsible component for the edit form */}
      <Collapsible open={state}>
        <CollapsibleContent
          className={cn( 
            "transition-all duration-300 ease-in-out overflow-visible",
            {
              "max-h-[1000px] opacity-100": state,
              "max-h-0 opacity-0": !state,
            }
          )}
        >
          <div className="flex flex-col gap-y-2 py-4">
            <div>{children}</div>
            <div className="flex items-center justify-end mt-2">
              <Button
                disabled={pending} // Disable button when pending
                className="w-full sm:max-w-[140px]"
                type="submit"
                data-testid="save-button"
              >
                {pending && <RiLoader2Fill className="animate-spin"/>}
                Save
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export default AccountInfo
