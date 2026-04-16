import express from 'express'
import puppeteer from 'puppeteer'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.post('/generate-pdf', async (req, res) => {
  let browser;
  try {
    const { html } = req.body
    if (!html) return res.status(400).send('No HTML provided')

    console.log('Generating PDF...')
    
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new'
    })

    const page = await browser.newPage()
    
    // إعداد المحتوى مع التأكد من تحميل الخطوط والصور
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    })

    await browser.close()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Length', pdfBuffer.length)
    res.send(pdfBuffer)

    console.log('PDF Sent Successfully')

  } catch (err) {
    if (browser) await browser.close()
    console.error('Puppeteer Error:', err)
    res.status(500).send('Internal PDF Error')
  }
})

app.get('/', (req, res) => res.send('PDF Server is Awake ✅'))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
