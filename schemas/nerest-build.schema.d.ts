/**
 * Build configuration placed as nerest/build.json in the root of the application.
 */
export interface BuildConfiguration {
  /**
   * Excludes modules from the client build and replaces them with empty modules instead.
   */
  excludes?: string[];
  /**
   * Excludes modules from the client build and maps them to globally available constants instead.
   */
  externals?: {
    [k: string]: string;
  };
  /**
   * Additional PostCSS configuration. Nerest uses the standard vite PostCSS configuration by default.
   */
  postcss?: {
    /**
     * List packages and options of PostCSS plugins to use. They will be added to the default plugin list.
     */
    plugins?: {
      [k: string]: {
        [k: string]: unknown;
      };
    };
    [k: string]: unknown;
  };
  /**
   * List of names of apps that have client side-effects, for example have their own self-initialization code that runs on import. Their entries will be loaded when hydration starts to run side-effect code.
   */
  clientSideEffects?: string[];
  [k: string]: unknown;
}
