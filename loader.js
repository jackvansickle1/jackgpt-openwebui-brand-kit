(function () {
  const APP_NAME = "JackGPT";
  const BRAND_VERSION = "jackgpt-20260509j";
  const asset = (path) => `${path}?v=${BRAND_VERSION}`;
  const BRAND_ASSETS = {
    css: asset("/static/custom.css"),
    logo: asset("/static/logo.png"),
    favicon: asset("/static/favicon.png"),
    favicon96: asset("/static/favicon-96x96.png"),
    faviconIco: asset("/static/favicon.ico"),
    faviconSvg: asset("/static/favicon.svg"),
    appleTouchIcon: asset("/static/apple-touch-icon.png"),
    manifest: asset("/manifest.json"),
    splash: asset("/static/splash.png"),
    splashDark: asset("/static/splash-dark.png"),
    user: asset("/static/user.png")
  };

  const PUBLIC_NAME_PATTERNS = [
    [/Open WebUI/g, APP_NAME],
    [/OpenWebUI/g, APP_NAME],
    [/Open Web UI/g, APP_NAME],
    [/Open Web-UI/g, APP_NAME],
    [/open-webui/g, "jackgpt"]
  ];

  const rewriteText = (value) => {
    if (typeof value !== "string") return value;
    return PUBLIC_NAME_PATTERNS.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
  };

  const ensureLink = (selector, attrs) => {
    let link = document.head.querySelector(selector);
    if (!link) {
      link = document.createElement("link");
      document.head.appendChild(link);
    }
    for (const [key, value] of Object.entries(attrs)) link.setAttribute(key, value);
  };

  const ensureBrandHead = () => {
    document.title = APP_NAME;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#05070f");
    const existingBrandCss = document.head.querySelector('link[href*="/static/custom.css"]');
    if (existingBrandCss) {
      existingBrandCss.setAttribute("href", BRAND_ASSETS.css);
      existingBrandCss.setAttribute("data-jackgpt-css", "true");
      existingBrandCss.setAttribute("crossorigin", "use-credentials");
      document.head.appendChild(existingBrandCss);
    } else {
      ensureLink('link[data-jackgpt-css="true"]', {
        rel: "stylesheet",
        href: BRAND_ASSETS.css,
        "data-jackgpt-css": "true",
        crossorigin: "use-credentials"
      });
    }
    ensureLink('link[rel="icon"][type="image/png"]:not([sizes])', {
      rel: "icon",
      type: "image/png",
      href: BRAND_ASSETS.favicon,
      crossorigin: "use-credentials"
    });
    ensureLink('link[rel="icon"][sizes="96x96"]', {
      rel: "icon",
      type: "image/png",
      sizes: "96x96",
      href: BRAND_ASSETS.favicon96,
      crossorigin: "use-credentials"
    });
    ensureLink('link[rel="icon"][type="image/svg+xml"]', {
      rel: "icon",
      type: "image/svg+xml",
      href: BRAND_ASSETS.faviconSvg,
      crossorigin: "use-credentials"
    });
    ensureLink('link[rel="shortcut icon"]', {
      rel: "shortcut icon",
      href: BRAND_ASSETS.faviconIco,
      crossorigin: "use-credentials"
    });
    ensureLink('link[rel="apple-touch-icon"]', {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: BRAND_ASSETS.appleTouchIcon,
      crossorigin: "use-credentials"
    });
    ensureLink('link[rel="manifest"]', {
      rel: "manifest",
      href: BRAND_ASSETS.manifest,
      crossorigin: "use-credentials"
    });
  };

  const originalFetch = window.fetch.bind(window);
  window.fetch = async function jackgptFetch(input, init) {
    const response = await originalFetch(input, init);
    try {
      const url = new URL(typeof input === "string" ? input : input.url, window.location.href);
      if (url.pathname === "/api/config") {
        const data = await response.clone().json();
        data.name = APP_NAME;
        if (data.features) {
          data.features.enable_easter_eggs = false;
          data.features.enable_public_active_users_count = false;
        }
        const headers = new Headers(response.headers);
        headers.set("content-type", "application/json");
        return new Response(JSON.stringify(data), {
          status: response.status,
          statusText: response.statusText,
          headers
        });
      }
    } catch {
      return response;
    }
    return response;
  };

  const rewriteElementTextAndAttrs = () => {
    const selector = [
      "title",
      "[title]",
      "[aria-label]",
      "[placeholder]",
      "[alt]",
      "h1",
      "h2",
      "h3",
      "h4",
      "p",
      "span",
      "a",
      "button",
      "label",
      "small",
      "strong",
      "em",
      '[role="heading"]'
    ].join(",");

    let count = 0;
    document.querySelectorAll(selector).forEach((element) => {
      count += 1;
      if (count > 2500) return;

      for (const attr of ["title", "aria-label", "placeholder", "alt"]) {
        if (!element.hasAttribute?.(attr)) continue;
        const current = element.getAttribute(attr);
        const next = rewriteText(current);
        if (next !== current) element.setAttribute(attr, next);
      }

      if (element.childNodes.length === 1 && element.firstChild?.nodeType === Node.TEXT_NODE) {
        const current = element.textContent;
        const next = rewriteText(current);
        if (next !== current) element.textContent = next;
      }
    });
  };

  const looksLikeOpenWebUIAsset = (url) =>
    /open[-_ ]?web[-_ ]?ui|\/static\/(logo|favicon|splash|user)|\/favicon\.(ico|png|svg)|\/logo\.png|\/user\.png/i.test(url);

  const rewriteBrandImages = () => {
    document.querySelectorAll("img,source,image").forEach((element) => {
      const src = element.getAttribute("src") || element.getAttribute("href") || "";
      const current = src.split("?")[0];
      if (!current || !looksLikeOpenWebUIAsset(current)) return;

      let next = BRAND_ASSETS.logo;
      if (/favicon/i.test(current)) next = BRAND_ASSETS.favicon;
      if (/splash-dark/i.test(current)) next = BRAND_ASSETS.splashDark;
      else if (/splash/i.test(current)) next = BRAND_ASSETS.splash;
      if (/user/i.test(current)) next = BRAND_ASSETS.user;

      if (element.getAttribute("src") && element.getAttribute("src") !== next) element.setAttribute("src", next);
      if (element.getAttribute("href") && element.getAttribute("href") !== next) element.setAttribute("href", next);
      if (element.hasAttribute("alt")) element.setAttribute("alt", rewriteText(element.getAttribute("alt")) || APP_NAME);
    });
  };

  const tagJackGPTControls = () => {
    document.querySelectorAll("textarea, [role='textbox'], [contenteditable='true']").forEach((element) => {
      element.classList.add("jackgpt-editor-surface");
      element.style.setProperty("background", "transparent", "important");
      element.style.setProperty("border", "0", "important");
      element.style.setProperty("box-shadow", "none", "important");
      const shell = element.closest("form") || element.parentElement?.closest("div");
      shell?.classList.add("jackgpt-composer-surface");
    });

    document.querySelectorAll("button").forEach((button) => {
      const label = [button.getAttribute("aria-label"), button.getAttribute("title"), button.textContent]
        .filter(Boolean)
        .join(" ");
      button.classList.remove("jackgpt-send-button");
      const className = String(button.className || "");
      const composerPrimary = !!button.closest(".jackgpt-composer-surface") && /bg-black|dark:bg-white|text-white/.test(className);
      const primaryRoundButton = /rounded-full/.test(className) && /bg-black|dark:bg-white|text-white/.test(className);
      if (
        (/(send|submit)/i.test(label) || composerPrimary || primaryRoundButton) &&
        !/(voice|mic|audio|record|upload|attach|file)/i.test(label)
      ) {
        button.classList.add("jackgpt-send-button");
        button.style.setProperty("background", "linear-gradient(135deg, rgba(107, 228, 255, 0.95), rgba(103, 247, 190, 0.85))", "important");
        button.style.setProperty("border-color", "rgba(176, 246, 255, 0.48)", "important");
        button.style.setProperty("color", "#03101a", "important");
        button.style.setProperty("box-shadow", "0 12px 30px rgba(80, 210, 220, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.34)", "important");
      }
    });
  };

  const dismissUpstreamReleaseModal = () => {
    document.querySelectorAll('dialog, [role="dialog"], .modal').forEach((dialog) => {
      const text = dialog.textContent || "";
      if (!/Release Notes|What's New|v0\.8\./i.test(text)) return;
      dialog.classList.add("jackgpt-release-notes-hidden");
      const action = [...dialog.querySelectorAll("button")].find((button) =>
        /Okay|Let's Go|Close|Dismiss/i.test(button.textContent || button.getAttribute("aria-label") || "")
      );
      action?.click();
    });
  };

  const cleanFooterVersion = () => {
    document.querySelectorAll("a,span,div,p").forEach((element) => {
      const text = (element.textContent || "").replace(/\s+/g, " ").trim();
      if (text.length < 80 && /^JackGPT.*v\d+\.\d+(\.\d+)?$/i.test(text)) {
        element.classList.add("jackgpt-version-footer-hidden");
        element.style.setProperty("display", "none", "important");
      }
    });
  };

  const addBrandBadge = () => {
    if (document.querySelector(".jackgpt-brand-badge")) return;
    const badge = document.createElement("div");
    badge.className = "jackgpt-brand-badge";
    badge.textContent = "JackGPT Secure AI Workspace";
    document.body.appendChild(badge);
  };

  const clearStaleBrandingCaches = () => {
    if (localStorage.jackgptBrandVersion === BRAND_VERSION) return;
    localStorage.jackgptBrandVersion = BRAND_VERSION;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations?.().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      }).catch(() => {});
    }
    if ("caches" in window) {
      caches.keys?.().then((keys) => {
        keys.forEach((key) => {
          if (/open|webui|svelte|workbox|jackgpt/i.test(key)) caches.delete(key);
        });
      }).catch(() => {});
    }
  };

  const brandSweep = () => {
    localStorage.theme = "dark";
    document.documentElement.classList.add("dark", "jackgpt-branded");
    document.documentElement.classList.remove("light", "her");
    ensureBrandHead();
    rewriteElementTextAndAttrs();
    rewriteBrandImages();
    tagJackGPTControls();
    dismissUpstreamReleaseModal();
    cleanFooterVersion();
    addBrandBadge();
  };

  const boot = () => {
    clearStaleBrandingCaches();
    brandSweep();
    [700, 1800, 4200, 9000].forEach((delay) => window.setTimeout(brandSweep, delay));
    let sweepCount = 0;
    const sweepInterval = window.setInterval(() => {
      brandSweep();
      sweepCount += 1;
      if (sweepCount >= 40) window.clearInterval(sweepInterval);
    }, 3000);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
