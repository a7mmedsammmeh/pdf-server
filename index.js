import express from 'express'
import puppeteer from 'puppeteer'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json({ limit: '5mb' }))

app.post('/generate-pdf', async (req, res) => {
  try {
    const { html } = req.body

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()

    await page.setContent(html, {
      waitUntil: 'networkidle0'
    })

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true
    })

    await browser.close()

    res.set({
      'Content-Type': 'application/pdf'
    })

    res.send(pdf)

  } catch (err) {
    res.status(500).send('PDF error')
  }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log('running...')
})
