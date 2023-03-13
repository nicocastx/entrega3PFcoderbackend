import winston, {format} from "winston";

const LEVEL = Symbol.for('level')

function filterOnly(level){
  return format(function(info){
    if(info[LEVEL] === level){
      return info
    }
  })()
}

function buildLogger(){
  return winston.createLogger({
    transports:[
      new winston.transports.Console({level: 'info'}),
      new winston.transports.File({filename: './logs/warns.log', format: filterOnly('warn')}),
      new winston.transports.File({filename: './logs/errors.log', format: filterOnly('error')})
    ]
  })
}

let logger = buildLogger()

export default logger