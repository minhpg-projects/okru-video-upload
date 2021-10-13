const authDrive = require('./userAuth');
const uuid = require('uuid');
const fs = require('fs');
const path = require('path');
const Bottleneck = require('bottleneck');
const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = () => {
    return new Promise((resolve, reject) => {
        authDrive((err, drive) => {
            const driveMetadata = {
                'name': 'XEMZUI-IMAGE-UPLOAD'
            };
            const requestId = uuid.v4();
            drive.drives.create({
                resource: driveMetadata,
                requestId: requestId,
                fields: 'id'
            }, (err, shared) => {
                if (err) {
                    reject(err);
                } else {
                    drive.files.create({
                        resource: {
                            name: 'files',
                            mimeType: 'application/vnd.google-apps.folder',
                            driveId: shared.data.id,
                            parents: [shared.data.id]
                        },
                        fields: 'id',
                        supportsAllDrives: true,
                    }, (err, folder) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            return fetchServiceAccountPermissions().then(async (permissions) => {
                                const limiter = new Bottleneck({
                                    maxConcurrent: 1,
                                    minTime: 1000
                                });
                                for (const permission of permissions) {
                                    await limiter.schedule(() => {
                                        drive.permissions.create({
                                            resource: permission,
                                            fileId: folder.data.id,
                                            fields: 'id',
                                            supportsAllDrives: true,
                                        }, (err, success) => {
                                            if (err) {
                                                reject(err)
                                            }
                                            else {
                                                console.log(`added ${permission.emailAddress} to shared drive ${shared.data.id}`)
                                            }
                                        })
                                    })
                                }
                                drive.permissions.create({
                                    resource: {
                                        'type': 'anyone',
                                        'role': 'reader',
                                    },
                                    fileId: folder.data.id,
                                    fields: 'id',
                                    supportsAllDrives: true,
                                }, (err, success) => {
                                    if (err) {
                                        reject(err)
                                    }
                                    else {
                                        resolve({
                                            sharedDriveId: shared.data.id,
                                            folderId: folder.data.id,
                                        })
                                    }
                                })
                            })
                        }
                    }
                    )
                }
            });
        })

    })
}

const fetchServiceAccountPermissions = () => {
    const dir = 'service_accounts'
    return new Promise((resolve, reject) => {
        return fs.readdir(dir, (err, files) => {
            if (err) {
                reject(err)
            }
            const promises = files.map((filename) => {
                return new Promise((resolve, reject) => {
                    fs.readFile(path.join(dir, filename), (err, data) => {
                        if (err) {
                            reject(err)
                        }
                        const creds = JSON.parse(data)
                        const worker_creds = JSON.parse(Buffer.from(creds.privateKeyData, 'base64').toString('utf8'))
                        resolve({
                            'type': 'user',
                            'role': 'writer',
                            'emailAddress': worker_creds.client_email
                        })
                    })
                })
            })
            return resolve(Promise.all(promises))
        })

    })
}


