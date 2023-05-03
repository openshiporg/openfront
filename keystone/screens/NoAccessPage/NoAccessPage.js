/** @jsxRuntime classic */
/** @jsx jsx */

import { Stack } from "@keystone-ui/core"
import { AlertTriangleIcon } from "@keystone-ui/icons/icons/AlertTriangleIcon"
import { SignoutButton } from "../../../../admin-ui/components/SignoutButton"
import { ErrorContainer } from "../../../../admin-ui/components/Errors"

export const getNoAccessPage = props => () => <NoAccessPage {...props} />

export const NoAccessPage = ({ sessionsEnabled }) => {
  return (
    <ErrorContainer>
      <Stack align="center" gap="medium">
        <AlertTriangleIcon size="large" />
        <div>You don't have access to this page.</div>
        {sessionsEnabled ? <SignoutButton /> : null}
      </Stack>
    </ErrorContainer>
  )
}
