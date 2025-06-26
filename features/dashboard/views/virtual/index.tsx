import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type {
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '../../types'

function stringify(value: unknown) {
  if (typeof value === 'string') return value
  if (value === undefined || value === null) return ''
  if (typeof value !== 'object') return JSON.stringify(value)

  const omitTypename = (key: string, value: any) => (key === '__typename' ? undefined : value)
  const dataWithoutTypename = JSON.parse(JSON.stringify(value), omitTypename)
  return JSON.stringify(dataWithoutTypename, null, 2)
}

export function Field(props: FieldProps<typeof controller>) {
  const { autoFocus, field, value } = props
  if (value === createViewValue) return null

  return (
    <div className="space-y-2">
      <Label htmlFor={field.path}>
        {field.label}
        {field.description && (
          <span className="text-sm text-muted-foreground block">
            {field.description}
          </span>
        )}
      </Label>
      <Input
        id={field.path}
        autoFocus={autoFocus}
        readOnly={true}
        value={stringify(value)}
        className="bg-muted"
      />
    </div>
  )
}

export const Cell: CellComponent<typeof controller> = ({ value }: { value: any; field: any; item: Record<string, unknown> }) => {
  return value != null ? <span>{stringify(value)}</span> : null
}

const createViewValue = Symbol('create view virtual field value')

export function controller(
  config: FieldControllerConfig<{ query: string }>
): FieldController<unknown> {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: `${config.path}${config.fieldMeta.query}`,
    defaultValue: createViewValue,
    deserialize: data => data[config.path],
    serialize: () => ({}),
  }
}