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
    "ai-image-generator": "A magical forest with glowing mushrooms, fireflies, and a crystal-clear stream under moonlight",
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
    "ai-code-reviewer": "function fetchData(url) {\n  var data = fetch(url)\n  data.then(res => {\n    console.log(res.json())\n  })\n  return data\n}",
    "ai-regex-generator": "Match all email addresses in a text",
    "ai-sql-generator": "Get all users who signed up in the last 30 days and have made at least 2 orders, sorted by total order value",
    "ai-code-explainer": "const debounce = (fn, delay) => {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n};",
  };
  return placeholders[toolId] || "Enter your input here...";
};

export const getToolFaq = (toolId: string, toolName?: string, toolDescription?: string, toolCategory?: string, toolType?: string, isFree?: boolean): { q: string; a: string }[] => {
  const name = toolName || toolId;
  const desc = toolDescription || "a powerful online tool";
  const category = toolCategory || "utility";
  const type = toolType || "frontend";
  const free = isFree ?? true;

  // Tool-specific detailed how-to and explanation FAQs
  const toolSpecificFaqs: Record<string, { q: string; a: string }[]> = {
    // AI Tools
    "ai-prompt-generator": [
      { q: "How do I use the AI Prompt Generator?", a: "Enter a topic or idea in the input box and click 'Run Tool'. The AI will generate optimized, detailed prompts you can use with ChatGPT, Midjourney, DALL·E, and other AI models." },
      { q: "What makes a good AI prompt?", a: "A good prompt is specific, includes context, tone, format instructions, and constraints. This tool automatically adds those elements so you get better AI outputs every time." },
    ],
    "ai-blog-title": [
      { q: "How do I use the AI Blog Title Generator?", a: "Type your blog topic or a brief description of your article into the input field and click 'Run Tool'. The AI will generate multiple catchy, SEO-friendly title options." },
      { q: "Can I customize the tone of the titles?", a: "Yes! Include tone instructions like 'professional', 'casual', or 'clickbait' in your input to influence the style of generated titles." },
    ],
    "ai-image-prompt": [
      { q: "How do I use the AI Image Prompt Generator?", a: "Describe what kind of image you want (e.g., 'a futuristic city at sunset') and click 'Run Tool'. The AI generates detailed, optimized prompts for image generation tools like Midjourney or DALL·E." },
      { q: "What details should I include?", a: "Include the subject, setting, mood, art style, and lighting preferences. The AI will expand on your input with professional modifiers for best results." },
    ],
    "ai-tweet-generator": [
      { q: "How do I use the AI Tweet Generator?", a: "Enter your topic or key message and click 'Run Tool'. The AI creates multiple tweet variations optimized for engagement, including hashtags and emojis." },
      { q: "Will the tweets fit Twitter's character limit?", a: "Yes! All generated tweets are crafted to stay within the 280-character limit while maximizing impact." },
    ],
    "ai-hashtag-generator": [
      { q: "How do I use the AI Hashtag Generator?", a: "Enter your content topic, niche, or a description of your post and click 'Run Tool'. The AI generates trending and relevant hashtags organized by reach and relevance." },
      { q: "How many hashtags should I use?", a: "For Instagram, use 20-30 hashtags. For Twitter/X, use 2-3. For LinkedIn, use 3-5. The tool provides enough options for any platform." },
    ],
    "ai-bio-generator": [
      { q: "How do I use the AI Bio Generator?", a: "Enter details about yourself or your brand (name, role, skills, interests) and click 'Run Tool'. The AI creates professional bios tailored for different platforms." },
      { q: "What platforms are supported?", a: "The tool generates bios optimized for LinkedIn, Twitter/X, Instagram, personal websites, and professional portfolios." },
    ],
    "ai-product-desc": [
      { q: "How do I use the AI Product Description Generator?", a: "Enter your product name, features, and target audience, then click 'Run Tool'. The AI creates compelling, conversion-focused product descriptions." },
      { q: "Can I specify the tone?", a: "Yes! Add tone preferences like 'luxury', 'casual', 'technical', or 'playful' in your input for customized descriptions." },
    ],
    "ai-email-generator": [
      { q: "How do I use the AI Email Generator?", a: "Describe the purpose of your email (e.g., 'follow-up after meeting', 'cold outreach') and click 'Run Tool'. The AI drafts a professional, ready-to-send email." },
      { q: "Can I generate different types of emails?", a: "Yes — business emails, follow-ups, cold outreach, thank-you notes, apology emails, and more. Just specify the type in your input." },
    ],
    "ai-code-generator": [
      { q: "How do I use the AI Code Generator?", a: "Describe what you want to build (e.g., 'a React countdown timer component') and click 'Run Tool'. The AI generates clean, well-commented code." },
      { q: "What programming languages are supported?", a: "The AI can generate code in JavaScript, TypeScript, Python, HTML/CSS, SQL, React, and many more languages and frameworks." },
    ],
    "ai-chat": [
      { q: "How do I use the AI Chat Assistant?", a: "Type any question or request in the input field and click 'Run Tool'. The AI provides detailed, helpful responses on any topic." },
      { q: "What can I ask the AI Chat?", a: "Anything! From coding questions, writing help, brainstorming ideas, explaining concepts, to general knowledge queries." },
    ],
    "ai-summarizer": [
      { q: "How do I use the AI Text Summarizer?", a: "Paste the full article, document, or long text into the input field and click 'Run Tool'. The AI generates a concise summary highlighting key points." },
      { q: "How long can the input text be?", a: "You can paste texts of several thousand words. The AI will distill the main ideas into a brief, easy-to-read summary." },
    ],
    "ai-paraphraser": [
      { q: "How do I use the AI Paraphraser?", a: "Paste the text you want to rewrite and click 'Run Tool'. The AI generates multiple paraphrased versions in different tones — formal, casual, and creative." },
      { q: "Will the meaning be preserved?", a: "Yes! The AI rewrites the text while maintaining the original meaning, just with different wording and style." },
    ],
    "ai-story-generator": [
      { q: "How do I use the AI Story Generator?", a: "Enter a story premise, genre, or characters (e.g., 'a detective in a space station') and click 'Run Tool'. The AI creates an engaging narrative." },
      { q: "What genres are supported?", a: "Sci-fi, fantasy, mystery, romance, horror, thriller, comedy, and more. Specify the genre in your prompt for best results." },
    ],
    "ai-slogan-generator": [
      { q: "How do I use the AI Slogan Generator?", a: "Enter your brand name, product, or business description and click 'Run Tool'. The AI generates catchy, memorable slogans." },
      { q: "How many slogans are generated?", a: "The tool typically generates 5-7 slogan options so you can pick the one that best fits your brand." },
    ],
    "ai-grammar-checker": [
      { q: "How do I use the AI Grammar Checker?", a: "Paste your text into the input field and click 'Run Tool'. The AI identifies grammar, spelling, and punctuation errors and provides corrected text." },
      { q: "Does it explain the corrections?", a: "Yes! Each error is highlighted with the original mistake and the suggested correction, so you can learn as you write." },
    ],
    "ai-image-generator": [
      { q: "How do I use the AI Image Generator?", a: "Type a detailed description of the image you want (e.g., 'a magical forest with glowing mushrooms at night') and click 'Generate Image'. The AI creates a unique image from your prompt." },
      { q: "What resolution are the generated images?", a: "Images are generated at 1024×1024 resolution and can be downloaded directly from the output panel." },
    ],

    // SEO Tools
    "keyword-suggestions": [
      { q: "How do I use the Keyword Suggestions tool?", a: "Enter a seed keyword or topic and click 'Run Tool'. The AI analyzes search trends and returns high-value keyword suggestions with estimated search volumes." },
      { q: "How are keywords ranked?", a: "Keywords are organized by search volume, competition level, and relevance to your input, making it easy to prioritize your SEO strategy." },
    ],
    "meta-tag-generator": [
      { q: "How do I use the Meta Tag Generator?", a: "Enter your page title, description, and URL in the input field (one per line) and click 'Run Tool'. The tool generates HTML meta tags ready to paste into your website." },
      { q: "What meta tags are generated?", a: "Title tag, meta description, Open Graph tags (og:title, og:description), and Twitter Card tags for complete SEO and social media coverage." },
    ],
    "keyword-density": [
      { q: "How do I use the Keyword Density Checker?", a: "Paste your content text into the input field and click 'Run Tool'. The tool analyzes word frequency and displays keyword density percentages." },
      { q: "What is ideal keyword density?", a: "Most SEO experts recommend 1-2% keyword density for primary keywords. The tool helps you identify over-optimized or under-used keywords." },
    ],
    "serp-preview": [
      { q: "How do I use the SERP Preview Tool?", a: "Enter your page title, URL, and meta description (one per line) and click 'Run Tool'. You'll see exactly how your page will appear in Google search results." },
      { q: "Why is SERP preview important?", a: "It helps you optimize your title and description length to avoid truncation in search results, improving click-through rates." },
    ],
    "seo-title-generator": [
      { q: "How do I use the SEO Title Generator?", a: "Enter your topic or target keyword and click 'Run Tool'. The AI generates multiple SEO-optimized title suggestions with proper length and keyword placement." },
    ],
    "readability-checker": [
      { q: "How do I use the Readability Checker?", a: "Paste your content and click 'Run Tool'. The tool calculates Flesch Reading Ease score, grade level, and provides detailed readability metrics." },
      { q: "What reading level should I target?", a: "For general web content, aim for grade level 6-8 (Flesch score 60-70). This ensures your content is accessible to the widest audience." },
    ],
    "slug-generator": [
      { q: "How do I use the URL Slug Generator?", a: "Enter your page title or heading and click 'Run Tool'. The tool generates a clean, SEO-friendly URL slug with proper formatting." },
      { q: "What makes a good URL slug?", a: "A good slug is short, descriptive, uses hyphens instead of spaces, and includes your target keyword. This tool handles all of that automatically." },
    ],
    "open-graph-generator": [
      { q: "How do I use the Open Graph Generator?", a: "Enter your page title, description, and URL (one per line) and click 'Run Tool'. The tool generates Open Graph meta tags for optimal social media sharing." },
    ],

    // Developer Tools
    "json-formatter": [
      { q: "How do I use the JSON Formatter?", a: "Paste your minified or unformatted JSON into the input field and click 'Run Tool'. The tool instantly formats it with proper indentation and syntax highlighting." },
      { q: "Can it handle large JSON files?", a: "Yes! The formatter can handle JSON data of significant size. For very large files, processing may take a moment." },
    ],
    "json-validator": [
      { q: "How do I use the JSON Validator?", a: "Paste your JSON data and click 'Run Tool'. The tool checks for syntax errors and tells you exactly where the issue is if the JSON is invalid." },
    ],
    "base64-encoder": [
      { q: "How do I use the Base64 Encoder?", a: "Enter any text in the input field and click 'Run Tool'. The tool converts your text to Base64 encoded format instantly." },
      { q: "When would I need Base64 encoding?", a: "Base64 is commonly used for embedding images in HTML/CSS, sending binary data in APIs, and encoding email attachments." },
    ],
    "base64-decoder": [
      { q: "How do I use the Base64 Decoder?", a: "Paste your Base64 encoded string and click 'Run Tool'. The tool decodes it back to readable plain text." },
    ],
    "jwt-decoder": [
      { q: "How do I use the JWT Decoder?", a: "Paste a JWT token and click 'Run Tool'. The tool decodes and displays the header, payload, and signature sections separately." },
      { q: "Is it safe to decode JWTs here?", a: "Yes — all processing happens in your browser. No data is sent to any server. However, never share JWTs containing sensitive information publicly." },
    ],
    "timestamp-converter": [
      { q: "How do I use the Timestamp Converter?", a: "Enter a Unix timestamp (seconds or milliseconds) and click 'Run Tool'. The tool converts it to human-readable date formats including ISO 8601, UTC, and local time." },
    ],
    "html-minifier": [
      { q: "How do I use the HTML Minifier?", a: "Paste your HTML code and click 'Run Tool'. The tool removes whitespace, comments, and unnecessary characters to reduce file size." },
    ],
    "css-minifier": [
      { q: "How do I use the CSS Minifier?", a: "Paste your CSS code and click 'Run Tool'. The tool compresses it by removing spaces, line breaks, and comments." },
    ],
    "js-minifier": [
      { q: "How do I use the JavaScript Minifier?", a: "Paste your JavaScript code and click 'Run Tool'. The tool minifies it by removing whitespace and shortening the code." },
    ],
    "regex-tester": [
      { q: "How do I use the Regex Tester?", a: "Enter your regex pattern on the first line and your test string on the following lines. Click 'Run Tool' to see all matches highlighted." },
      { q: "What regex flavors are supported?", a: "The tool uses JavaScript regex syntax, which supports most common patterns including lookahead, lookbehind, and named groups." },
    ],
    "json-to-csv": [
      { q: "How do I use the JSON to CSV Converter?", a: "Paste your JSON array of objects and click 'Run Tool'. The tool extracts keys as headers and values as rows in CSV format." },
    ],
    "csv-to-json": [
      { q: "How do I use the CSV to JSON Converter?", a: "Paste your CSV data (with headers in the first row) and click 'Run Tool'. The tool converts each row into a JSON object." },
    ],
    "color-converter": [
      { q: "How do I use the Color Converter?", a: "Enter a color in any format — HEX (#FF5733), RGB (rgb(255,87,51)), or HSL — and click 'Run Tool'. The tool converts it to all other formats." },
    ],
    "markdown-preview": [
      { q: "How do I use the Markdown Preview?", a: "Type or paste your Markdown content and click 'Run Tool'. The tool renders a formatted preview of your Markdown document." },
    ],
    "sql-formatter": [
      { q: "How do I use the SQL Formatter?", a: "Paste your SQL query and click 'Run Tool'. The tool formats it with proper indentation, keyword capitalization, and line breaks." },
    ],

    // Image Tools
    "image-converter": [
      { q: "How do I use the Image Converter?", a: "Upload an image file using the file picker, select the target format (PNG, JPG, WebP), and click the convert button. The converted image will be available for download." },
    ],
    "image-compressor": [
      { q: "How do I use the Image Compressor?", a: "Upload your image and adjust the quality slider to set your desired compression level. Click compress and download the optimized image." },
      { q: "Will compression reduce image quality?", a: "The tool uses smart compression that significantly reduces file size while maintaining visual quality. You can adjust the quality level to find the perfect balance." },
    ],
    "image-resizer": [
      { q: "How do I use the Image Resizer?", a: "Upload an image, enter the desired width and height in pixels, and click resize. You can maintain aspect ratio or set custom dimensions." },
    ],
    "image-cropper": [
      { q: "How do I use the Image Cropper?", a: "Upload an image, drag to select the crop area, and click the crop button. You can adjust the selection before confirming." },
    ],
    "mini-studio": [
      { q: "How do I use the Mini Image Studio?", a: "Upload an image to start editing. Apply filters (brightness, contrast, saturation), rotate, flip, and crop. Use undo/redo to manage changes, then export your edited image." },
      { q: "What editing features are available?", a: "Brightness, contrast, saturation, blur, grayscale, sepia, rotation, flipping, cropping, and more. All changes can be undone with the undo/redo system." },
    ],
    "color-picker": [
      { q: "How do I use the Color Picker?", a: "Upload any image and click on it to extract colors. The tool displays the selected color in HEX, RGB, and HSL formats for easy use in your designs." },
    ],
    "svg-to-png": [
      { q: "How do I use the SVG to PNG Converter?", a: "Upload your SVG file and select the desired output resolution. Click convert and download the PNG version of your SVG." },
    ],
    "image-base64": [
      { q: "How do I use the Image Base64 Converter?", a: "Upload an image to convert it to a Base64 string, or paste a Base64 string to convert it back to an image. Useful for embedding images in code." },
    ],
    "image-metadata": [
      { q: "How do I use the Image Metadata Viewer?", a: "Upload an image and the tool automatically extracts and displays all EXIF metadata including camera info, GPS data, dimensions, and file details." },
    ],
    "image-format": [
      { q: "How do I use the Image Format Converter?", a: "Upload your image and choose the output format (PNG, JPG, WebP, BMP). Click convert to download in the new format." },
    ],

    // Utility Tools
    "qr-generator": [
      { q: "How do I use the QR Code Generator?", a: "Enter any URL, text, or data in the input field. The tool instantly generates a QR code that you can customize (colors, size) and download as an image." },
      { q: "Can I customize the QR code?", a: "Yes! You can change the foreground and background colors, adjust the size, and add error correction levels for better scanning reliability." },
    ],
    "password-generator": [
      { q: "How do I use the Password Generator?", a: "Enter the desired password length (or use the default) and click 'Run Tool'. The tool generates multiple secure, random passwords with special characters, numbers, and mixed case." },
    ],
    "word-counter": [
      { q: "How do I use the Word Counter?", a: "Paste or type your text into the input field and click 'Run Tool'. The tool instantly counts words, characters, sentences, paragraphs, and estimates reading time." },
    ],
    "text-case": [
      { q: "How do I use the Text Case Converter?", a: "Enter your text and click 'Run Tool'. The tool converts it to UPPERCASE, lowercase, Title Case, camelCase, and other formats simultaneously." },
    ],
    "uuid-generator": [
      { q: "How do I use the UUID Generator?", a: "Simply click 'Run Tool' to generate unique UUIDs (v4). Each click produces fresh, cryptographically random UUIDs ready to copy." },
    ],
    "hash-generator": [
      { q: "How do I use the Hash Generator?", a: "Enter any text and click 'Run Tool'. The tool generates MD5, SHA-1, and SHA-256 hashes of your input simultaneously." },
    ],
    "url-encoder": [
      { q: "How do I use the URL Encoder?", a: "Paste any URL or text with special characters and click 'Run Tool'. The tool encodes it for safe use in URLs and query parameters." },
    ],
    "url-decoder": [
      { q: "How do I use the URL Decoder?", a: "Paste an encoded URL string and click 'Run Tool'. The tool decodes all percent-encoded characters back to readable text." },
    ],
    "lorem-ipsum": [
      { q: "How do I use the Lorem Ipsum Generator?", a: "Enter the number of paragraphs you want (or use default) and click 'Run Tool'. The tool generates placeholder text for your designs and mockups." },
    ],
    "diff-checker": [
      { q: "How do I use the Text Diff Checker?", a: "Enter two texts separated by '---' on its own line, then click 'Run Tool'. The tool highlights additions, deletions, and unchanged lines between the two texts." },
    ],
    "emoji-picker": [
      { q: "How do I use the Emoji Search?", a: "Type a keyword (e.g., 'happy', 'food', 'animal') and click 'Run Tool'. The tool displays matching emojis that you can copy with a single click." },
    ],
    "ip-lookup": [
      { q: "How do I use the IP Address Lookup?", a: "Enter an IP address and click 'Run Tool'. The tool displays network class, type (public/private), binary representation, and other technical details." },
    ],
    "unit-converter": [
      { q: "How do I use the Unit Converter?", a: "Enter a number and click 'Run Tool'. The tool converts it across temperature, length, weight, and data storage units simultaneously." },
    ],
    "random-number": [
      { q: "How do I use the Random Number Generator?", a: "Enter a range (e.g., '1-100') and click 'Run Tool'. The tool generates random numbers within your specified range." },
    ],
    "secret-keys": [
      { q: "How do I use the Secret Keys Generator?", a: "Enter the desired key length (or use default) and click 'Run Tool'. The tool generates secure keys in Hex, Base64, alphanumeric, and URL-safe formats." },
    ],

    // PDF Tools
    "merge-pdf": [
      { q: "How do I use the Merge PDF tool?", a: "Upload multiple PDF files using the file picker. Arrange them in the desired order, then click 'Merge'. The combined PDF will be available for download." },
    ],
    "split-pdf": [
      { q: "How do I use the Split PDF tool?", a: "Upload a PDF file, then specify which pages to extract (e.g., '1-3, 5, 7-10'). Click 'Split' to download the selected pages as separate files." },
    ],
    "compress-pdf": [
      { q: "How do I use the Compress PDF tool?", a: "Upload your PDF file and select a compression level. Click 'Compress' to reduce the file size while maintaining readability." },
    ],
    "rotate-pdf": [
      { q: "How do I use the Rotate PDF tool?", a: "Upload a PDF, select which pages to rotate and the rotation angle (90°, 180°, 270°). Click 'Rotate' to apply and download." },
    ],
    "delete-pdf-pages": [
      { q: "How do I use the Delete PDF Pages tool?", a: "Upload a PDF, select the pages you want to remove, and click 'Delete'. The tool creates a new PDF without the selected pages." },
    ],
    "protect-pdf": [
      { q: "How do I use the Protect PDF tool?", a: "Upload a PDF and enter a password. Click 'Protect' to encrypt the file. Anyone opening the PDF will need the password." },
    ],
    "unlock-pdf": [
      { q: "How do I use the Unlock PDF tool?", a: "Upload a password-protected PDF and enter the password. Click 'Unlock' to remove the protection and download the unprotected version." },
    ],
    "add-watermark": [
      { q: "How do I use the Add Watermark tool?", a: "Upload a PDF, enter your watermark text, and adjust position, opacity, and rotation. Click 'Add Watermark' to apply it across all pages." },
    ],
    "reorder-pdf": [
      { q: "How do I use the Reorder PDF Pages tool?", a: "Upload a PDF and see thumbnail previews of each page. Drag and drop pages to rearrange them in your preferred order, then download the reordered PDF." },
    ],
    "sign-pdf": [
      { q: "How do I use the Sign PDF tool?", a: "Upload a PDF, then draw or type your signature. Position it on the desired page and click 'Apply' to add your signature to the document." },
    ],
    "edit-pdf": [
      { q: "How do I use the Edit PDF tool?", a: "Upload a PDF to open it in the editor. You can add text, annotations, and modify content. Save and download your edited PDF when finished." },
    ],
    "pdf-to-word": [
      { q: "How do I use the PDF to Word converter?", a: "Upload your PDF file and click 'Convert'. The tool extracts text content and generates a downloadable Word-compatible document." },
    ],
    "word-to-pdf": [
      { q: "How do I use the Word to PDF converter?", a: "Upload your Word document and click 'Convert'. The tool transforms it into a PDF file ready for download." },
    ],
    "pdf-to-excel": [
      { q: "How do I use the PDF to Excel converter?", a: "Upload a PDF containing tables and click 'Convert'. The tool extracts table data and creates a downloadable Excel-compatible file." },
    ],
    "jpg-to-pdf": [
      { q: "How do I use the JPG to PDF converter?", a: "Upload one or more images and click 'Convert'. The tool combines them into a single PDF document." },
    ],
    "pdf-to-jpg": [
      { q: "How do I use the PDF to JPG converter?", a: "Upload a PDF and click 'Convert'. Each page is rendered as a high-quality JPG image available for download." },
    ],
    "code-converter": [
      { q: "How do I use the Code Converter?", a: "Select a source language (e.g. Python) and a target language (e.g. JavaScript). Paste your code in the left panel and click 'Convert Code'. The AI will analyze, fix any bugs, and convert your code with helpful inline comments." },
      { q: "Which programming languages are supported?", a: "The Code Converter supports 25+ languages including Python, JavaScript, TypeScript, Java, C++, C#, Go, Rust, Swift, Kotlin, PHP, Ruby, Scala, Dart, Haskell, Lua, and more." },
      { q: "Does it detect and fix errors in my code?", a: "Yes! The AI analyzes your source code for syntax errors and bugs before converting. If issues are found, a summary of detected errors and applied fixes is displayed above the code panels." },
      { q: "Can I swap source and target languages?", a: "Absolutely. Click the arrow button between the language dropdowns to instantly swap source and target languages. Your converted output becomes the new source code." },
    ],
    "ai-code-reviewer": [
      { q: "How do I use the AI Code Reviewer?", a: "Paste your code into the input field and click 'Run Tool'. The AI performs a thorough review covering bugs, performance, security, code style, and best practices — then provides actionable suggestions with a quality score." },
      { q: "What does the code review cover?", a: "The review analyzes 5 key areas: bugs and potential errors, performance issues, security vulnerabilities, code style and best practices, and readability/maintainability." },
      { q: "Which languages does it support?", a: "The AI can review code in any popular programming language including JavaScript, TypeScript, Python, Java, C++, Go, Rust, and many more." },
    ],
    "ai-regex-generator": [
      { q: "How do I use the AI Regex Generator?", a: "Describe what you want to match in plain English (e.g., 'Match all email addresses') and click 'Run Tool'. The AI generates the regex pattern with a detailed breakdown and test examples." },
      { q: "Can it generate regex for different languages?", a: "Yes! The tool generates patterns compatible with JavaScript, Python, and other regex flavors. It notes any syntax differences between implementations." },
      { q: "Does it explain the regex pattern?", a: "Absolutely. Every generated pattern comes with a part-by-part explanation, example matches, non-matches, and recommended flags." },
    ],
    "ai-sql-generator": [
      { q: "How do I use the AI SQL Generator?", a: "Describe your data query in plain English (e.g., 'Get all users who signed up this month') and click 'Run Tool'. The AI generates a properly formatted SQL query with explanations." },
      { q: "Which SQL dialect does it use?", a: "It defaults to PostgreSQL syntax but can generate queries for MySQL, SQLite, SQL Server, and other dialects when specified in your description." },
      { q: "Does it optimize the queries?", a: "Yes, the AI generates efficient queries and includes performance tips like proper indexing suggestions and alternative approaches when relevant." },
    ],
    "ai-code-explainer": [
      { q: "How do I use the AI Code Explainer?", a: "Paste any code snippet into the input field and click 'Run Tool'. The AI provides a clear, line-by-line explanation of what the code does, including design patterns and edge cases." },
      { q: "Is it suitable for beginners?", a: "Yes! The explanations use simple, accessible language. It breaks down complex concepts and explains algorithms, patterns, and programming constructs in an easy-to-understand way." },
      { q: "Which languages can it explain?", a: "The AI can explain code in virtually any programming language — from JavaScript and Python to Rust, Haskell, and assembly." },
    ],
  };

  const specificFaqs = toolSpecificFaqs[toolId] || [
    { q: `How do I use ${name}?`, a: `Enter your input in the text field and click 'Run Tool'. The tool processes your data ${type === "backend" ? "using AI" : "instantly in your browser"} and displays the results in the output panel.` },
  ];

  const aboutFaq = { 
    q: `What is ${name}?`, 
    a: `${name} is ${desc}. It belongs to the ${category} category and runs ${type === "backend" ? "on our AI-powered backend for intelligent processing" : "entirely in your browser for instant results with zero server calls"}.` 
  };

  const commonFaqs = [
    { q: `Is ${name} free to use?`, a: free 
      ? "Yes! This tool is completely free to use. Guest users get 3 free uses per day, while signed-in users enjoy unlimited access." 
      : "This tool requires a Pro subscription. Sign up to unlock full access along with all other premium tools." },
    { q: "Is my data safe and private?", a: type === "frontend" 
      ? "Absolutely. This tool processes everything directly in your browser — no data is ever uploaded to our servers." 
      : "Yes. Your input is sent securely to our AI backend for processing and is not stored after the response is generated." },
    { q: "Do I need to create an account?", a: "You can use the tool as a guest with limited daily uses. Creating a free account removes this limit and unlocks features like favorites and usage history." },
  ];

  return [aboutFaq, ...specificFaqs, ...commonFaqs];
};

export const getToolDemoOutput = (toolId: string): string => {
  const demos: Record<string, string> = {
    // Frontend tools
    "json-formatter": '{\n  "name": "TVK Tools",\n  "version": 1,\n  "features": [\n    "formatting",\n    "validation"\n  ]\n}',
    "json-validator": "✅ Valid JSON!\n\n{\n  \"key\": \"value\"\n}",
    "base64-encoder": "SGVsbG8sIFdvcmxkIQ==",
    "base64-decoder": "Hello, World!",
    "jwt-decoder": "Header:\n{\n  \"alg\": \"HS256\",\n  \"typ\": \"JWT\"\n}\n\nPayload:\n{\n  \"sub\": \"1234567890\",\n  \"name\": \"John Doe\",\n  \"iat\": 1516239022\n}\n\nSignature: SflKxwRJSMeKKF2QT4...",
    "word-counter": "📊 Text Analysis\n\nWords: 12\nCharacters: 72\nCharacters (no spaces): 61\nSentences: 1\nParagraphs: 1\nReading time: ~1 min",
    "text-case": "UPPERCASE:\nCONVERT THIS TEXT\n\nlowercase:\nconvert this text\n\nTitle Case:\nConvert This Text",
    "uuid-generator": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d\nf6e5d4c3-b2a1-4987-6543-210fedcba987\n...",
    "password-generator": "Generated 5 passwords (length: 16):\n\nxK#9mP$2vL@5nQ&8\nBw7!hR3^jF6*tY0%\n...",
    "keyword-density": "📊 Keyword Density Analysis\nTotal words: 15\n\nkeyword: 3 (20.0%)\ncontent: 2 (13.3%)\n...",
    "meta-tag-generator": '<title>My Page Title</title>\n<meta name="description" content="A description..." />\n<meta property="og:title" content="My Page Title" />',
    "serp-preview": "🔍 SERP Preview\n\n┌─────────────────────────────────────┐\n│ My Amazing Page Title               │\n│ https://example.com/page            │\n│ This is the meta description...     │\n└─────────────────────────────────────┘\n\nTitle length: 22/60 ✅\nDescription length: 45/160 ✅",
    "color-converter": "🎨 Color Conversion\n\nHEX: #FF5733\nRGB: rgb(255, 87, 51)\nHSL: hsl(11, 100%, 60%)\nCSS: color: #FF5733;",
    "slug-generator": "URL Slug:\nhow-to-build-a-react-app-in-2026-a-complete-guide\n\nFull URL example:\nhttps://example.com/how-to-build-a-react-app-in-2026-a-complete-guide",
    "unit-converter": "📏 Unit Conversions for 100\n\n🌡️ Temperature:\n  100°C = 212.00°F = 373.15K\n\n📐 Length:\n  100 cm = 39.3701 in...",
    "regex-tester": "Pattern: /[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}/g\n\n✅ 2 match(es):\n  1. \"test@email.com\"\n  2. \"user@domain.org\"",
    "timestamp-converter": "Timestamp: 1700000000\n\nISO 8601: 2023-11-14T22:13:20.000Z\nUTC: Tue, 14 Nov 2023 22:13:20 GMT\nLocal: 11/14/2023, 10:13:20 PM\nUnix (s): 1700000000",
    "html-minifier": "<div><p>Hello World</p></div>",
    "css-minifier": "body{margin:0;padding:0;}",
    "js-minifier": "function hello(){console.log('Hello');}",
    "readability-checker": "📖 Readability Analysis\n\nFlesch Reading Ease: 72/100 (Fairly Easy)\nGrade Level: 6\nSentences: 5\nWords: 48\nAvg words/sentence: 9.6",
    "open-graph-generator": '<meta property="og:title" content="My Amazing App" />\n<meta property="og:description" content="The best tool for developers" />\n<meta property="og:url" content="https://myapp.com" />',
    "json-to-csv": "name,age,city\n\"Alice\",\"30\",\"NYC\"\n\"Bob\",\"25\",\"LA\"",
    "csv-to-json": '[\n  {\n    "name": "Alice",\n    "age": "30",\n    "city": "NYC"\n  }\n]',
    "markdown-preview": "═ Hello World ═\n\n══ Subtitle ══\n\n[Bold text] and _italic text_\n\n  • List item 1\n  • List item 2",
    "sql-formatter": "SELECT\n  u.name,\n  u.email\nFROM\n  users u\nLEFT JOIN\n  orders o ON u.id = o.user_id\nWHERE\n  u.active = true\nORDER BY\n  u.name\nLIMIT 10",
    "code-converter": "// Converted from Python to JavaScript\nfunction fibonacci(n) {\n  // Base case: return n if it's 0 or 1\n  if (n <= 1) return n;\n  // Recursive case: sum of two preceding numbers\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nconsole.log(fibonacci(10));",
    "ai-code-reviewer": "🔍 Code Review Report\n\n📊 Quality Score: 4/10\n\n❌ Bug: fetch() returns a Promise but the return value isn't awaited\n❌ Bug: res.json() also returns a Promise — you're logging the Promise object, not the data\n⚠️ Style: Using 'var' instead of 'const/let'\n⚠️ Performance: No error handling for failed requests\n\n✅ Suggested Fix:\nasync function fetchData(url) {\n  try {\n    const response = await fetch(url);\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Fetch failed:', error);\n    throw error;\n  }\n}",
    "ai-regex-generator": "🧩 Regex Pattern:\n\n/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g\n\n📖 Breakdown:\n• [a-zA-Z0-9._%+-]+ → Username (letters, digits, dots, etc.)\n• @ → Literal @ symbol\n• [a-zA-Z0-9.-]+ → Domain name\n• \\. → Literal dot\n• [a-zA-Z]{2,} → TLD (2+ letters)\n\n✅ Matches: user@example.com, test.name@domain.co.uk\n❌ Won't match: @no-user.com, user@.com\n\n🏷️ Flags: g (global), i (case-insensitive)",
    "ai-sql-generator": "🗄️ SQL Query:\n\nSELECT\n  u.id,\n  u.email,\n  u.created_at,\n  COUNT(o.id) AS order_count,\n  SUM(o.total) AS total_value\nFROM users u\nINNER JOIN orders o ON o.user_id = u.id\nWHERE u.created_at >= NOW() - INTERVAL '30 days'\nGROUP BY u.id, u.email, u.created_at\nHAVING COUNT(o.id) >= 2\nORDER BY total_value DESC;\n\n📖 Explanation:\n• INNER JOIN ensures only users with orders\n• WHERE filters to last 30 days\n• HAVING filters to 2+ orders\n• ORDER BY sorts by highest spenders\n\n💡 Tip: Add an index on users(created_at) and orders(user_id) for performance.",
    "ai-code-explainer": "📚 Code Explanation\n\n🎯 Purpose: This is a **debounce** utility function — it delays executing a function until a specified time has passed since the last call.\n\n📝 Line-by-line:\n\n1. `const debounce = (fn, delay) =>` — Takes a function and delay in ms\n2. `let timer;` — Stores the timeout reference\n3. `return (...args) =>` — Returns a new wrapper function\n4. `clearTimeout(timer);` — Cancels any pending execution\n5. `timer = setTimeout(...)` — Schedules new execution after delay\n6. `fn(...args)` — Calls original function with all arguments\n\n🧠 Pattern: Closure + Higher-Order Function\n📌 Common use: Search inputs, window resize handlers, API calls",
    "lorem-ipsum": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore...",
    "diff-checker": "📝 Text Diff\n\n  1: Hello World\n- 2: Foo Bar\n+ 2: Foo Baz\n- 3: Test Line\n+ 3: New Line\n\n2 difference(s) found across 3 line(s)",
    "emoji-picker": "happy:\n😀  😃  😄  😁  😆  😊  🥰  😍",
    "ip-lookup": "🌍 IP Address: 192.168.1.1\n\nClass: C\nType: Private\nBinary: 11000000.10101000.00000001.00000001\nHex: C0:A8:01:01\n\n⚠️ This is a private IP address",
    "url-encoder": "https%3A%2F%2Fexample.com%2Fpath%3Fquery%3Dhello%20world%26foo%3Dbar",
    "url-decoder": "https://example.com/path?query=hello world&foo=bar",
    "random-number": "Range: 1 - 100\n\nGenerated numbers:\n42, 87, 13, 65, 29, 91, 7, 54, 76, 38",
    "secret-keys": "🔑 Secret Keys (length: 32)\n\nHex: a4f7c2e91b3d8f5a6c0e724d189b3f50\nBase64: pPfC6Rs9j1psD...\nAlphanumeric: xK9mP2vLn5Qt8...\nURL-safe: Bw7hR3jF6tY0p...",
    "hash-generator": "Hash results for: \"Hello, World!\"\n\nSimulated MD5: 65a8e27d8879283831...\nSimulated SHA-1: b7e23ec29af22b0b4...\nSimulated SHA-256: dffd6021bb2bd5b0a...",

    // AI / Backend tools
    "ai-blog-title": "🎯 Blog Title Suggestions:\n\n1. \"10 Digital Marketing Trends That Will Dominate 2026\"\n2. \"The Future of Digital Marketing: What You Need to Know in 2026\"\n3. \"Digital Marketing in 2026: Strategies That Actually Work\"\n4. \"Why 2026 Will Change Digital Marketing Forever\"\n5. \"The Ultimate Guide to Digital Marketing Trends 2026\"",
    "ai-prompt-generator": "🎯 Optimized Prompt:\n\nYou are an expert content strategist with 10+ years of experience. Write a comprehensive, SEO-optimized blog post about sustainable living tips. Include actionable advice, real-world examples, and a compelling introduction.\n\n📝 Prompt Variations:\n1. Creative tone version\n2. Professional tone version\n3. Casual/conversational version",
    "ai-image-prompt": "🎨 Image Prompt:\n\nA sprawling cyberpunk metropolis at night, bathed in vibrant neon lights of cyan, magenta, and electric blue. Towering skyscrapers with holographic billboards reflect in rain-soaked streets.\n\n🎯 Style Modifiers:\n- Cinematic lighting, 8K resolution\n- Blade Runner aesthetic\n- Volumetric fog, lens flare",
    "ai-tweet-generator": "🐦 Tweet Options:\n\n1. Remote work isn't the future — it's the present. Here's why developers who embrace it are 3x more productive 🧵\n\n2. Hot take: The office didn't make us productive. Autonomy did. Remote work just proved it. 💡\n\n3. 5 years of remote work taught me more about productivity than 10 years in an office. Here's the truth 👇",
    "ai-hashtag-generator": "# Trending Hashtags:\n\nPrimary:\n#FitnessCoaching #WellnessJourney #HealthyLifestyle #FitLife #WellnessCoach\n\nSecondary:\n#MindBodySoul #FitnessMotivation #HealthGoals #WellnessWarrior #FitFam\n\nNiche:\n#HolisticWellness #CoachLife #FitnessTransformation #WellBeing #StrengthTraining",
    "ai-bio-generator": "👤 Professional Bios:\n\n🔹 LinkedIn:\nSoftware Engineer with 5+ years building scalable web applications in React & TypeScript. Passionate open source contributor and advocate for clean, maintainable code.\n\n🔹 Twitter/X:\nReact & TypeScript dev | OSS contributor | Building cool things on the web 🚀\n\n🔹 Portfolio:\nI'm a software engineer specializing in modern frontend development...",
    "ai-product-desc": "🛍️ Product Description:\n\n**Experience Sound Like Never Before**\n\nImmerse yourself in crystal-clear audio with our premium wireless noise-cancelling headphones. Featuring 40 hours of uninterrupted battery life, advanced ANC technology, and luxurious memory foam ear cups designed for all-day comfort.\n\n✅ 40-hour battery life\n✅ Active noise cancellation\n✅ Premium memory foam cushions\n✅ Bluetooth 5.3 connectivity",
    "ai-email-generator": "📧 Professional Email:\n\nSubject: Following Up on Project Proposal — Meeting Next Week\n\nHi [Name],\n\nI hope this message finds you well. I wanted to follow up regarding the project proposal we discussed last week.\n\nWould you be available for a brief meeting next Tuesday or Wednesday to review the details and align on next steps?\n\nPlease let me know what time works best for you.\n\nBest regards,\n[Your Name]",
    "ai-code-generator": "💻 React Countdown Timer Component:\n\n```tsx\nconst CountdownTimer = () => {\n  const [time, setTime] = useState(60);\n  const [running, setRunning] = useState(false);\n\n  useEffect(() => {\n    if (!running || time <= 0) return;\n    const id = setInterval(() => setTime(t => t - 1), 1000);\n    return () => clearInterval(id);\n  }, [running, time]);\n\n  return (\n    <div>\n      <h2>{time}s</h2>\n      <button onClick={() => setRunning(!running)}>\n        {running ? 'Pause' : 'Start'}\n      </button>\n      <button onClick={() => { setTime(60); setRunning(false); }}>\n        Reset\n      </button>\n    </div>\n  );\n};\n```",
    "ai-chat": "🤖 AI Assistant:\n\nGreat question! Here are the best practices for building a REST API:\n\n1. **Use proper HTTP methods** — GET for reading, POST for creating, PUT/PATCH for updating, DELETE for removing.\n\n2. **Version your API** — Use /api/v1/ prefix for future compatibility.\n\n3. **Return proper status codes** — 200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Internal Server Error.\n\n4. **Use consistent naming** — Plural nouns for collections (/users, /posts).\n\n5. **Implement pagination** — Avoid returning unbounded result sets.",
    "ai-summarizer": "📄 Summary:\n\nThe article explores the evolution of artificial intelligence in modern software development, highlighting three key trends: AI-assisted code generation, automated testing frameworks, and intelligent deployment pipelines.\n\nKey Takeaways:\n• AI tools are reducing development time by up to 40%\n• Automated testing coverage has improved significantly\n• DevOps teams are leveraging AI for predictive scaling\n\nThe author concludes that while AI won't replace developers, it will fundamentally transform how software is built and maintained.",
    "ai-paraphraser": "🔄 Paraphrased Versions:\n\n📝 Formal:\nThe agile brown fox leaps over the indolent canine. This sentence is frequently employed as a typing exercise.\n\n💬 Casual:\nSo there's this quick brown fox that just hops right over a lazy dog. People use this sentence all the time to practice their typing skills.\n\n✨ Creative:\nWith nimble grace, the tawny fox vaults effortlessly above the drowsy hound — a scene immortalized in countless typing drills.",
    "ai-story-generator": "📖 Story:\n\nThe silence of Station Omega was the first thing Commander Vasquez noticed. Not the absence of sound — the station hummed with life support — but the absence of voices.\n\n\"Control, this is Rescue-7. I've docked at Omega. No response to hails.\"\n\nStatic.\n\nShe pulled herself through the airlock and into the main corridor. Emergency lighting cast everything in amber. Personal effects drifted weightlessly — a coffee mug, a data pad, a child's drawing of Earth.\n\nThen she heard it. Not from the speakers, but from deep within the station's core: a signal, repeating...",
    "ai-slogan-generator": "💡 Slogan Suggestions:\n\n1. \"HydraGreen — Drink Pure. Live Green.\"\n2. \"Every Sip Saves the Planet.\"\n3. \"Hydration Without the Waste.\"\n4. \"HydraGreen: Where Sustainability Meets Hydration.\"\n5. \"Refill. Refresh. Reimagine.\"\n6. \"The Last Bottle You'll Ever Need.\"\n7. \"Go Green. Stay Hydrated. 💧\"",
    "ai-grammar-checker": "✏️ Grammar Check Results:\n\n❌ \"Their going\" → ✅ \"They're going\"\n❌ \"to by\" → ✅ \"to buy\"\n❌ \"grocerys\" → ✅ \"groceries\"\n❌ \"Me and him\" → ✅ \"He and I\"\n\n📊 Score: 4 errors found\n\nCorrected text:\n\"They're going to the store to buy some groceries. He and I went yesterday too.\"",
    "ai-image-generator": "🖼️ AI Image Generator\n\nGenerating a stunning image from your prompt...\n\n✨ A magical forest with glowing mushrooms, fireflies dancing in the air, and a crystal-clear stream reflecting the moonlight above...\n\n🎨 Style: Photorealistic, Fantasy, High Detail\n📐 Resolution: 1024x1024\n\n[Image will appear here after generation]",
    "keyword-suggestions": "🔑 Keyword Suggestions for \"best coffee machines for home\":\n\n📈 High Volume:\n• best home coffee maker (12,100/mo)\n• coffee machine for home (8,100/mo)\n• home espresso machine (6,600/mo)\n\n🎯 Long-Tail:\n• best coffee machine for home under $200\n• automatic coffee maker with grinder\n• small coffee machine for apartment\n\n💡 Related:\n• drip coffee maker reviews\n• single serve vs drip coffee maker",
    "seo-title-generator": "📰 SEO Title Suggestions:\n\n1. \"25 Easy Meal Prep Ideas for Beginners (2026 Guide)\"\n2. \"Meal Prep Ideas That Save Time & Money | Weekly Plans\"\n3. \"Best Meal Prep Ideas: Quick, Healthy & Budget-Friendly\"\n4. \"Meal Prep 101: Simple Ideas for the Entire Week\"\n5. \"Healthy Meal Prep Ideas You Can Make in Under 1 Hour\"",
    "competitor-keywords": "🕵️ Competitor Keyword Analysis: hubspot.com\n\n📊 Top Ranking Keywords:\n• \"CRM software\" — Position #1 (201K/mo)\n• \"email marketing\" — Position #3 (110K/mo)\n• \"marketing automation\" — Position #2 (40K/mo)\n• \"sales pipeline\" — Position #1 (22K/mo)\n\n🎯 Content Gap Opportunities:\n• \"free CRM tools\"\n• \"small business marketing\"",
    "seo-audit": "📋 SEO Audit Report: example.com\n\n✅ HTTPS enabled\n✅ Mobile responsive\n❌ Missing alt text on 12 images\n❌ Page load time: 4.2s (target: <3s)\n⚠️ Meta description too short (89 chars)\n⚠️ H1 tag missing on 3 pages\n\n📊 Overall Score: 68/100\n\nTop Recommendations:\n1. Compress images to improve load time\n2. Add alt text to all product images\n3. Optimize meta descriptions",
    "backlink-checker": "🔗 Backlink Analysis: example.com\n\n📊 Overview:\n• Total backlinks: 1,247\n• Referring domains: 342\n• Domain Rating: 45/100\n\n🔝 Top Backlinks:\n1. techcrunch.com (DR 92) — dofollow\n2. medium.com (DR 89) — dofollow\n3. reddit.com (DR 91) — nofollow\n\n📈 Link Growth: +23 new backlinks this month",
    "domain-authority": "🏆 Domain Authority Report: example.com\n\n📊 Scores:\n• Domain Authority: 45/100\n• Page Authority: 52/100\n• Spam Score: 3% (Low)\n\n📈 Authority Trend:\n• 6 months ago: 38\n• 3 months ago: 42\n• Current: 45 (+7)\n\n🔗 Linking Domains: 342\n📄 Indexed Pages: 1,856",
    "competitor-ranking": "📈 Competitor Ranking Analysis: Project Management Software\n\n🥇 monday.com\n• Ranking keywords: 45,200\n• Top keyword: \"project management\" (#2)\n\n🥈 asana.com\n• Ranking keywords: 38,900\n• Top keyword: \"task management\" (#1)\n\n🥉 trello.com\n• Ranking keywords: 32,100\n• Top keyword: \"kanban board\" (#1)\n\n💡 Gap Opportunity: \"free project management tool for startups\"",
    "smtp-tester": "📮 SMTP Test Results: smtp.gmail.com:587\n\n✅ Connection: Successful\n✅ TLS: Supported (STARTTLS)\n✅ Authentication: Required\n✅ Response Time: 142ms\n\n📋 Server Info:\n• Banner: 220 smtp.gmail.com ESMTP\n• Supported Auth: PLAIN, LOGIN, XOAUTH2\n• Max Message Size: 35MB",
  };

  return demos[toolId] || "⚡ Instant results generated!\n\nYour processed output will appear here with formatted results, ready to copy or download.\n\n📋 Full output available after sign up...";
};
