const prettyBytes = require("pretty-bytes");
const fs = require("fs");
const uuid = require('uuid')
const puppeteer = require('../puppeteer')

module.exports = async (file, cookie) => {
    const browser = await puppeteer()
    try {
        var cookies = JSON.parse(cookie.data)
        const url = 'https://ok.ru/video/manager';
        const page = await browser.newPage();
        await page.goto(url, {
            waitUntil: 'load'
        });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36');
        await page.setCookie(...cookies);
        await page.goto(url, {
            waitUntil: 'load'
        });
        if (page.url() == "https://ok.ru/video/manager") {
            console.log(`Login Success`);
            await page.waitForTimeout(3000);
            size = await fs.promises.stat(file)
            console.log("File Size " + prettyBytes(size.size))
            const uploadButton = await page.$x(`//*[@id="hook_Block_VideoUploadManagerBlock"]/div[1]/div[1]/div[2]/span/input`);
            console.log("Start Input " + file)
            await page.waitForTimeout(1000);
            await uploadButton[0].uploadFile(file);
            console.log(`Uploading File ${file}`);
            await page.waitForSelector("#hook_Block_VideoUploadManagerBlock > div.v-upl_sctn.progressbar-container > div > form > div.video-uploader_aside > div > div.video-uploader_preview > div.video-uploader_uploaded-status > div.video-uploader_status-tx.__ulc-load > span");
            var check = await page.evaluate(() => {
                var percent = document.querySelector("#hook_Block_VideoUploadManagerBlock > div.v-upl_sctn.progressbar-container > div > form > div.video-uploader_aside > div > div.video-uploader_preview > div.video-uploader_uploaded-status > div.video-uploader_status-tx.__ulc-load > span").textContent;
                return percent;
            }).catch(() => {
                return "false";
            });
            var countcheck = 0;
            while (check != "100" && check != "false") {
                check = await page.evaluate(() => {
                    var percent = document.querySelector("#hook_Block_VideoUploadManagerBlock > div.v-upl_sctn.progressbar-container > div > form > div.video-uploader_aside > div > div.video-uploader_preview > div.video-uploader_uploaded-status > div.video-uploader_status-tx.__ulc-load > span").textContent;
                    return percent;
                }).catch(() => {
                    return "false";
                });
                if (check == "false") {
                    throw new Error('progress check failed')
                } else {
                    console.log(`${file} - Uploading ${check}%`);
                }
                countcheck++;
                await page.waitForTimeout(2000);
            }
            try {
                await page.click("#hook_Block_VideoUploadManagerBlock > div.v-upl_sctn.progressbar-container > div > form > div.form-actions.__center > input"); //save video
            } catch (ex) { }
            console.log(`${file} - Upload Done!`);
            await page.waitForSelector("form > div.video-uploader_aside > div > div.video-uploader_preview_cnt > a");
            var id = await page.evaluate(() => {
                return document.querySelector("#hook_Block_VideoUploadManagerBlock > div.v-upl_sctn.progressbar-container > div > form > div.video-uploader_aside > div > div.video-uploader_preview_cnt > a").getAttribute("href").replace("/video/editor/", "");
            }).catch(err => {
                console.error(err);
                return false;
            });
            if (id) {
                await browser.close()
                return id
            } else {
                throw new Error('cannot locate video_id')
            }
        }
        else {
            await cookie.updateOne({disabled:true}).exec()
            throw new Error('cookie dead')
        }
    } catch (error) {
        await browser.close()
        throw error
    }

}
