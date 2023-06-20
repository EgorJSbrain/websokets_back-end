import express from 'express'
import ws from 'express-ws'

const app = express()

const WSserver = ws(app)
const aWss = WSserver.getWss()

const PORT = process.env.PORT || 8800

app.ws('/', (ws, req) => {
  console.log('SUCCESS CONNETION')
  ws.send('success conect')

  ws.on('message', msg => {
    msg = JSON.parse(msg)
    switch(msg.method) {
      case 'connection':
        connectionHandler(ws, msg)
        break;
    }
  })
})

app.listen(PORT, () => console.log(`SERVER WORK POTS - ${PORT}`))

const connectionHandler = (ws, msg) => {
  ws.id = msg.id
  broadcastConnection(ws, msg)
}

const broadcastConnection = (ws, msg) => {
  aWss.clients.forEach(client => {
    if (client.id === msg.id) {
      client.send(`User with user name ${msg.userName} was connected`)
    }
  })
}