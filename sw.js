self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// 프로토타입은 항상 최신 GitHub Pages 리소스를 사용하며 별도 캐시를 만들지 않는다.
