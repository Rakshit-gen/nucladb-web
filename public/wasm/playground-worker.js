// Runs the real NuclaDB HNSW engine (compiled to WebAssembly from the
// actual Go source, unmodified) off the main thread so a large insert
// batch never freezes the page. Talks to the UI thread over postMessage.
self.importScripts("/wasm/wasm_exec.js");

let ready = false;
const pending = [];

async function boot() {
  const go = new self.Go();
  const resp = await fetch("/wasm/nucladb.wasm");
  const { instance } = await WebAssembly.instantiateStreaming(resp, go.importObject);
  go.run(instance); // never resolves; the Go program blocks in select{}
}

boot()
  .then(() => {
    ready = true;
    self.postMessage({ type: "ready" });
    for (const msg of pending.splice(0)) handle(msg);
  })
  .catch((err) => {
    self.postMessage({ type: "error", reqId: null, message: String(err) });
  });

function handle({ reqId, cmd, args }) {
  try {
    let raw;
    if (cmd === "reset") {
      raw = self.nuclaReset(JSON.stringify(args));
    } else if (cmd === "insertRandom") {
      raw = self.nuclaInsertRandom(args.count);
    } else if (cmd === "searchRandom") {
      raw = self.nuclaSearchRandom(args.topK, args.ef);
    } else {
      self.postMessage({ type: "error", reqId, message: `unknown cmd: ${cmd}` });
      return;
    }
    const parsed = JSON.parse(raw);
    if (parsed.error) {
      self.postMessage({ type: "error", reqId, message: parsed.error });
    } else {
      self.postMessage({ type: "result", reqId, payload: parsed });
    }
  } catch (err) {
    self.postMessage({ type: "error", reqId, message: String(err) });
  }
}

self.onmessage = (ev) => {
  if (!ready) {
    pending.push(ev.data);
    return;
  }
  handle(ev.data);
};
