import '../styles/mock-pages.css'

export default async function Layout(props: { children: React.ReactNode }) {
  const { children } = props

  return <main>{children}</main>
}
