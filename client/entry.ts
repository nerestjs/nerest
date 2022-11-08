const apps = import.meta.glob('/apps/*/index.tsx', { import: 'default' });
console.log(apps);
