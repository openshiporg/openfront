export const Container = ({ children, ...props }) => (
  <div className="min-w-0 max-w-[1080px]" {...props}>
    {children}
  </div>
);
