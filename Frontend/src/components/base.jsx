import NavegadorPrincipal from './pages/Inicio'

function Layout({ children }) {
  return (
    <>
      <NavegadorPrincipal />
      <main className="mt-4">{children}</main>
    </>
  )
}

export default Layout
