// Admin layout — breaks out of the 480px root constraint.
// Renders full-width so tables don't get cramped.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      // Counteract the root layout's maxWidth:480 / margin:auto
      // by using a negative margin trick on a full-width inner wrapper.
      width: '100vw',
      position: 'relative',
      left: '50%',
      right: '50%',
      marginLeft: '-50vw',
      marginRight: '-50vw',
    }}>
      {children}
    </div>
  );
}
