export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 text-slate-300 border-t border-slate-700">
      <p style={{ textAlign: 'center' }}>
  &copy; {new Date().getFullYear()} SmartPark. All rights reserved.
</p>
    </footer>
  )
}
