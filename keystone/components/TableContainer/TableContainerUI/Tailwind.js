export const Tailwind = ({ children }) => {
  return (
    <table
      css={{
        minWidth: "100%",
        tableLayout: "fixed",
        "tr:last-child td": { borderBottomWidth: 0 },
      }}
      cellPadding="0"
      cellSpacing="0"
    >
      {children}
    </table>
  );
};
