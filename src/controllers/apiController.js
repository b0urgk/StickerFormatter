const QRCode = require('qrcode');
const {createCanvas, loadImage, cairoVersion} = require("canvas");
const fs = require('fs');
const puppeteer = require('puppeteer')

module.exports = {

    genBanner:async function (req, res){

        // Banner data
        const qrURL = req.body.url;
        const templateData = await getTemplate(req.body.shape);

        let roomNumber = 1;

        // Banner dimensions
        const height = templateData.height;
        const width = templateData.width;

        // Creating canvas
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, width, height);

        // Checking if text(Room number) is wanted (Negative case -> return just qrcode)
        if(templateData.text.status){
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(qrURL, { waitUntil: 'domcontentloaded' });


            // Check if Asset is owned by FJPP
            const company = await page.evaluate(() => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        const element = document.querySelector('.company-name');
                        resolve(element ? element.textContent : 'Not found');
                    }, 500); // 5 seconds delay for demo purposes
                });
            })

            if(company !== "Fondation Jean-Pierre Pescatore"){
                res.status(400).send("wrong Company!!")
                return
            }


            // Scraping Room number of form
            const title = await page.evaluate(() => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        const element = document.querySelector('.cEKuY');
                        resolve(element ? element.textContent : 'Not found');
                    }, 500); // 5 seconds delay for demo purposes
                });
            })
            roomNumber = title.match(/\d+/g);

            // finishing text creation
            await browser.close();
            console.log(title);
            ctx.fillStyle = '#000000'; // Text color
            ctx.font = 'bold 30px Arial'; // Font size and type
            ctx.fillText(`Room ${roomNumber}`, templateData.text.x, templateData.text.y);

            // underlining text
            let text = ctx.measureText(`Room ${roomNumber}`)
            ctx.strokeStyle = '#004b8c';
            ctx.beginPath();
            ctx.moveTo(templateData.text.x + 10, templateData.text.y + 5)
            ctx.lineTo(40 + text.width, templateData.text.y + 5)
            ctx.stroke()
        }



        try {
            // generating qr code & appending it to canvas
            const qr = await QRCode.toDataURL(qrURL, { errorCorrectionLevel: 'H', width: 150, margin: 2 });
            const qrImage = await loadImage(qr);
            ctx.drawImage(qrImage, templateData.qrcode.x, templateData.qrcode.y, templateData.qrcode.width, templateData.qrcode.height); // Draw QR code

            // appending extra elements to canvas
            templateData.elements.forEach(async (element) => {
                const circle = await loadImage(element.path)
                ctx.drawImage(circle,  element.x ,element.y, element.width, element.height)
            })

            // finishing off image creating
            res.setHeader('Content-Type', 'image/png'); // Serve image
            canvas.createPNGStream().pipe(res);

        }catch (error){
            // responding to error messages
            console.error('Error generating banner:', error);
            res.status(500).json({ error : "Error generating banner: \n" + error});
        }

    }

}
async function getTemplate(name){
    const data = await fs.readFileSync('./templates/' + name + '.json');
    return JSON.parse(data);
}