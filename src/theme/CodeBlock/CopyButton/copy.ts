
export default function copy (text: string) {
  navigator.clipboard.writeText(text).catch(console.error);
}
