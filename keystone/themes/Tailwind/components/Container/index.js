export const Container = ({ children, ...props }) => (
  <div
    css={{
      minWidth: 0, // fix flex text truncation
      maxWidth: 1080,
      // marginLeft: 'auto',
      // marginRight: 'auto',
    }}
    {...props}
  >
    {children}
  </div>
);
