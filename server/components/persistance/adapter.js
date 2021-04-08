import FileSync from 'lowdb/adapters/FileSync.js'
import low from 'lowdb'
import path from 'path'

class DBConnector {
  constructor (dbPath) {
    this.db = this.init(dbPath)
  }

  init (dbPath) {
    const adapter = new FileSync(path.join(dbPath, 'db.json'))
    const db = low(adapter)
    db.defaults({ apis: [] })
      .write()
    db._.mixin({
      pushUnique: function (collection, uniqueKey, newElement) {
        const index = collection.findIndex((databaseElement) => databaseElement[uniqueKey] === newElement[uniqueKey])
        index !== -1 && collection.splice(index, 1)
        collection.push(newElement)
        return collection
      }
    })
    return db
  }

  insertApiDetail (apiDetail) {
    this.db.get('apis')
      .pushUnique('name', apiDetail)
      .write()
  }
}

export default DBConnector
