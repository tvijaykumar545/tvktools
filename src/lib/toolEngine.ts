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
    case "readability-checker":
      return readabilityChecker(input);
    case "slug-generator":
      return slugGenerator(input);
    case "open-graph-generator":
      return openGraphGenerator(input);
    case "regex-tester":
      return regexTester(input);
    case "json-to-csv":
      return jsonToCsv(input);
    case "csv-to-json":
      return csvToJson(input);
    case "color-converter":
      return colorConverter(input);
    case "markdown-preview":
      return markdownPreview(input);
    case "sql-formatter":
      return sqlFormatter(input);
    case "lorem-ipsum":
      return loremIpsumGenerator(input);
    case "diff-checker":
      return diffChecker(input);
    case "emoji-picker":
      return emojiSearch(input);
    case "ip-lookup":
      return ipLookup(input);
    case "unit-converter":
      return unitConverter(input);
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
  return `Hash results for: "${input.substring(0, 50)}${input.length > 50 ? "..." : ""}"\n\nSimulated MD5: ${simpleHash(input, 32)}\nSimulated SHA-1: ${simpleHash(input + "sha1", 40)}\nSimulated SHA-256: ${simpleHash(input + "sha256", 64)}\n\n⚠️ Note: These are simulated hashes for demo purposes.`;
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

function readabilityChecker(input: string): string {
  const text = input.trim();
  if (!text) return "Enter text to analyze readability";
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const words = text.split(/\s+/).filter(Boolean);
  const syllables = words.reduce((acc, w) => acc + Math.max(1, w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").match(/[aeiouy]{1,2}/g)?.length || 1), 0);
  const avgWordsPerSentence = words.length / (sentences.length || 1);
  const avgSyllablesPerWord = syllables / (words.length || 1);
  const fleschScore = Math.round(206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord);
  const grade = Math.round(0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59);
  let level = "Very Easy";
  if (fleschScore < 30) level = "Very Difficult";
  else if (fleschScore < 50) level = "Difficult";
  else if (fleschScore < 60) level = "Fairly Difficult";
  else if (fleschScore < 70) level = "Standard";
  else if (fleschScore < 80) level = "Fairly Easy";
  else if (fleschScore < 90) level = "Easy";
  return `📖 Readability Analysis\n\nFlesch Reading Ease: ${fleschScore}/100 (${level})\nGrade Level: ${grade}\nSentences: ${sentences.length}\nWords: ${words.length}\nAvg words/sentence: ${avgWordsPerSentence.toFixed(1)}\nAvg syllables/word: ${avgSyllablesPerWord.toFixed(1)}`;
}

function slugGenerator(input: string): string {
  const slug = input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "");
  return `URL Slug:\n${slug}\n\nFull URL example:\nhttps://example.com/${slug}`;
}

function openGraphGenerator(input: string): string {
  const lines = input.split("\n").filter(Boolean);
  const title = lines[0] || "Page Title";
  const desc = lines[1] || "Page description";
  const url = lines[2] || "https://example.com";
  const img = lines[3] || "https://example.com/og-image.jpg";
  return `<meta property="og:title" content="${title}" />\n<meta property="og:description" content="${desc}" />\n<meta property="og:url" content="${url}" />\n<meta property="og:image" content="${img}" />\n<meta property="og:type" content="website" />\n<meta property="og:site_name" content="${title}" />\n\n<!-- Twitter Card -->\n<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:title" content="${title}" />\n<meta name="twitter:description" content="${desc}" />\n<meta name="twitter:image" content="${img}" />`;
}

function regexTester(input: string): string {
  const lines = input.split("\n");
  const pattern = lines[0] || "";
  const testStr = lines.slice(1).join("\n") || "";
  if (!pattern) return "Line 1: regex pattern\nLine 2+: test string";
  try {
    const regex = new RegExp(pattern, "g");
    const matches = testStr.match(regex);
    return `Pattern: /${pattern}/g\nTest string: "${testStr}"\n\n${matches ? `✅ ${matches.length} match(es):\n${matches.map((m, i) => `  ${i + 1}. "${m}"`).join("\n")}` : "❌ No matches found"}`;
  } catch (e: any) {
    return `❌ Invalid regex: ${e.message}`;
  }
}

function jsonToCsv(input: string): string {
  try {
    const data = JSON.parse(input);
    const arr = Array.isArray(data) ? data : [data];
    if (arr.length === 0) return "Empty array";
    const headers = Object.keys(arr[0]);
    const csv = [headers.join(","), ...arr.map((row) => headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    return csv;
  } catch {
    return "Error: Invalid JSON input. Provide a JSON array of objects.";
  }
}

function csvToJson(input: string): string {
  const lines = input.trim().split("\n");
  if (lines.length < 2) return "Error: CSV needs at least a header row and one data row";
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const result = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ""; });
    return obj;
  });
  return JSON.stringify(result, null, 2);
}

function colorConverter(input: string): string {
  const hex = input.trim().replace("#", "");
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
    const max = Math.max(r, g, b) / 255, min = Math.min(r, g, b) / 255;
    const l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r / 255) h = ((g / 255 - b / 255) / d + (g < b ? 6 : 0)) * 60;
      else if (max === g / 255) h = ((b / 255 - r / 255) / d + 2) * 60;
      else h = ((r / 255 - g / 255) / d + 4) * 60;
    }
    return `🎨 Color Conversion\n\nHEX: #${hex.toUpperCase()}\nRGB: rgb(${r}, ${g}, ${b})\nHSL: hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)\nCSS: color: #${hex};`;
  }
  const rgbMatch = input.match(/(\d+)\s*,?\s*(\d+)\s*,?\s*(\d+)/);
  if (rgbMatch) {
    const [, rs, gs, bs] = rgbMatch;
    const r = parseInt(rs), g = parseInt(gs), b = parseInt(bs);
    const hexVal = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    return `🎨 Color Conversion\n\nHEX: #${hexVal}\nRGB: rgb(${r}, ${g}, ${b})\nCSS: color: #${hexVal};`;
  }
  return "Enter a HEX color (#FF5733) or RGB values (255, 87, 51)";
}

function markdownPreview(input: string): string {
  return input
    .replace(/^### (.+)$/gm, "═══ $1 ═══")
    .replace(/^## (.+)$/gm, "══ $1 ══")
    .replace(/^# (.+)$/gm, "═ $1 ═")
    .replace(/\*\*(.+?)\*\*/g, "[$1]")
    .replace(/\*(.+?)\*/g, "_${1}_")
    .replace(/`(.+?)`/g, "「$1」")
    .replace(/^- (.+)$/gm, "  • $1")
    .replace(/^\d+\. (.+)$/gm, (_, text, offset, str) => {
      const linesBefore = str.slice(0, offset).split("\n");
      return `  ${linesBefore.length}. ${text}`;
    });
}

function sqlFormatter(input: string): string {
  const keywords = ["SELECT", "FROM", "WHERE", "AND", "OR", "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "ON", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "OFFSET", "CREATE", "TABLE", "ALTER", "DROP", "INDEX", "AS", "IN", "NOT", "NULL", "IS", "BETWEEN", "LIKE", "DISTINCT", "UNION", "ALL", "EXISTS", "CASE", "WHEN", "THEN", "ELSE", "END"];
  let formatted = input;
  keywords.forEach((kw) => {
    formatted = formatted.replace(new RegExp(`\\b${kw}\\b`, "gi"), kw);
  });
  formatted = formatted
    .replace(/\s+/g, " ")
    .replace(/\b(SELECT|FROM|WHERE|AND|OR|ORDER BY|GROUP BY|HAVING|LIMIT|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|SET|VALUES)\b/g, "\n$1")
    .trim();
  return formatted;
}

function loremIpsumGenerator(input: string): string {
  const count = parseInt(input) || 3;
  const sentences = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.",
    "Nulla facilisi morbi tempus iaculis urna id volutpat lacus laoreet.",
    "Amet consectetur adipiscing elit pellentesque habitant morbi tristique senectus.",
    "Viverra accumsan in nisl nisi scelerisque eu ultrices vitae auctor.",
    "Pretium quam vulputate dignissim suspendisse in est ante in nibh.",
    "Faucibus ornare suspendisse sed nisi lacus sed viverra tellus in.",
  ];
  const paragraphs = Array.from({ length: Math.min(count, 10) }, (_, i) => {
    const start = i % sentences.length;
    return Array.from({ length: 3 + Math.floor(Math.random() * 3) }, (_, j) => sentences[(start + j) % sentences.length]).join(" ");
  });
  return paragraphs.join("\n\n");
}

function diffChecker(input: string): string {
  const parts = input.split("---");
  if (parts.length < 2) return "Separate two texts with --- on its own line\n\nExample:\nFirst text here\n---\nSecond text here";
  const lines1 = parts[0].trim().split("\n");
  const lines2 = parts[1].trim().split("\n");
  const maxLen = Math.max(lines1.length, lines2.length);
  let result = "📝 Text Diff\n\n";
  let diffs = 0;
  for (let i = 0; i < maxLen; i++) {
    const l1 = lines1[i] || "";
    const l2 = lines2[i] || "";
    if (l1 === l2) {
      result += `  ${i + 1}: ${l1}\n`;
    } else {
      result += `- ${i + 1}: ${l1}\n+ ${i + 1}: ${l2}\n`;
      diffs++;
    }
  }
  result += `\n${diffs} difference(s) found across ${maxLen} line(s)`;
  return result;
}

function emojiSearch(input: string): string {
  const emojis: Record<string, string[]> = {
    happy: ["😀", "😃", "😄", "😁", "😆", "😊", "🥰", "😍"],
    sad: ["😢", "😭", "😞", "😔", "🥺", "😿", "💔"],
    love: ["❤️", "💕", "💗", "💖", "💘", "😍", "🥰", "😘"],
    fire: ["🔥", "💥", "⚡", "✨", "💫", "🌟"],
    food: ["🍕", "🍔", "🍟", "🌮", "🍜", "🍣", "🍰", "🧁"],
    animal: ["🐶", "🐱", "🐻", "🦊", "🐼", "🐨", "🦁", "🐯"],
    nature: ["🌸", "🌺", "🌻", "🌿", "🍀", "🌈", "☀️", "🌙"],
    tech: ["💻", "📱", "⌨️", "🖥️", "🤖", "⚙️", "🔧", "💾"],
    money: ["💰", "💵", "💎", "🏦", "📈", "💸", "🤑"],
    travel: ["✈️", "🌍", "🗺️", "🏖️", "⛰️", "🚀", "🗽"],
    music: ["🎵", "🎶", "🎸", "🎹", "🎤", "🎧", "🥁"],
    sport: ["⚽", "🏀", "🎾", "🏈", "⚾", "🏐", "🏆"],
    hand: ["👍", "👎", "👋", "✌️", "🤞", "👊", "🤝", "👏"],
    flag: ["🏁", "🚩", "🏳️", "🏴", "🎌"],
    weather: ["☀️", "🌤️", "⛅", "🌧️", "⛈️", "❄️", "🌊"],
  };
  const query = input.toLowerCase().trim();
  if (!query) return "Type a keyword to search emojis\n\nKeywords: " + Object.keys(emojis).join(", ");
  const matches = Object.entries(emojis).filter(([key]) => key.includes(query) || query.includes(key));
  if (matches.length === 0) return `No emojis found for "${query}"\n\nTry: ${Object.keys(emojis).join(", ")}`;
  return matches.map(([cat, list]) => `${cat}:\n${list.join("  ")}`).join("\n\n");
}

function ipLookup(input: string): string {
  const ip = input.trim();
  if (!ip) return "Enter an IP address to look up";
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) return "Invalid IP address format";
  const isPrivate = (parts[0] === 10) || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || (parts[0] === 192 && parts[1] === 168);
  const isLoopback = parts[0] === 127;
  const classType = parts[0] < 128 ? "A" : parts[0] < 192 ? "B" : parts[0] < 224 ? "C" : parts[0] < 240 ? "D" : "E";
  return `🌍 IP Address: ${ip}\n\nClass: ${classType}\nType: ${isLoopback ? "Loopback" : isPrivate ? "Private" : "Public"}\nBinary: ${parts.map((p) => p.toString(2).padStart(8, "0")).join(".")}\nHex: ${parts.map((p) => p.toString(16).padStart(2, "0")).join(":").toUpperCase()}\n\n${isPrivate ? "⚠️ This is a private IP address (not routable on the internet)" : isLoopback ? "⚠️ This is a loopback address" : "✅ This is a public IP address"}`;
}

function unitConverter(input: string): string {
  const num = parseFloat(input);
  if (isNaN(num)) return "Enter a number to convert\n\nExamples: 100 (converts across common units)";
  return `📏 Unit Conversions for ${num}\n\n🌡️ Temperature:\n  ${num}°C = ${((num * 9) / 5 + 32).toFixed(2)}°F = ${(num + 273.15).toFixed(2)}K\n  ${num}°F = ${(((num - 32) * 5) / 9).toFixed(2)}°C\n\n📐 Length:\n  ${num} cm = ${(num / 2.54).toFixed(4)} in = ${(num / 30.48).toFixed(4)} ft\n  ${num} m = ${(num * 3.281).toFixed(4)} ft = ${(num * 1.094).toFixed(4)} yd\n  ${num} km = ${(num * 0.6214).toFixed(4)} mi\n\n⚖️ Weight:\n  ${num} kg = ${(num * 2.205).toFixed(4)} lb = ${(num * 35.274).toFixed(4)} oz\n  ${num} lb = ${(num * 0.4536).toFixed(4)} kg\n\n💧 Volume:\n  ${num} L = ${(num * 0.2642).toFixed(4)} gal = ${(num * 33.814).toFixed(4)} fl oz\n\n💾 Data:\n  ${num} MB = ${(num / 1024).toFixed(4)} GB = ${(num * 1024).toFixed(0)} KB`;
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
    "ai-prompt-generator": "Write a blog post about sustainable living tips",
    "ai-blog-title": "digital marketing trends 2026",
    "ai-image-prompt": "A futuristic cyberpunk city at night with neon lights",
    "ai-tweet-generator": "The benefits of remote work for developers",
    "ai-hashtag-generator": "fitness and wellness coaching",
    "ai-bio-generator": "Software engineer, 5 years experience, specializing in React and TypeScript, open source contributor",
    "ai-product-desc": "Wireless noise-cancelling headphones with 40-hour battery life, premium sound quality, comfortable memory foam ear cups",
    "ai-email-generator": "Follow up email to a client about a project proposal meeting next week",
    "ai-code-generator": "A React component that displays a countdown timer with start, pause, and reset buttons",
    "ai-chat": "What are the best practices for building a REST API?",
    "keyword-suggestions": "best coffee machines for home",
    "seo-title-generator": "Topic: healthy meal prep\nKeyword: meal prep ideas",
    "competitor-keywords": "hubspot.com",
    "seo-audit": "https://example.com - an e-commerce site selling handmade jewelry",
    "backlink-checker": "example.com",
    "domain-authority": "example.com",
    "competitor-ranking": "project management software niche",
    "smtp-tester": "smtp.gmail.com:587",
    "ai-summarizer": "Paste a long article or document here to get a concise AI-generated summary.",
    "ai-paraphraser": "The quick brown fox jumps over the lazy dog. This sentence is commonly used for typing practice.",
    "ai-story-generator": "A lonely astronaut discovers a mysterious signal from an abandoned space station",
    "ai-slogan-generator": "An eco-friendly water bottle company called HydraGreen",
    "ai-grammar-checker": "Their going to the store too by some grocerys. Me and him went yesterday to.",
    "readability-checker": "Paste your article content here to analyze its readability score and grade level.",
    "slug-generator": "How to Build a React App in 2026 - A Complete Guide!",
    "open-graph-generator": "My Amazing App\nThe best tool for developers\nhttps://myapp.com\nhttps://myapp.com/og-image.jpg",
    "regex-tester": "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}\ntest@email.com\nhello world\nuser@domain.org",
    "json-to-csv": '[{"name": "Alice", "age": 30, "city": "NYC"}, {"name": "Bob", "age": 25, "city": "LA"}]',
    "csv-to-json": "name,age,city\nAlice,30,NYC\nBob,25,LA",
    "color-converter": "#FF5733",
    "markdown-preview": "# Hello World\n\n## Subtitle\n\n**Bold text** and *italic text*\n\n- List item 1\n- List item 2\n\n`inline code`",
    "sql-formatter": "select u.name, u.email from users u left join orders o on u.id = o.user_id where u.active = true order by u.name limit 10",
    "lorem-ipsum": "3",
    "diff-checker": "Hello World\nFoo Bar\nTest Line\n---\nHello World\nFoo Baz\nNew Line",
    "emoji-picker": "happy",
    "ip-lookup": "192.168.1.1",
    "unit-converter": "100",
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

export const getToolDemoOutput = (toolId: string): string => {
  const demos: Record<string, string> = {
    "json-formatter": '{\n  "name": "TVK Tools",\n  "version": 1,\n  "features": [\n    "formatting",\n    "validation"\n  ]\n}',
    "json-validator": "✅ Valid JSON!\n\n{\n  \"key\": \"value\"\n}",
    "base64-encoder": "SGVsbG8sIFdvcmxkIQ==",
    "base64-decoder": "Hello, World!",
    "jwt-decoder": "Header:\n{\n  \"alg\": \"HS256\",\n  \"typ\": \"JWT\"\n}\n\nPayload:\n{\n  \"sub\": \"1234567890\",\n  \"name\": \"John Doe\",\n  \"iat\": 1516239022\n}\n\nSignature: SflKxwRJSMeKKF2QT4...",
    "word-counter": "📊 Text Analysis\n\nWords: 12\nCharacters: 72\nCharacters (no spaces): 61\nSentences: 1\nParagraphs: 1\nReading time: ~1 min",
    "text-case": "UPPERCASE:\nCONVERT THIS TEXT\n\nlowercase:\nconvert this text\n\nTitle Case:\nConvert This Text",
    "uuid-generator": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d\nf6e5d4c3-b2a1-4987-6543-210fedcba987\n...",
    "password-generator": "Generated 5 passwords (length: 16):\n\nxK#9mP$2vL@5nQ&8\nBw7!hR3^jF6*tY0%\n...",
    "ai-blog-title": "🎯 Blog Title Suggestions:\n\n1. \"10 Digital Marketing Trends That Will Dominate 2026\"\n2. \"The Future of Digital Marketing: What You Need to Know in 2026\"\n3. \"Digital Marketing in 2026: Strategies That Actually Work\"\n4. \"Why 2026 Will Change Digital Marketing Forever\"\n5. \"The Ultimate Guide to Digital Marketing Trends 2026\"",
    "ai-prompt-generator": "🎯 Optimized Prompt:\n\nYou are an expert content strategist. Write a comprehensive, SEO-optimized blog post about sustainable living tips...\n\n📝 Variations included...",
    "ai-image-prompt": "🎨 Image Prompt:\n\nA sprawling cyberpunk metropolis at night, bathed in vibrant neon lights of cyan, magenta, and electric blue...\n\n🎯 Style modifiers included...",
    "ai-tweet-generator": "🐦 Tweet Options:\n\n1. Remote work isn't the future — it's the present. Here's why developers who embrace it are 3x more productive 🧵\n\n2. Hot take: The office...",
    "ai-hashtag-generator": "# Trending Hashtags:\n\n#FitnessCoaching #WellnessJourney #HealthyLifestyle #FitLife #WellnessCoach\n#MindBodySoul #FitnessMotivation...",
    "ai-summarizer": "📄 Summary:\n\nThe article discusses key findings about... [AI-generated concise summary of your content will appear here]",
    "ai-paraphraser": "🔄 Paraphrased:\n\nThe nimble brown fox leaps across the sluggish canine. This particular sentence serves as a common exercise for typing practice...",
    "keyword-density": "📊 Keyword Density Analysis\nTotal words: 15\n\nkeyword: 3 (20.0%)\ncontent: 2 (13.3%)\n...",
    "meta-tag-generator": '<title>My Page Title</title>\n<meta name="description" content="A description..." />\n<meta property="og:title" content="My Page Title" />',
    "color-converter": "🎨 Color Conversion\n\nHEX: #FF5733\nRGB: rgb(255, 87, 51)\nHSL: hsl(11, 100%, 60%)\nCSS: color: #FF5733;",
    "slug-generator": "URL Slug:\nhow-to-build-a-react-app-in-2026-a-complete-guide\n\nFull URL example:\nhttps://example.com/how-to-build-a-react-app-in-2026-a-complete-guide",
    "unit-converter": "📏 Unit Conversions for 100\n\n🌡️ Temperature:\n  100°C = 212.00°F = 373.15K\n\n📐 Length:\n  100 cm = 39.3701 in...",
    "regex-tester": "Pattern: /[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}/g\n\n✅ 2 match(es):\n  1. \"test@email.com\"\n  2. \"user@domain.org\"",
  };

  // Fallback for tools without specific demo
  const fallbackByType: Record<string, string> = {
    frontend: "⚡ Instant results generated!\n\nYour processed output will appear here with formatted results, ready to copy or download.\n\n📋 Full output available after sign up...",
    backend: "🤖 AI-Generated Output:\n\nHigh-quality, context-aware results powered by advanced AI models.\n\nSign up to unlock full AI-powered generation with streaming output...",
  };

  return demos[toolId] || fallbackByType["frontend"];
};
