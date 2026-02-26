import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
} from '@react-email/components'

interface ConfirmSubscriptionProps {
  confirmUrl: string
}

export default function ConfirmSubscription({ confirmUrl }: ConfirmSubscriptionProps) {
  return (
    <Html lang="fr">
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={title}>Road to Edi 🚴</Text>
          </Section>
          <Section style={content}>
            <Text style={paragraph}>
              Merci de vouloir suivre l&apos;aventure Paris → Édimbourg !
            </Text>
            <Text style={paragraph}>
              Cliquez sur le bouton ci-dessous pour confirmer votre inscription
              et recevoir une notification à chaque nouveau post.
            </Text>
            <Section style={buttonContainer}>
              <Link href={confirmUrl} style={button}>
                Confirmer mon inscription
              </Link>
            </Section>
            <Text style={small}>
              Si vous n&apos;avez pas demandé cette inscription, ignorez simplement cet email.
            </Text>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Road to Edi — Paris → Édimbourg à vélo
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const body = {
  backgroundColor: '#faf7f2',
  fontFamily: 'Georgia, serif',
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '480px',
}

const header = {
  textAlign: 'center' as const,
  paddingBottom: '16px',
}

const title = {
  fontSize: '24px',
  color: '#44403c',
  fontWeight: '700' as const,
  margin: '0',
}

const content = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '32px 24px',
  border: '1px solid #e7e5e4',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#44403c',
  margin: '0 0 16px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const button = {
  backgroundColor: '#a16207',
  color: '#ffffff',
  padding: '12px 32px',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '600' as const,
  textDecoration: 'none',
  display: 'inline-block',
}

const small = {
  fontSize: '13px',
  color: '#78716c',
  margin: '16px 0 0',
}

const hr = {
  borderColor: '#e7e5e4',
  margin: '24px 0',
}

const footer = {
  fontSize: '12px',
  color: '#a8a29e',
  textAlign: 'center' as const,
}
