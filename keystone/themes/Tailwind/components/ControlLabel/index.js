export const ControlLabel = ({
  children,
  className,
  control,
  size: sizeKey = "medium",
}) => {
  return (
    <label className="items-start inline-flex">
      {control}
      {children && (
        <div className="text-sm leading-tight ml-2 select-none">{children}</div>
      )}
    </label>
  );
};
