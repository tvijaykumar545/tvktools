// Frontend tool implementations
export const runFrontendTool = (toolId: string, input: string): string => {
  switch (toolId) {
    case "json-formatter":
      return jsonFormatter(input);
    case "json-validator":
      return jsonValidator(input);
    case "base64-encoder":
      return base64Encoder(input);
    case "base64-decoder":
      return base64Decoder(input);
    case "jwt-decoder":
      return jwtDecoder(input);
    case "word-counter":
      return wordCounter(input);
    case "text-case":
      return textCaseConverter(input);
    case "uuid-generator":
      return uuidGenerator();
    case "password-generator":
      return passwordGenerator(input);
    case "url-encoder":
      return urlEncoder(input);
    case "url-decoder":
      return urlDecoder(input);
    case "random-number":
      return randomNumber(input);
    case "secret-keys":
      return secretKeysGenerator(input);
    case "hash-generator":
      return hashGenerator(input);
    case "html-minifier":
      return htmlMinifier(input);
    case "css-minifier":
      return cssMinifier(input);
    case "js-minifier":
      return jsMinifier(input);
    case "timestamp-converter":
      return timestampConverter(input);
    case "keyword-density":
      return keywordDensity(input);
    case "meta-tag-generator":
      return metaTagGenerator(input);
    case "serp-preview":
      return serpPreview(input);
    default:
      return "This tool uses AI processing. Click Run Tool to generate results.";
  }
};

function jsonFormatter(input: string): string {
  try {
    return JSON.stringify(JSON.parse(input), null, 2);
  } catch {
    return "Error: Invalid JSON input";
  }
}

function jsonValidator(input: string): string {
  try {
    JSON.parse(input);
    return "✅ Valid JSON!\n\n" + JSON.stringify(JSON.parse(input), null, 2);
  } catch (e: any) {
    return `❌ Invalid JSON\n\nError: ${e.message}`;
  }
}

function base64Encoder(input: string): string {
  try {
    return btoa(input);
  } catch {
    return "Error: Could not encode input";
  }
}

function base64Decoder(input: string): string {
  try {
    return atob(input.trim());
  } catch {
    return "Error: Invalid Base64 string";
  }
}

function jwtDecoder(input: string): string {
  try {
    const parts = input.trim().split(".");
    if (parts.length !== 3) return "Error: Invalid JWT format (expected 3 parts)";
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    return `Header:\n${JSON.stringify(header, null, 2)}\n\nPayload:\n${JSON.stringify(payload, null, 2)}\n\nSignature: ${parts[2].substring(0, 20)}...`;
  } catch {
    return "Error: Could not decode JWT";
  }
}

function wordCounter(input: string): string {
  const text = input.trim();
  if (!text) return "Enter text to analyze";
  const words = text.split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, "").length;
  const sentences = text.split(/[.!?]+/).filter(Boolean).length;
  const paragraphs = text.split(/\n\n+/).filter(Boolean).length;
  const readTime = Math.ceil(words / 200);
  return `📊 Text Analysis\n\nWords: ${words}\nCharacters: ${chars}\nCharacters (no spaces): ${charsNoSpace}\nSentences: ${sentences}\nParagraphs: ${paragraphs}\nReading time: ~${readTime} min`;
}

function textCaseConverter(input: string): string {
  return `UPPERCASE:\n${input.toUpperCase()}\n\nlowercase:\n${input.toLowerCase()}\n\nTitle Case:\n${input.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase())}\n\nsentence case:\n${input.charAt(0).toUpperCase() + input.slice(1).toLowerCase()}\n\ncamelCase:\n${input.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())}\n\nsnake_case:\n${input.toLowerCase().replace(/\s+/g, "_")}`;
}

function uuidGenerator(): string {
  const uuids = Array.from({ length: 5 }, () =>
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    })
  );
  return uuids.join("\n");
}

function passwordGenerator(input: string): string {
  const length = Math.min(Math.max(parseInt(input) || 16, 8), 128);
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  const passwords = Array.from({ length: 5 }, () =>
    Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  );
  return `Generated ${passwords.length} passwords (length: ${length}):\n\n${passwords.join("\n")}`;
}

function urlEncoder(input: string): string {
  return encodeURIComponent(input);
}

function urlDecoder(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    return "Error: Invalid encoded URL";
  }
}

function randomNumber(input: string): string {
  const parts = input.split(/[,\-\s]+/).map(Number);
  const min = parts[0] || 1;
  const max = parts[1] || 100;
  const nums = Array.from({ length: 10 }, () => Math.floor(Math.random() * (max - min + 1)) + min);
  return `Range: ${min} - ${max}\n\nGenerated numbers:\n${nums.join(", ")}`;
}

function secretKeysGenerator(input: string): string {
  const length = parseInt(input) || 32;
  const hex = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  return `🔑 Secret Keys (length: ${length})\n\nHex: ${hex(length)}\nBase64: ${btoa(hex(length / 2)).substring(0, length)}\nAlphanumeric: ${Array.from({ length }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 62)]).join("")}\nURL-safe: ${Array.from({ length }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"[Math.floor(Math.random() * 64)]).join("")}`;
}

function hashGenerator(input: string): string {
  // Simple hash implementations for demo
  const simpleHash = (str: string, mod: number) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash).toString(16).padStart(mod, "0");
  };
  return `Hash results for: "${input.substring(0, 50)}${input.length > 50 ? "..." : ""}"\n\nSimulated MD5: ${simpleHash(input, 32)}\nSimulated SHA-1: ${simpleHash(input + "sha1", 40)}\nSimulated SHA-256: ${simpleHash(input + "sha256", 64)}\n\n⚠️ Note: These are simulated hashes for demo. Connect n8n for cryptographic hashes.`;
}

function htmlMinifier(input: string): string {
  return input.replace(/\s+/g, " ").replace(/>\s+</g, "><").replace(/<!--[\s\S]*?-->/g, "").trim();
}

function cssMinifier(input: string): string {
  return input.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{}:;,])\s*/g, "$1").trim();
}

function jsMinifier(input: string): string {
  return input.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{}();,=+\-*/<>!&|?:])\s*/g, "$1").trim();
}

function timestampConverter(input: string): string {
  const num = parseInt(input);
  if (!isNaN(num)) {
    const d = num > 1e12 ? new Date(num) : new Date(num * 1000);
    return `Timestamp: ${input}\n\nISO 8601: ${d.toISOString()}\nUTC: ${d.toUTCString()}\nLocal: ${d.toLocaleString()}\nUnix (s): ${Math.floor(d.getTime() / 1000)}\nUnix (ms): ${d.getTime()}`;
  }
  const d = new Date(input);
  if (isNaN(d.getTime())) return "Enter a valid timestamp or date string";
  return `Date: ${input}\n\nISO 8601: ${d.toISOString()}\nUnix (s): ${Math.floor(d.getTime() / 1000)}\nUnix (ms): ${d.getTime()}\nUTC: ${d.toUTCString()}`;
}

function keywordDensity(input: string): string {
  const words = input.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "Enter text to analyze keyword density";
  const freq: Record<string, number> = {};
  words.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 20);
  return `📊 Keyword Density Analysis\nTotal words: ${words.length}\n\n${sorted.map(([word, count]) => `${word}: ${count} (${((count / words.length) * 100).toFixed(1)}%)`).join("\n")}`;
}

function metaTagGenerator(input: string): string {
  const lines = input.split("\n").filter(Boolean);
  const title = lines[0] || "Page Title";
  const desc = lines[1] || "Page description goes here";
  const keywords = lines[2] || "keyword1, keyword2";
  return `<title>${title}</title>\n<meta name="description" content="${desc}" />\n<meta name="keywords" content="${keywords}" />\n<meta property="og:title" content="${title}" />\n<meta property="og:description" content="${desc}" />\n<meta property="og:type" content="website" />\n<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:title" content="${title}" />\n<meta name="twitter:description" content="${desc}" />`;
}

function serpPreview(input: string): string {
  const lines = input.split("\n").filter(Boolean);
  const title = (lines[0] || "Page Title").substring(0, 60);
  const url = lines[1] || "https://example.com/page";
  const desc = (lines[2] || "Page description goes here").substring(0, 160);
  return `🔍 SERP Preview\n\n┌─────────────────────────────────────┐\n│ ${title}${title.length >= 60 ? "..." : ""}│\n│ ${url}                               │\n│ ${desc}${desc.length >= 160 ? "..." : ""}│\n└─────────────────────────────────────┘\n\nTitle length: ${title.length}/60 ${title.length > 60 ? "⚠️ Too long" : "✅"}\nDescription length: ${desc.length}/160 ${desc.length > 160 ? "⚠️ Too long" : "✅"}`;
}

export const getToolPlaceholder = (toolId: string): string => {
  const placeholders: Record<string, string> = {
    "json-formatter": '{"name": "TVK Tools", "version": 1}',
    "json-validator": '{"key": "value"}',
    "base64-encoder": "Hello, World!",
    "base64-decoder": "SGVsbG8sIFdvcmxkIQ==",
    "jwt-decoder": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    "word-counter": "Paste your text here to count words, characters, sentences, and more.",
    "text-case": "convert this text to different cases",
    "uuid-generator": "Click Run to generate UUIDs",
    "password-generator": "16",
    "url-encoder": "https://example.com/path?query=hello world&foo=bar",
    "url-decoder": "https%3A%2F%2Fexample.com%2Fpath%3Fquery%3Dhello%20world",
    "random-number": "1, 100",
    "secret-keys": "32",
    "hash-generator": "Hello, World!",
    "html-minifier": "<div>\n  <p>Hello   World</p>\n  <!-- comment -->\n</div>",
    "css-minifier": "body {\n  margin: 0;\n  padding: 0;\n  /* reset */\n}",
    "js-minifier": "function hello() {\n  // greeting\n  console.log('Hello');\n}",
    "timestamp-converter": "1700000000",
    "keyword-density": "Paste your article or blog post content here to analyze keyword density and frequency.",
    "meta-tag-generator": "My Page Title\nA description of my page for search engines\nkeyword1, keyword2, keyword3",
    "serp-preview": "My Amazing Page Title\nhttps://example.com/page\nThis is the meta description that will appear in Google search results.",
  };
  return placeholders[toolId] || "Enter your input here...";
};

export const getToolFaq = (toolId: string): { q: string; a: string }[] => {
  const defaultFaq = [
    { q: "Is this tool free?", a: "Basic usage is free. Pro features require a subscription." },
    { q: "Is my data safe?", a: "We don't store any data you input. All processing is done securely." },
    { q: "Can I use this via API?", a: "Yes! Check our API documentation for programmatic access." },
  ];
  return defaultFaq;
};
