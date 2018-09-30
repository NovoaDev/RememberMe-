const SerialPort = require('serialport')
const tarea = require('node-cron')

const ReadLine = SerialPort.parsers.Readline

const port = new SerialPort("COM3", { baudRate: 9600 })
const parser = port.pipe(new ReadLine({ delimiter: '\r\n' }))

const calendarApi = require('./calendar/calendarApi')
const taskApi = require('./task/taskApi')

tarea.schedule('* * * * *', function () {
  preguntarCal()
  preguntarTas()
})

//--------------------------------------------- Escuchar Arduino
parser.on('open', function () { console.log('connection is opened') })
parser.on('data', function (data) { readArduino(data.toString()) })
//--------------------------------------------------------------

function preguntarCal () {
  let sDatos
  let sDatosFinal
  let sTipo 
  let sPrefijoConta
  let i = 0

  sDatos = calendarApi()

  console.log("cal")
  
  if (sDatos.length) {
    port.write("#2#CALENDARIO\n")
    port.write("#4#"+sDatos.length+"\n")
    
    while (i < sDatos.length) {
      port.write("#3#"+(i+1)+"\n")
      console.log(sDatos[i])
      port.write("#1#"+sDatos[i]+"\n")
      i++
    }
  }
}

function preguntarTas () {
  let sDat
  let sDatFinal
  let sTipo 
  let sPrefijoConta
  let i = 0

  sDat = taskApi()
  
  if (sDat.length) {
    port.write("#2#TASK\n")
    port.write("#5#"+sDat.length+"\n")
    
    while (i < sDat.length) {
      port.write("#3#"+(i+1)+"\n")
      port.write("#1#"+sDat[i]+"\n")
      i++
    }
  }
}