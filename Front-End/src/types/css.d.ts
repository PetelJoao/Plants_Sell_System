declare module '*.css' {
  const content: string;
  export default content;
}

// Opcional: se você também usar CSS Modules (.module.css)
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}