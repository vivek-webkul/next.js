import {
  findPort,
  killApp,
  nextBuild,
  nextStart,
  renderViaHTTP,
  File,
} from 'next-test-utils'
import webdriver from 'next-webdriver'
import { join } from 'path'

jest.setTimeout(1000 * 30)

const appDir = join(__dirname, '../')
let appPort
let app
let browser
let html

const indexPage = new File(join(appDir, 'pages/static.js'))

const runTests = () => {
  it('Should allow an image with a static src to omit height and width', async () => {
    expect(await browser.elementById('basic-static')).toBeTruthy()
    expect(await browser.elementById('blur-png')).toBeTruthy()
    expect(await browser.elementById('blur-jpg')).toBeTruthy()
    expect(await browser.elementById('static-svg')).toBeTruthy()
    expect(await browser.elementById('static-gif')).toBeTruthy()
    expect(await browser.elementById('static-bmp')).toBeTruthy()
    expect(await browser.elementById('static-ico')).toBeTruthy()
  })
  it('Should automatically provide an image height and width', async () => {
    expect(html).toContain('width:400px;height:300px')
  })
  it('Should allow provided width and height to override intrinsic', async () => {
    expect(html).toContain('width:200px;height:200px')
    expect(html).not.toContain('width:400px;height:400px')
  })
  it('Should add a blurry placeholder to statically imported jpg', async () => {
    expect(html).toContain(
      `style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%;filter:blur(20px);background-size:cover;background-image:url(&quot;data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoKCgoKCgsMDAsPEA4QDxYUExMUFiIYGhgaGCIzICUgICUgMy03LCksNy1RQDg4QFFeT0pPXnFlZXGPiI+7u/sBCgoKCgoKCwwMCw8QDhAPFhQTExQWIhgaGBoYIjMgJSAgJSAzLTcsKSw3LVFAODhAUV5PSk9ecWVlcY+Ij7u7+//CABEIAAgACAMBIgACEQEDEQH/xAAUAAEAAAAAAAAAAAAAAAAAAAAH/9oACAEBAAAAADX/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/9oACAECEAAAAH//xAAUAQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDEAAAAH//xAAdEAABAgcAAAAAAAAAAAAAAAATEhUAAwUUIzLS/9oACAEBAAE/AB0ZlUac43GqMYuo/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPwB//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPwB//9k=&quot;);background-position:0% 0%"`
    )
  })
  it('Should add a blurry placeholder to statically imported png', async () => {
    expect(html).toContain(
      `style="position:absolute;top:0;left:0;bottom:0;right:0;box-sizing:border-box;padding:0;border:none;margin:auto;display:block;width:0;height:0;min-width:100%;max-width:100%;min-height:100%;max-height:100%;filter:blur(20px);background-size:cover;background-image:url(&quot;data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAQAAABuBnYAAAAATklEQVR42i2I0QmAMBQD869Q9K+IsxU6RkfoiA6T55VXDpJLJC9uUJIzcx+XFd2dXMbx8n+QpoeYDpgY66RaDA83jCUfVpK2pER1dcEUP+KfSBtXK+BpAAAAAElFTkSuQmCC&quot;);background-position:0% 0%"`
    )
  })
}

describe('Build Error Tests', () => {
  it('should throw build error when import statement is used with missing file', async () => {
    await indexPage.replace(
      '../public/foo/test-rect.jpg',
      '../public/foo/test-rect-broken.jpg'
    )

    const { stderr } = await nextBuild(appDir, undefined, { stderr: true })
    await indexPage.restore()

    expect(stderr).toContain(
      "Error: Can't resolve '../public/foo/test-rect-broken.jpg"
    )
  })
})
describe('Static Image Component Tests', () => {
  beforeAll(async () => {
    await nextBuild(appDir)
    appPort = await findPort()
    app = await nextStart(appDir, appPort)
    html = await renderViaHTTP(appPort, '/static')
    browser = await webdriver(appPort, '/static')
  })
  afterAll(() => {
    killApp(app)
  })
  runTests()
})
