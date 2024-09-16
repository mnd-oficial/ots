const CACHE = "static";
const statics = []; // ["/ots/icon.svg","/ots/mpx_imgs.json","/ots/","/ots/index.html","/ots/manifest.json"];
const urlsToCache = []; // ["/icon.svg","/mpx_imgs.json","/","/index.html","/manifest.json"];

/********************************/
self.addEventListener("install", (e) => {
    e.waitUntil(
        caches.keys()
        .then(cacheNames => {
            if(!cacheNames.includes(CACHE))
            return caches.open(CACHE).then(cache => cache.addAll(urlsToCache));
        })
    );
});

self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches.keys(CACHE)
        .then(cacheNames => Promise.all(
            cacheNames.map(cache => {
                if(cache !== CACHE)
                return caches.delete(cache);
            })
        ))
    );
});

self.addEventListener("fetch", (e) => {
    e.respondWith((async () => {
        let { pathname } = new URL(e.request.url);
        log(fetch, pathname);
        // if(statics.includes(pathname))
            return await responseFirstWeb(e.request);
        
        return await caches.open(CACHE).then(cache => cache.match(e.request));
    })());
});

/********************************/
async function responseFirstCache(request) {
    const cache = await caches.open(CACHE);
    let response = await cache.match(request);
    if(!response) {
        response = await fetch(request).catch(e => null);
        if(response) cache.put(request, response.clone());
    }
    return response;
}

async function responseFirstWeb(request) {
    const cache = await caches.open(CACHE);
    let response = await fetch(request).catch(e => null);
    
    if(response) cache.put(request, response.clone());
    else response = await cache.match(request);
    
    return response;
}

/********************************/
async function log(...msgs) {
    const cache = await caches.open(CACHE);
    const response = await cache.match("logs.json");
    
    let json = [];
    if(response) json = await response.json();
    json.push(...msgs);
    
    await cache.put("logs.json", new Response(JSON.stringify(json, null, 4), {status: 200, headers: { 'Content-Type': 'application/json' }}))
}