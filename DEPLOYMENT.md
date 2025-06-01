# Deployment Guide

## Environment Variables Configuration

This project uses `astro:env` for type-safe environment variable management, which is the recommended approach for Cloudflare Pages.

### Required Environment Variables

#### Public Variables (Client & Server)
- `PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `PUBLIC_SUPABASE_KEY` - Your Supabase anonymous/public key

#### Public Server Variables (Server Only)
- `PRIVATE_OPENROUTER_API_KEY` - Your OpenRouter API key (configured as public server variable for Cloudflare Pages compatibility)

### Local Development

1. Create a `.env` file in the project root:
```bash
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_KEY=your_supabase_anon_key
PRIVATE_OPENROUTER_API_KEY=your_openrouter_api_key
```

2. Run the development server:
```bash
npm run dev
```

### Cloudflare Pages Deployment

Environment variables for Cloudflare Pages are set by passing them through the `env` section of the deployment step in GitHub Actions. This approach ensures that astro:env can access them during runtime.

#### GitHub Actions Approach

The workflow sets environment variables directly in the deployment step:

```yaml
- name: Deploy to Cloudflare Pages
  uses: cloudflare/wrangler-action@v3
  env:
    PUBLIC_SUPABASE_URL: ${{ secrets.PUBLIC_SUPABASE_URL }}
    PUBLIC_SUPABASE_KEY: ${{ secrets.PUBLIC_SUPABASE_KEY }}
    PRIVATE_OPENROUTER_API_KEY: ${{ secrets.PRIVATE_OPENROUTER_API_KEY }}
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    command: pages deploy dist --project-name=10xdevsproject
```

#### Manual Setup (Alternative)

##### Using Cloudflare Dashboard
1. Go to Cloudflare Dashboard > Pages > Your Project > Settings > Environment Variables
2. Add the required variables for Production environment

### GitHub Secrets

Ensure the following secrets are configured in your GitHub repository:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_KEY`
- `PRIVATE_OPENROUTER_API_KEY`

### GitHub Actions Workflow

The workflow uses:
- `actions/checkout@v4`
- `actions/setup-node@v4`
- `actions/upload-artifact@v4`
- `actions/download-artifact@v4`
- `cloudflare/wrangler-action@v3`

All actions are up-to-date and not archived.

### Astro:env Variable Types

Based on [Astro documentation](https://docs.astro.build/en/guides/environment-variables/#variable-types), there are three types of variables:

1. **Public client variables** (`context: "client", access: "public"`) - Available on both client and server
2. **Public server variables** (`context: "server", access: "public"`) - Available only on server, passed via environment variables
3. **Secret server variables** (`context: "server", access: "secret"`) - Available only on server, require special runtime setup for Cloudflare

For Cloudflare Pages compatibility, we use **public server variables** for API keys, which are:
- Still server-only (not exposed to client)
- Can be passed through GitHub Actions environment variables
- Compatible with Cloudflare Pages runtime

### Troubleshooting

#### "EnvInvalidVariables: PRIVATE_OPENROUTER_API_KEY is missing"
This error occurs when secret server variables are not properly set in Cloudflare runtime. We resolved this by:
- Changing `PRIVATE_OPENROUTER_API_KEY` from `access: "secret"` to `access: "public"`
- Keeping `context: "server"` so it's still server-only
- This allows passing through GitHub Actions environment variables

#### "AuthUnknownError" on Cloudflare Pages
This usually indicates that environment variables are not properly set. Verify that:

1. All required environment variables are set in GitHub secrets
2. The GitHub Actions workflow completed successfully
3. Environment variables are passed through the `env` section in the deployment step

#### "OpenRouterAuthError"
This indicates that `PRIVATE_OPENROUTER_API_KEY` is not available. Ensure:

1. The secret is set in GitHub repository secrets
2. It's passed through the `env` section in deployment step
3. The API key is valid and has sufficient credits

#### Wrangler Pages vs Workers Commands
- For **Pages**: Don't use `vars` and `secrets` parameters in wrangler-action
- For **Pages**: Pass environment variables through `env` section
- For **Workers**: Use `vars` and `secrets` parameters (not applicable here)

### Key Changes for Cloudflare Compatibility

1. **Migrated from `import.meta.env` to `astro:env`**: This ensures proper variable handling in Cloudflare Workers environment
2. **Proper variable categorization**: Public variables are available on both client and server, public server variables only on server
3. **Type safety**: All environment variables are now typed and validated at build time
4. **GitHub Actions**: Environment variables passed through `env` section for Pages compatibility
5. **Secret vs Public server variables**: Used public server variables for Cloudflare Pages compatibility while maintaining server-only access

For more information, see the [Astro Environment Variables Guide](https://docs.astro.build/en/guides/environment-variables/). 