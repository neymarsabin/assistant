## Assistant
This is an personal project that adds a personal prompt to my portfolio website and respond to commands based on the contents of my portfolio website. This project uses the **ChatGpt Assistant** feature.

### Services
There are multiple services working.
- **The Parser** -> a ruby sinatra service that parses my portfolio website based on the sitemap and responds with URL and its contents upon HTTP requests. 
- **trigger.dev** -> a background job processor that has jobs to get data from the parser and upload thom into the ChatGPT Assistant API
- **the API** -> the API service is responsible for fetching data from the database and scheduled trigger.dev background jobs

## Getting Started
To run the API server:
```bash
npm run dev
```

To run the parser service:
```bash
cd scraper && ruby main.rb
```

To run the trigger.dev background processor:
```bash
npx @trigger.dev/cli@latest dev
```
