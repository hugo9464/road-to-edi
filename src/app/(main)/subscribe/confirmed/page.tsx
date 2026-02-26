import Link from 'next/link'

const messages = {
  success: {
    title: 'Inscription confirmée !',
    description: 'Tu recevras un email à chaque nouveau post. Bonne route !',
    emoji: '🎉',
  },
  already: {
    title: 'Déjà confirmé',
    description: 'Ton inscription est déjà active, pas besoin de reconfirmer.',
    emoji: '👍',
  },
  invalid: {
    title: 'Lien invalide',
    description: 'Ce lien de confirmation est invalide ou a expiré.',
    emoji: '😕',
  },
  error: {
    title: 'Erreur',
    description: 'Une erreur est survenue. Réessaie plus tard.',
    emoji: '⚠️',
  },
}

type Status = keyof typeof messages

export default async function ConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: rawStatus } = await searchParams
  const status: Status = (rawStatus as Status) in messages ? (rawStatus as Status) : 'error'
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
