const Radio = ({ checked, 'data-testid': dataTestId }: { checked: boolean, 'data-testid'?: string }) => {
  return (
    <>
      <button
        type="button"
        role="radio"
        aria-checked="true"
        data-state={checked ? "checked" : "unchecked"}
        className="group relative flex h-5 w-5 items-center justify-center outline-none"
        data-testid={dataTestId || 'radio-button'}
      >
        <div className="ring-1 ring-border group-hover:ring-2 group-hover:ring-ring group-hover:shadow-md bg-background group-data-[state=checked]:bg-primary group-data-[state=checked]:ring-1 group-data-[state=checked]:ring-primary group-focus:ring-2 group-focus:ring-ring group-focus:ring-offset-2 group-disabled:bg-muted group-disabled:ring-1 group-disabled:ring-border flex h-[14px] w-[14px] items-center justify-center rounded-full transition-all">
          {checked && (
            <span
              data-state={checked ? "checked" : "unchecked"}
              className="group flex items-center justify-center"
            >
              <div className="bg-background shadow group-disabled:bg-muted-foreground rounded-full group-disabled:shadow-none h-1.5 w-1.5"></div>
            </span>
          )}
        </div>
      </button>
    </>
  )
}

export default Radio
