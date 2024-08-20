import { useSession } from 'next-auth/react'

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to Product Categorization System</h1>
      {session ? (
        <p>Signed in as {session.user?.email}</p>
      ) : (
        <p>Not signed in</p>
      )}
    </div>
  )
}
