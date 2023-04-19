import stringifyInOrder from 'fst-stable-stringify'

export class IOSerdeKit {
  get spit() {
    return '|'
  }

  ioSerde(payload: any) {
    return stringifyInOrder(payload)
  }

  ioParse(payload: string) {
    return JSON.parse(payload)
  }
}

export class IOServerSerdeKit {
  dataSerde(data: any) {
    return JSON.stringify(data)
  }

  dataParse(payload: string) {
    return JSON.parse(payload)
  }
}
