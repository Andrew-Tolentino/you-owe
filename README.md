## YouOwe

YouOwe is an expense tracking web application that people can use to keep tabs of expenses during group outings. Users can anonymously create Groups and invite others to join. Users within a group can add expenses they made which will appear in real-time for others in the group to see. Once the outing is over, users can see the list of expenses other users have made to know their total amount of expenses.

## Built With

- [![NextJS Logo][NEXTJS-LOGO]](https://nextjs.org/)
- [![Supabase Logo][SUPABASE-LOGO]](https://supabase.com/)
- [![Mantine Logo][MANTINE-LOGO]](https://mantine.dev/)
- [![Docker Logo][DOCKER-LOGO]](https://www.docker.com/)

## Getting Started

### Prerequisites

1. Install necessary NPM packages

```bash
npm install
```

2. Install [Docker](https://docs.docker.com/desktop/setup/install/mac-install/) based on your machine.

3. Install [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started?queryGroups=platform&platform=macos#installing-the-supabase-cli) based on your machine.

```bash
brew install supabase/tap/supabase
```

4. Make sure you fill out the enviroment variables in your `.env.sample` file and that it is referenced properly.

### Installation

1. Make sure docker is running. This is required for Supabase to build.

2. Start up the Postgres database via Supabase CLI

```bash
supabase db start
```

3. Run the NextJS development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

The web application should be accessible at [http://localhost:3000](http://localhost:3000) within your browser.

<!-- MARKDOWN LINKS & IMAGES -->

[NEXTJS-LOGO]: https://img.shields.io/badge/_-NEXT.JS-black?logo=nextdotjs
[SUPABASE-LOGO]: https://img.shields.io/badge/_-SUPABASE-67AE6E?logo=supabase
[MANTINE-LOGO]: https://img.shields.io/badge/_-MANTINE-0000ff?logo=mantine
[DOCKER-LOGO]: https://img.shields.io/badge/_-Docker-73c2fb?logo=docker
