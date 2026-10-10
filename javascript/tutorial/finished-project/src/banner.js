// A fancy sign. We only load this file when someone asks for it.
export function showBanner({ name }) {
  const line = '='.repeat(name.length + 4);
  console.log(line);
  console.log(`| ${name} |`);
  console.log(line);
}
