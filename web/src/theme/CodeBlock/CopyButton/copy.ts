
export default function copy (text) {
  navigator.clipboard.writeText(text).catch(console.error);
}
