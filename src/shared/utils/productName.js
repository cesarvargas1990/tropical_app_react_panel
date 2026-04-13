export function parseProductNameParts(value) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return {
      flavor: "",
      feature: "",
    };
  }

  const openParen = raw.indexOf("(");
  if (openParen === -1) {
    return {
      flavor: raw,
      feature: "",
    };
  }

  const closeParen = raw.indexOf(")", openParen + 1);
  if (closeParen === -1) {
    return {
      flavor: raw,
      feature: "",
    };
  }

  return {
    flavor: raw.slice(0, openParen).trim(),
    feature: raw.slice(openParen + 1, closeParen).trim(),
  };
}
