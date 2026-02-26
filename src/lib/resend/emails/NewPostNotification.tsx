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

interface NewPostNotificationProps {
  postTitle: string
  postUrl: string
  excerpt: string
  unsubscribeUrl: string
}

export default function NewPostNotification({
  postTitle,
  postUrl,
  excerpt,
  unsubscribeUrl,
}: NewPostNotificationProps) {
  return (
    <Html lang="fr">
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={title}>Road to Edi 🚴</Text>
          </Section>
          <Section style={content}>
            <Text style={subtitle}>Nouveau post !</Text>
            <Text style={postTitleStyle}>{postTitle}</Text>
            <Text style={paragraph}>{excerpt}</Text>
            <Section style={buttonContainer}>
              <Link href={postUrl} style={button}>
                Lire le post
              </Link>
            </Section>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Road to Edi — Paris → Édimbourg à vélo
          </Text>
          <Text style={unsubscribe}>
            <Link href={unsubscribeUrl} style={unsubscribeLink}>
              Se désinscrire
            </Link>
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

const subtitle = {
  fontSize: '14px',
  color: '#a16207',
  fontWeight: '600' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px',
}

const postTitleStyle = {
  fontSize: '20px',
  color: '#44403c',
  fontWeight: '700' as const,
  margin: '0 0 12px',
  lineHeight: '28px',
}

const paragraph = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#57534e',
  margin: '0 0 16px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0 8px',
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

const hr = {
  borderColor: '#e7e5e4',
  margin: '24px 0',
}

const footer = {
  fontSize: '12px',
  color: '#a8a29e',
  textAlign: 'center' as const,
  margin: '0 0 8px',
}

const unsubscribe = {
  textAlign: 'center' as const,
}

const unsubscribeLink = {
  fontSize: '12px',
  color: '#a8a29e',
  textDecoration: 'underline',
}
