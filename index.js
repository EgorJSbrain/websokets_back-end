import express from 'express'
import ws from 'express-ws'
import cors from 'cors'
import * as fs from 'fs'
import * as path from 'path'

const app = express()

const WSserver = ws(app)
const aWss = WSserver.getWss()

const PORT = process.env.PORT || 8800

app.use(cors())
app.use(express.json())

app.ws('/', (ws, req) => {
  console.log('SUCCESS CONNETION')
  ws.send('success conect')

  ws.on('message', msg => {
    msg = JSON.parse(msg)
    switch(msg.method) {
      case 'connection':
        connectionHandler(ws, msg)
        break;
      case 'draw':
        broadcastConnection(ws, msg)
    }
  })
})

app.post('/image', (req, res) => {
  try {
    const data = req.body.img.replace('...', '')
    fs.writeFileSync(path.resolve('__dirname', 'files', `${req.query.id}.jpg`, data, 'base64'))

    return res.status(200).json({ message: 'Saved' })
  } catch (e) {
    console.log(e)
    return res.status(500).json('Server error')
  }
})
app.get('/image', (req, res) => {
  try {
    const file = fs.readFileSync(path.resolve('__dirname', 'files', `${req.query.id}.jpg`))
    const data = '...' + file.toString('base64')

    res.json(data)
  } catch (e) {
    console.log(e)
    return res.status(500).json('Server error')
  }
})

app.listen(PORT, () => console.log(`SERVER WORK POTS - ${PORT}`))

const connectionHandler = (ws, msg) => {
  ws.id = msg.id
  broadcastConnection(ws, msg)
}

const broadcastConnection = (ws, msg) => {
  aWss.clients.forEach(client => {
    if (client.id === msg.id) {
      client.send(JSON.stringify(msg))
    }
  })
}