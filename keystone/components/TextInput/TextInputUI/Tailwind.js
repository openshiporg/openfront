export const Tailwind = (props) => {
  if (props.children === null) {
    return null;
  }

  return <input width="100%" size="$5" {...props} />;
};
