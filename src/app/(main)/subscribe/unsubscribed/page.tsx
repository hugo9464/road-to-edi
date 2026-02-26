import Link from 'next/link'

const messages = {
  success: {
    title: 'Désinscription effectuée',
    description: 'Tu ne recevras plus de notifications par email.',
    emoji: '👋',
  },
  not_found: {
    title: 'Abonnement introuvable',
    description: 'Cet abonnement n\'existe pas ou a déjà été supprimé.',
    emoji: '🤔',
  },
  invalid: {
    title: 'Lien invalide',
    description: 'Ce lien de désinscription est invalide.',
    emoji: '😕',
  },
}

type Status = keyof typeof messages

export default async function UnsubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: rawStatus } = await searchParams
  const status: Status = (rawStatus as Status) in messages ? (rawStatus as Status) : 'invalid'
  const msg = messages[status]

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <p className="text-4xl mb-4">{msg.emoji}</p>
        <h1 className="font-[family-name:var(--font-lora)] text-2xl font-bold text-stone-800 mb-2">
          {msg.title}
        </h1>
        <p className="text-stone-500 mb-6">{msg.description}</p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 text-sm font-medium text-white bg-amber-700 rounded-lg hover:bg-amber-800 transition-colors"
        >
          Retour à la carte
        </Link>
      </div>
    </div>
  )
}
