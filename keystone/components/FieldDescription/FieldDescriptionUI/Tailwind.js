export const Tailwind = (props) => {
  if (props.children === null) {
    return null;
  }

  return <div {...props} />;
};
