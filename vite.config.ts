import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { Resend } from 'resend'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
      {
        name: 'api-send',
        configureServer(server) {
          server.middlewares.use('/api/send', (req, res) => {
            if (req.method === 'POST') {
              let body = ''
              req.on('data', chunk => { body += chunk.toString() })
              req.on('end', async () => {
                try {
                  const { to, subject, html, attachment, filename } = JSON.parse(body)
                  
                  if (!env.RESEND_API_KEY) {
                    res.statusCode = 500
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify({ message: 'RESEND_API_KEY is not defined in .env' }))
                    return
                  }
                  
                  const resend = new Resend(env.RESEND_API_KEY)
                  const fromEmail = env.RESEND_FROM_EMAIL || 'noreply@mail.lakshyaldce.in'
                  
                  const { data, error } = await resend.emails.send({
                    from: fromEmail,
                    to,
                    subject,
                    html,
                    attachments: [
                      {
                        filename: filename || 'Certificate.pdf',
                        content: attachment,
                      },
                    ],
                  })
                  
                  res.setHeader('Content-Type', 'application/json')
                  if (error) {
                    res.statusCode = 400
                    res.end(JSON.stringify(error))
                    return
                  }
                  
                  res.statusCode = 200
                  res.end(JSON.stringify(data))
                } catch (e: any) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ message: e instanceof Error ? e.message : String(e) }))
                }
              })
            } else {
              res.statusCode = 405
              res.end('Method Not Allowed')
            }
          })
        }
      }
    ],
  }
})
