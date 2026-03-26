(function () {
  function normalizeName(value) {
    return (value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function parseWishEntries(rawText) {
    return rawText
      .split(/\r?\n\s*\r?\n/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => {
        const separatorIndex = block.indexOf(":");

        if (separatorIndex === -1) {
          return null;
        }

        const name = block.slice(0, separatorIndex).trim();
        const message = block.slice(separatorIndex + 1).trim();

        if (!name || !message) {
          return null;
        }

        return {
          name,
          message,
          key: normalizeName(name),
        };
      })
      .filter(Boolean);
  }

  function buildEntries(entries) {
    return entries.map((entry) => ({
      ...entry,
      key: normalizeName(entry.name),
    }));
  }

  async function loadEntriesFromJson(url = "./wish-mock-data.json") {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Không thể đọc dữ liệu mock lời chúc.");
    }

    const buffer = await response.arrayBuffer();
    const rawText = new TextDecoder("utf-8").decode(buffer);
    const entries = JSON.parse(rawText);

    return buildEntries(entries);
  }

  async function loadWishEntries(url = "./loichuc.txt") {
    try {
      return await loadEntriesFromJson();
    } catch (error) {
      if (Array.isArray(window.WishMockEntries) && window.WishMockEntries.length) {
        return buildEntries(window.WishMockEntries);
      }
    }

    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Không thể đọc dữ liệu lời chúc.");
    }

    const buffer = await response.arrayBuffer();
    const rawText = new TextDecoder("utf-8").decode(buffer);

    return buildEntries(parseWishEntries(rawText));
  }

  function findWishByName(entries, inputName) {
    const normalizedInput = normalizeName(inputName);

    if (!normalizedInput) {
      return null;
    }

    return entries.find((entry) => entry.key === normalizedInput) || null;
  }

  window.WishData = {
    normalizeName,
    parseWishEntries,
    loadWishEntries,
    findWishByName,
  };
})();
