export function Tailwind({ loading, endSession, children }) {
  return (
    <button
      theme="red"
      marginTop="$4"
      isLoading={loading}
      onClick={() => endSession()}
    >
      {children || "Sign out"}
    </button>
  );
}
