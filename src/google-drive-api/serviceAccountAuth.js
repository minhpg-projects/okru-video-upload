const randomFile = require('select-random-file')
const fs = require('fs')
const path = require('path')
const { google } = require('googleapis');


const getServiceAccountCredentials = (callback) => {
    const dir = 'service_accounts'
    return randomFile(dir, (_, file) => {
        const credential_path = path.join(dir,file)
        if (fs.existsSync(credential_path)) {
            fs.readFile(credential_path, (err,data) => {
              const creds = JSON.parse(data)
              const worker_creds =  JSON.parse(Buffer.from(creds.privateKeyData, 'base64').toString('utf8'))
              return callback(null, worker_creds)
            })
          }
        }
    )
}

  
module.exports = () => {
  return new Promise((resolve, reject) => {
    try {
      getServiceAccountCredentials(async (err, credentials) => {
        if(err) throw err;
        const client = await google.auth.getClient({
          credentials,
          scopes: 'https://www.googleapis.com/auth/drive',
        })
        return resolve(google.drive({
          version: 'v3',
          auth: client,
        }))
      })
    }
    catch(err){
      reject(err)
    }
  })

  }
  