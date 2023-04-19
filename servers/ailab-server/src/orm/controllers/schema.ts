import type { Transaction } from 'sequelize/dist'

export interface CommonSQLOptions {
  transaction?: Transaction
}
