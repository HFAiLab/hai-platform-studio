import { DataTypes as SequelizeDataTypes } from 'sequelize'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withDateNoTz = require('sequelize-date-no-tz-postgres')

type HFDataTypesType = { DATE_NO_TZ: any } & typeof SequelizeDataTypes
export const HFDataTypes = withDateNoTz(SequelizeDataTypes) as HFDataTypesType
