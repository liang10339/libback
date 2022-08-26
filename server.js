const express = require("express")
const app = express()
const port = process.env.PORT || 4000
const cors = require("cors")
require("events").EventEmitter.prototype._maxListeners = 100

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
// app.use(cors())
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested, Content-Type, Accept Authorization"
  )
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "POST, PUT, PATCH, GET, DELETE")
    return res.status(200).json({})
  }
  next()
})

app.get("/xinbeilib", async (req, res) => {
  const bookname = Object.keys(req.query)
  const request = require("request")
  const cheerio = require("cheerio")
  const book = encodeURI(bookname)
  const isISBN = /\d{13}/.test(book)
  const xinbei = isISBN
    ? `https://webpac.tphcc.gov.tw/webpac/search.cfm?m=as&k0=${book}&t0=i&c0=and&y10=&y20=&cat0=&dt0=&l0=&lv0=&lc0=`
    : `https://webpac.tphcc.gov.tw/webpac/search.cfm?m=ss&k0=${book}&t0=k&c0=and`
  request(
    {
      url: xinbei,
      method: "GET",
    },
    (error, response, body) => {
      if (error || !body) {
        console.log("connect to xinbei lib error")
        return
      }
      let title = []
      const $ = cheerio.load(body)
      const list = $(".book")
      for (let i = 0; i < list.length; i++) {
        title.push(
          list.eq(i).find("a h3").contents().last().text().replace(/\//g, "")
        )
      }
      title.unshift(xinbei)
      title.unshift("新北市立圖書館")
      res.json(title.slice(0, 8))
    }
  )
})
app.get("/taipeilib", async (req, res) => {
  let bookname = Object.keys(req.query)
  const puppeteer = require("puppeteer")
  const book = encodeURI(bookname)
  const taipei = `https://book.tpml.edu.tw/webpac/bookSearchList.do?search_input=${book}&search_field=FullText#search_input=${book}&search_field=FullText`

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setDefaultNavigationTimeout(0)
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
  })
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
  )
  await page.goto(taipei)
  const _url = await page.$eval("iframe", (el) => el.src)
  if (_url.includes("booksearch.do")) {
    await page.goto(_url)
    const title = await page.$$eval("h4", (els) => {
      return els.map((el) => el.textContent.trim())
    })
    title.unshift(taipei)
    title.unshift("臺北市立圖書館")
    res.json(title.slice(0, 8))
  } else {
    const title = await page.$eval("h3", (el) =>
      el.textContent.split("/").slice(0, -1)
    )
    title.unshift(taipei)
    title.unshift("臺北市立圖書館")
    res.json(title)
  }
})
app.get("/hyxinbei", async (req, res) => {
  const bookname = Object.keys(req.query)
  const book = encodeURI(bookname)
  const puppeteer = require("puppeteer")
  const hyXinbei = `https://tphcc.ebook.hyread.com.tw/searchList.jsp?search_field=FullText&search_input=${book}`
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setDefaultNavigationTimeout(0)
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
  })
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
  )
  await page.goto(hyXinbei)

  const title = await page.$$eval("div.caption", (els) => {
    return els.map((el) => el.textContent.trim())
  })
  title.unshift(hyXinbei)
  title.unshift("新北HyRead")
  res.json(title.slice(0, 8))
  await browser.close()
})
app.get("/hytaipei", async (req, res) => {
  const bookname = Object.keys(req.query)
  const book = encodeURI(bookname)
  const puppeteer = require("puppeteer")
  const hyTaipei = `https://tpml.ebook.hyread.com.tw/searchList.jsp?search_field=FullText&search_input=${book}`
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setDefaultNavigationTimeout(0)
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
  })
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
  )
  await page.goto(hyTaipei)

  const title = await page.$$eval("div.caption", (els) => {
    return els.map((el) => el.textContent.trim())
  })
  title.unshift(hyTaipei)
  title.unshift("臺北HyRead")
  res.json(title.slice(0, 8))
  await browser.close()
})
app.get("/udnxinbei", async (req, res) => {
  const bookname = Object.keys(req.query)
  const book = encodeURI(bookname)
  const puppeteer = require("puppeteer")
  const isISBN = /\d{13}/.test(book)
  const udnXinbei = isISBN
    ? `https://reading.udn.com/udnlib/tpc/booksearch?sort=all&opt=isbn&kw=${book}`
    : `https://reading.udn.com/udnlib/tpc/booksearch?sort=all&opt=all&kw=${book}`
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setDefaultNavigationTimeout(0)
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
  })
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
  )
  await page.goto(udnXinbei)

  const title = await page.$$eval("div.wrapper-bookname", (els) => {
    return els.map((el) => el.textContent.trim())
  })
  title.unshift(udnXinbei)
  title.unshift("新北UDN")
  res.json(title.slice(0, 8))
  await browser.close()
})
app.get("/udntaipei", async (req, res) => {
  const bookname = Object.keys(req.query)
  const book = encodeURI(bookname)
  const puppeteer = require("puppeteer")
  const isISBN = /\d{13}/.test(book)
  const udnTaipei = isISBN
    ? `https://reading.udn.com/udnlib/tpml/booksearch?sort=all&opt=isbn&kw=${book}`
    : `https://reading.udn.com/udnlib/tpml/booksearch?sort=all&opt=all&kw=${book}`
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setDefaultNavigationTimeout(0)
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
  })
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36"
  )
  await page.goto(udnTaipei)

  const title = await page.$$eval("div.wrapper-bookname", (els) => {
    return els.map((el) => el.textContent.trim())
  })
  title.unshift(udnTaipei)
  title.unshift("臺北UDN")
  res.json(title.slice(0, 8))
  await browser.close()
})

app.listen(port, () => {
  console.log(`Server started on ${port}`)
})
