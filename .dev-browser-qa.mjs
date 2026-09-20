const targets = await (await fetch('http://127.0.0.1:9224/json/list')).json();
const target = targets.find((item) => item.url === 'about:blank')
  ?? targets.find((item) => item.url.startsWith('http://localhost:1368/'));
if (!target?.webSocketDebuggerUrl) throw new Error('No debuggable Chrome page found.');

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let nextId = 0;
const pending = new Map();
const events = [];
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  if (message.id && pending.has(message.id)) {
    const request = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) request.reject(message.error);
    else request.resolve(message.result);
  } else if (message.method) events.push(message);
});

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++nextId;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const evaluate = async (expression) => {
  const response = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
  return response.result.value;
};

await send('Runtime.enable');
await send('Page.enable');
await send('Network.enable');
await send('Log.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 1440,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false
});

await send('Page.navigate', { url: 'http://localhost:1368/' });
await wait(1000);
await evaluate(`sessionStorage.setItem('ai-memory-gate-unlocked-v1', '1')`);
events.length = 0;
await send('Page.navigate', { url: 'http://localhost:1368/us' });
await wait(3500);

const result = await evaluate(`(async () => {
  await document.fonts.ready;
  const clean = (value) => (value ?? '').replace(/\\s+/g, ' ').trim();
  const peak = document.querySelector('.ai-one-line-desktop');
  const heading = document.querySelector('.ai-scene-title');
  const privateRoot = document.querySelector('.ai-private');
  const peakStyle = peak ? getComputedStyle(peak) : null;
  const headingStyle = heading ? getComputedStyle(heading) : null;
  const bodyStyle = privateRoot ? getComputedStyle(privateRoot) : null;
  return {
    url: location.href,
    title: document.title,
    bodyTextLength: document.body.innerText.length,
    viteOverlay: Boolean(document.querySelector('vite-error-overlay, #vite-error-overlay')),
    rootRendered: Boolean(privateRoot),
    root: privateRoot ? { tag: privateRoot.tagName, className: privateRoot.className } : null,
    heading: heading ? { text: clean(heading.textContent), className: heading.className, insidePrivate: Boolean(heading.closest('.ai-private')) } : null,
    peak: peak ? {
      text: clean(peak.textContent),
      whiteSpace: peakStyle.whiteSpace,
      height: peak.getBoundingClientRect().height,
      lineHeight: Number.parseFloat(peakStyle.lineHeight),
      scrollWidth: peak.scrollWidth,
      clientWidth: peak.clientWidth
    } : null,
    typography: {
      headingFamily: headingStyle?.fontFamily ?? null,
      headingWeight: headingStyle?.fontWeight ?? null,
      bodyFamily: bodyStyle?.fontFamily ?? null,
      fontsStatus: document.fonts.status,
      notoLoaded: document.fonts.check('16px "Noto Serif Thai"'),
      anuphanLoaded: document.fonts.check('16px Anuphan')
    },
    fontResources: performance.getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((name) => name.includes('fonts.googleapis') || name.includes('fonts.gstatic'))
  };
})()`);

const errors = events
  .filter((event) => (
    (event.method === 'Runtime.consoleAPICalled' && event.params.type === 'error')
    || event.method === 'Runtime.exceptionThrown'
    || (event.method === 'Log.entryAdded' && event.params.entry.level === 'error')
    || (event.method === 'Network.loadingFailed' && !event.params.canceled)
  ))
  .map((event) => ({ method: event.method, params: event.params }));

console.log(JSON.stringify({ result, errors }, null, 2));
socket.close();
