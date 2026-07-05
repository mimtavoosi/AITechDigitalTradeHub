import DOMPurify from "dompurify";

const allowedTags = [
  "a", "b", "blockquote", "br", "code", "div", "em", "font", "h1", "h2",
  "i", "img", "li", "ol", "p", "pre", "span", "strike", "strong", "u", "ul"
];

const allowedAttributes = ["href", "src", "alt", "title", "dir", "style", "target", "rel"];

export function sanitizeRichHtml(html: string) {
  if (!html || typeof window === "undefined") return "";

  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    ALLOW_DATA_ATTR: false
  });

  const template = document.createElement("template");
  template.innerHTML = sanitized;

  template.content.querySelectorAll<HTMLElement>("[style]").forEach((element) => {
    const safeStyle = sanitizeStyle(element.getAttribute("style") ?? "");
    if (safeStyle) element.setAttribute("style", safeStyle);
    else element.removeAttribute("style");
  });

  template.content.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((anchor) => {
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
  });

  return template.innerHTML;
}

function sanitizeStyle(style: string) {
  return style
    .split(";")
    .map((rule) => rule.trim())
    .filter((rule) => {
      const separator = rule.indexOf(":");
      if (separator < 1) return false;

      const property = rule.slice(0, separator).trim().toLowerCase();
      const value = rule.slice(separator + 1).trim().toLowerCase();
      if (!value || value.includes("url(") || value.includes("expression(")) return false;
      return ["color", "background-color", "text-align"].includes(property);
    })
    .join("; ");
}
