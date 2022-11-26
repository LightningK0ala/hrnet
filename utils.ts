export function dateFormat(timestamp: number, lang = "en", country = "UK") {
  const dateTimeFormatter = new Intl.DateTimeFormat(`${lang}-${country}`, {
    dateStyle: "short",
    timeStyle: "short",
    hour12: false,
  });

  return dateTimeFormatter.format(new Date(timestamp)).split(",").join("");
}

export function truncatePubkey(pubkey: string) {
  const first = pubkey.slice(0, 3);
  const last = pubkey.slice(-3);
  return `${first}...${last}`;
}

export function getRoboHashUrl(pubkey: string) {
  return `https://robohash.org/${pubkey}?bgset=bg1`;
}

export function getTitle(value) {
  return "Hrnet: `${value}";
}
