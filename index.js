const cheerio = require("cheerio");
const axios = require("axios");
const fs = require('fs');
const path = require("path")
const url = "https://aiimsmp5.onlineregistrationform.org/AIIMSMP5/masters_QP.jsp"
try {
    getHtml = async() => {
        const { data: html } = await axios.get(url)
        return html
    }

} catch (error) {
    console.log("Something Went Wrong ", error)
}

getHtml().then((res) => {
    const $ = cheerio.load(res);
    const li = $('.indexUl>li');
    try {
        li.each(async(i, e) => {
            title = e.children[0].children[0].data;
            link = e.children[0].attribs.href;
            title = capitalizer(title);
            fs.appendFileSync("deepak.html", `<li><h2>AIIMS ${title} Recruitment Previous Years Question Bank With Answers</h2></li>`)
            await downloadPDF(`https://aiimsmp5.onlineregistrationform.org${link.slice(2)}`, i + 1)
        });
        console.log("file created")
    } catch (error) {
        console.log(error)
    }

})

try {
    async function downloadPDF(url, index) {
        const response = await axios({
            url,
            method: "GET",
            responseType: "stream",
            onDownloadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log(`Downloading file ${index}: ${percentCompleted}%`);
            },

        });
        index = index.toString()
        let filePath = path.join("./allpdfs", `${index} ${path.basename(url)}`);
        const writer = fs.createWriteStream(filePath);
        console.log(filePath)

        return new Promise((resolve, reject) => {
            response.data.pipe(writer);
            writer.on("finish", resolve);
            writer.on("error", reject);
        });
    }
} catch (error) {
    console.log("Download Fail ", error)
}



capitalizer = (str) => {
    newstr = str.split(" ");
    str = newstr.map((e) => {
        firstltr = e.charAt(0);
        baki = e.slice(1).toLowerCase();
        return firstltr + baki
    })
    return str.join(" ")
}