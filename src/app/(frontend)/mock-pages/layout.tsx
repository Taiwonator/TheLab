// import './styles.css'

export default async function Layout(props: { children: React.ReactNode }) {
  const { children } = props

  return <main>{children}</main>
}
