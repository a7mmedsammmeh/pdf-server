import express from 'express'
import puppeteer from 'puppeteer'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.post('/generate-pdf', async (req, res) => {
  try {
    const { html } = req.body

    if (!html) {
      return res.status(400).send('No HTML provided')
    }

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new'
    })

    const page = await browser.newPage()

    await page.setContent(html, {
      waitUntil: 'networkidle0'
    })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true
    })

    await browser.close()

    // 🔥 المهم هنا
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf')
    res.setHeader('Content-Length', pdfBuffer.length)

    res.end(pdfBuffer)

  } catch (err) {
    console.error(err)
    res.status(500).send('PDF error')
  }
})

app.get('/', (req, res) => {
  res.send('PDF Server is working ✅')
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log('running...')
})
